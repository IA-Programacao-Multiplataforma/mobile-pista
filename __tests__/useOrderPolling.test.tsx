import { act, renderHook } from '@testing-library/react-native'
import type { Order } from '../src/domain/entities/Order'
import { ApiError } from '../src/infrastructure/http/api'
import { useOrderPolling } from '../src/presentation/order/useOrderPolling'

const mockExecute = jest.fn()
jest.mock('../src/infrastructure/dependencies', () => ({
  getOrder: { execute: (...args: unknown[]) => mockExecute(...args) },
}))

const order = (status: Order['status']): Order => ({
  id: 'p1',
  status,
  reason: null,
  eventTitle: 'Festival',
  eventDate: '2027-10-18T20:00:00',
  total: 100,
  items: [],
  tickets: [],
})

const advance = (ms: number) => act(async () => { await jest.advanceTimersByTimeAsync(ms) })

beforeEach(() => {
  jest.useFakeTimers()
  mockExecute.mockReset()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('useOrderPolling', () => {
  it('busca o pedido ao abrir', async () => {
    mockExecute.mockResolvedValue(order('PENDENTE'))

    const { result } = await renderHook(() => useOrderPolling('p1'))
    await advance(1)

    expect(mockExecute).toHaveBeenCalledWith('p1')
    expect(result.current.order?.status).toBe('PENDENTE')
    expect(result.current.loading).toBe(false)
  })

  it('consulta de novo a cada 2 s até chegar a um estado final', async () => {
    mockExecute
      .mockResolvedValueOnce(order('PENDENTE'))
      .mockResolvedValueOnce(order('CONFIRMANDO'))
      .mockResolvedValue(order('PAGO'))

    const { result } = await renderHook(() => useOrderPolling('p1'))
    await advance(1)
    expect(result.current.order?.status).toBe('PENDENTE')

    await advance(2000)
    expect(result.current.order?.status).toBe('CONFIRMANDO')

    await advance(2000)
    expect(result.current.order?.status).toBe('PAGO')
  })

  it('para de consultar quando o pedido termina', async () => {
    mockExecute.mockResolvedValue(order('RECUSADO'))

    await renderHook(() => useOrderPolling('p1'))
    await advance(1)
    const calls = mockExecute.mock.calls.length

    await advance(10000)

    expect(mockExecute.mock.calls.length).toBe(calls)
  })

  it('401 marca a sessão como expirada e não insiste', async () => {
    mockExecute.mockRejectedValue(new ApiError('Sessão expirada. Entre novamente.', 401))

    const { result } = await renderHook(() => useOrderPolling('p1'))
    await advance(1)
    const calls = mockExecute.mock.calls.length

    expect(result.current.sessionExpired).toBe(true)
    await advance(10000)
    expect(mockExecute.mock.calls.length).toBe(calls)
  })

  it('falha temporária mostra o erro e continua tentando', async () => {
    mockExecute.mockRejectedValueOnce(new ApiError('Não foi possível conectar ao servidor.', 0)).mockResolvedValue(order('PAGO'))

    const { result } = await renderHook(() => useOrderPolling('p1'))
    await advance(1)
    expect(result.current.error).toMatch(/conectar/)

    await advance(2000)
    expect(result.current.order?.status).toBe('PAGO')
    expect(result.current.error).toBe('')
  })

  it('conta os segundos enquanto espera', async () => {
    mockExecute.mockResolvedValue(order('PENDENTE'))

    const { result } = await renderHook(() => useOrderPolling('p1'))
    await advance(5000)

    expect(result.current.elapsedSeconds).toBe(5)
  })
})
