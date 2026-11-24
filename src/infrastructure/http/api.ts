import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { readCookie, removeCookie, SESSION_MAX_AGE_SECONDS, writeCookie } from './webCookies'

// O app só fala com o gateway: EXPO_PUBLIC_API_URL, senão o IP da máquina do Expo
// (no celular, "localhost" é o próprio celular), senão localhost
function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL
  if (configured) return configured

  if (Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri
    const host = hostUri?.split(':')[0]
    if (host) return `http://${host}:8080`
  }

  return 'http://localhost:8080'
}

export const API_URL: string = resolveApiUrl()

const TOKEN_KEY = 'pista.token'

// No navegador a sessão fica num COOKIE (aba "Cookies" das ferramentas do desenvolvedor), com o mesmo
// nome que o login usa (access_token) e a mesma duração do token (1 h). No celular continua no
// armazenamento seguro (Keychain/Keystore).
const WEB_COOKIE = 'access_token'

export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        const cookie = readCookie(WEB_COOKIE)
        if (cookie) return cookie

        // Versões anteriores guardavam o token no localStorage: passa para o cookie e limpa o resto
        const antigo = localStorage.getItem(TOKEN_KEY)
        if (antigo) {
          writeCookie(WEB_COOKIE, antigo, SESSION_MAX_AGE_SECONDS)
          localStorage.removeItem(TOKEN_KEY)
        }
        return antigo
      }
      return await SecureStore.getItemAsync(TOKEN_KEY)
    } catch {
      return null
    }
  },
  async save(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        writeCookie(WEB_COOKIE, token, SESSION_MAX_AGE_SECONDS)
        localStorage.removeItem(TOKEN_KEY)
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token)
      }
    } catch {
    }
  },
  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        removeCookie(WEB_COOKIE)
        localStorage.removeItem(TOKEN_KEY)
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY)
      }
    } catch {
    }
  },
}

export async function authHeaders(): Promise<Record<string, string>> {
  const token = await tokenStorage.get()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export class ApiError extends Error {
  readonly status: number
  readonly data: Record<string, unknown>

  constructor(message: string, status: number, data: Record<string, unknown> = {}) {
    super(message)
    this.status = status
    this.data = data
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, headers = {} } = options

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(auth ? await authHeaders() : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Tente novamente.', 0)
  }

  if (!response.ok) {
    if (response.status === 401) throw new ApiError('Sessão expirada. Entre novamente.', 401)
    if (response.status === 403) throw new ApiError('Acesso restrito a administradores.', 403)

    let message = `Erro inesperado (${response.status}).`
    let extra: Record<string, unknown> = {}
    try {
      const data = await response.json()
      if (data.message) message = data.message
      extra = data
    } catch {
      // resposta sem corpo JSON: mantém a mensagem genérica
    }
    throw new ApiError(message, response.status, extra)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
