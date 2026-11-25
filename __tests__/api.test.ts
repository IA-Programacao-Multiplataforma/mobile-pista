import { ApiError, apiRequest, RETENTATIVA } from '../src/infrastructure/http/api'

const store: Record<string, string> = {}
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => store[key] ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    store[key] = value
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete store[key]
  }),
}))

function respond(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) throw new Error('sem corpo')
      return body
    },
  } as Response
}

const fetchMock = jest.fn()

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock as unknown as typeof fetch
  for (const key of Object.keys(store)) delete store[key]
  RETENTATIVA.esperaInicialMs = 0 // nos testes não precisa esperar entre as tentativas
})

describe('apiRequest', () => {
  it('devolve o JSON de uma resposta 200', async () => {
    fetchMock.mockResolvedValue(respond(200, { ok: true }))

    await expect(apiRequest('/estoque/eventos')).resolves.toEqual({ ok: true })
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/estoque\/eventos$/)
  })

  it('envia corpo em JSON com Content-Type', async () => {
    fetchMock.mockResolvedValue(respond(201, { id: '1' }))

    await apiRequest('/x', { method: 'POST', body: { a: 1 } })

    const init = fetchMock.mock.calls[0][1]
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"a":1}')
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('só envia o token quando a rota é protegida', async () => {
    store['pista.token'] = 'abc'
    fetchMock.mockResolvedValue(respond(200, {}))

    await apiRequest('/publica')
    await apiRequest('/privada', { auth: true })

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer abc')
  })

  it('repassa cabeçalhos extras (Idempotency-Key)', async () => {
    fetchMock.mockResolvedValue(respond(202, {}))

    await apiRequest('/pedido/pedidos', { method: 'POST', body: {}, headers: { 'Idempotency-Key': 'k1' } })

    expect(fetchMock.mock.calls[0][1].headers['Idempotency-Key']).toBe('k1')
  })

  it('401 vira "sessão expirada"', async () => {
    fetchMock.mockResolvedValue(respond(401))

    await expect(apiRequest('/x', { auth: true })).rejects.toMatchObject({ status: 401, message: 'Sessão expirada. Entre novamente.' })
  })

  it('403 vira acesso restrito', async () => {
    fetchMock.mockResolvedValue(respond(403))

    await expect(apiRequest('/x')).rejects.toMatchObject({ status: 403 })
  })

  it('usa a mensagem do contrato { message } e guarda o corpo', async () => {
    fetchMock.mockResolvedValue(respond(409, { message: 'Ingressos insuficientes', pedidoId: 'p1' }))

    const error = (await apiRequest("/x").catch((e: unknown) => e)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(409)
    expect(error.message).toBe('Ingressos insuficientes')
    expect(error.data.pedidoId).toBe('p1')
  })

  it('erro sem corpo JSON usa a mensagem genérica', async () => {
    fetchMock.mockResolvedValue(respond(500))

    await expect(apiRequest('/x')).rejects.toMatchObject({ status: 500, message: 'Erro inesperado (500).' })
  })

  it('servidor fora do ar vira status 0 (depois das 3 tentativas)', async () => {
    fetchMock.mockRejectedValue(new TypeError('network'))

    await expect(apiRequest('/x')).rejects.toMatchObject({ status: 0 })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('204 devolve undefined', async () => {
    fetchMock.mockResolvedValue(respond(204))

    await expect(apiRequest('/x', { method: 'DELETE' })).resolves.toBeUndefined()
  })
})

describe('apiRequest: retry', () => {
  it('GET com 503 tenta de novo e devolve a resposta quando o servidor volta', async () => {
    fetchMock.mockResolvedValueOnce(respond(503)).mockResolvedValueOnce(respond(200, { ok: true }))

    await expect(apiRequest('/estoque/eventos')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('volta a conectar depois de uma falha de rede', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('network')).mockResolvedValueOnce(respond(200, { ok: true }))

    await expect(apiRequest('/x')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('desiste depois de 3 tentativas e devolve o erro', async () => {
    fetchMock.mockResolvedValue(respond(502))

    await expect(apiRequest('/x')).rejects.toMatchObject({ status: 502 })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('não repete erro que não é temporário (404)', async () => {
    fetchMock.mockResolvedValue(respond(404, { message: 'Não encontrado' }))

    await expect(apiRequest('/x')).rejects.toMatchObject({ status: 404 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('não repete POST comum, que poderia gravar duas vezes', async () => {
    fetchMock.mockResolvedValue(respond(503))

    await expect(apiRequest('/x', { method: 'POST', body: {} })).rejects.toMatchObject({ status: 503 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('repete POST com Idempotency-Key (o back devolve o mesmo pedido)', async () => {
    fetchMock.mockResolvedValueOnce(respond(504)).mockResolvedValueOnce(respond(202, { pedidoId: 'p1' }))

    await expect(
      apiRequest('/pedido/pedidos', { method: 'POST', body: {}, headers: { 'Idempotency-Key': 'k1' } }),
    ).resolves.toEqual({ pedidoId: 'p1' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
