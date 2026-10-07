import { act, renderHook } from '@testing-library/react-native'
import type { QueueState, QueueStatus } from '../src/domain/entities/Queue'
import { ApiError } from '../src/infrastructure/http/api'
import { useQueuePolling } from '../src/presentation/queue/useQueuePolling'

const mockExecute = jest.fn()
jest.mock('../src/infrastructure/dependencies', () => ({
  getQueueStatus: { execute: (...args: unknown[]) => mockExecute(...args) },
}))

const status = (state: QueueState): QueueStatus => ({
  sessionId: 's1',
  eventId: 'e1',
  eventTitle: 'Festival',
  eventDate: '2027-10-18T20:00:00',
  state,
  position: state === 'AGUARDANDO' ? 2 : null,
  totalWaiting: 3,
  expiresAt: null,
  soldOut: false,
  sectors: [],
})

const advance = (ms: number) => act(async () => { await jest.advanceTimersByTimeAsync(ms) })

beforeEach(() => {
  jest.useFakeTimers()
  mockExecute.mockReset()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('useQueuePolling', () => {
  it('busca a posição ao abrir', async () => {
    mockExecute.mockResolvedValue(status('AGUARDANDO'))

    const { result } = await renderHook(() => useQueuePolling('s1'))
    await advance(1)

    expect(mockExecute).toHaveBeenCalledWith('s1')
    expect(result.current.status?.state).toBe('AGUARDANDO')
    expect(result.current.status?.position).toBe(2)
    expect(result.current.loading).toBe(false)
  })

  it('enquanto está na disputa consulta a cada 3 s, e quando chega a vez muda para ATIVO', async () => {
    mockExecute.mockResolvedValueOnce(status('AGUARDANDO')).mockResolvedValue(status('ATIVO'))

    const { result } = await renderHook(() => useQueuePolling('s1'))
    await advance(1)
    expect(result.current.status?.state).toBe('AGUARDANDO')

    await advance(3000)
    expect(result.current.status?.state).toBe('ATIVO')
  })

  it.each<QueueState>(['CONCLUIU', 'DESISTIU', 'EXPIROU'])('para de consultar em %s', async (state) => {
    mockExecute.mockResolvedValue(status(state))

    await renderHook(() => useQueuePolling('s1'))
    await advance(1)
    const calls = mockExecute.mock.calls.length

    await advance(15000)

    expect(mockExecute.mock.calls.length).toBe(calls)
  })

  it('401 marca a sessão como expirada', async () => {
    mockExecute.mockRejectedValue(new ApiError('Sessão expirada. Entre novamente.', 401))

    const { result } = await renderHook(() => useQueuePolling('s1'))
    await advance(1)

    expect(result.current.sessionExpired).toBe(true)
  })

  it('erro de rede aparece como aviso, sem marcar sessão expirada', async () => {
    mockExecute.mockRejectedValue(new ApiError('Não foi possível conectar ao servidor.', 0))

    const { result } = await renderHook(() => useQueuePolling('s1'))
    await advance(1)

    expect(result.current.error).toMatch(/conectar/)
    expect(result.current.sessionExpired).toBe(false)
  })
})
