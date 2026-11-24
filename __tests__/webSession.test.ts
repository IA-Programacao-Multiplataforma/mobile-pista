import { Platform } from 'react-native'
import { tokenStorage } from '../src/infrastructure/http/api'
import { readCookie, removeCookie, writeCookie } from '../src/infrastructure/http/webCookies'

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

// "document.cookie" de mentira: guarda os cookies e respeita max-age=0 (apagar), como o navegador
class FakeDocument {
  private jar = new Map<string, string>()
  lastWritten = ''

  get cookie(): string {
    return [...this.jar].map(([nome, valor]) => `${nome}=${valor}`).join('; ')
  }

  set cookie(texto: string) {
    this.lastWritten = texto
    const [par, ...atributos] = texto.split(';').map((parte) => parte.trim())
    const igual = par.indexOf('=')
    const nome = par.slice(0, igual)
    const valor = par.slice(igual + 1)
    if (atributos.includes('max-age=0')) this.jar.delete(nome)
    else this.jar.set(nome, valor)
  }
}

const storageFake = () => {
  const dados: Record<string, string> = {}
  return {
    getItem: (chave: string) => dados[chave] ?? null,
    setItem: (chave: string, valor: string) => {
      dados[chave] = valor
    },
    removeItem: (chave: string) => {
      delete dados[chave]
    },
  }
}

let documento: FakeDocument
let local: ReturnType<typeof storageFake>

beforeEach(() => {
  documento = new FakeDocument()
  local = storageFake()
  Object.assign(globalThis, { document: documento, localStorage: local, location: { protocol: 'http:' } })
})

describe('cookies do navegador', () => {
  it('grava e lê um cookie', () => {
    writeCookie('access_token', 'abc.def.ghi', 3600)

    expect(readCookie('access_token')).toBe('abc.def.ghi')
  })

  it('grava com path, validade e SameSite', () => {
    writeCookie('access_token', 'x', 3600)

    expect(documento.lastWritten).toContain('path=/')
    expect(documento.lastWritten).toContain('max-age=3600')
    expect(documento.lastWritten).toContain('SameSite=Lax')
  })

  it('só marca Secure em páginas https', () => {
    writeCookie('a', 'x', 60)
    expect(documento.lastWritten).not.toContain('Secure')

    Object.assign(globalThis, { location: { protocol: 'https:' } })
    writeCookie('a', 'x', 60)
    expect(documento.lastWritten).toContain('Secure')
  })

  it('guarda caracteres especiais sem quebrar o cookie', () => {
    writeCookie('access_token', 'a=b; c d', 60)

    expect(readCookie('access_token')).toBe('a=b; c d')
  })

  it('lê o cookie certo quando há vários', () => {
    writeCookie('outro', '1', 60)
    writeCookie('access_token', 'meu', 60)

    expect(readCookie('access_token')).toBe('meu')
    expect(readCookie('inexistente')).toBeNull()
  })

  it('remove o cookie', () => {
    writeCookie('access_token', 'x', 60)
    removeCookie('access_token')

    expect(readCookie('access_token')).toBeNull()
  })
})

describe('sessão no navegador (tokenStorage)', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'web')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('guarda o token num cookie e não no localStorage', async () => {
    await tokenStorage.save('jwt-123')

    expect(readCookie('access_token')).toBe('jwt-123')
    expect(local.getItem('pista.token')).toBeNull()
    expect(await tokenStorage.get()).toBe('jwt-123')
  })

  it('o cookie dura 1 hora, como o token', async () => {
    await tokenStorage.save('jwt-123')

    expect(documento.lastWritten).toContain('max-age=3600')
  })

  it('apaga o cookie ao sair', async () => {
    await tokenStorage.save('jwt-123')
    await tokenStorage.clear()

    expect(readCookie('access_token')).toBeNull()
    expect(await tokenStorage.get()).toBeNull()
  })

  it('migra um token antigo do localStorage para o cookie', async () => {
    local.setItem('pista.token', 'jwt-antigo')

    expect(await tokenStorage.get()).toBe('jwt-antigo')
    expect(readCookie('access_token')).toBe('jwt-antigo')
    expect(local.getItem('pista.token')).toBeNull()
  })

  it('sem sessão devolve null', async () => {
    expect(await tokenStorage.get()).toBeNull()
  })
})
