import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { readCookie, removeCookie, SESSION_MAX_AGE_SECONDS, writeCookie } from './webCookies'

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

const WEB_COOKIE = 'access_token'

export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        const cookie = readCookie(WEB_COOKIE)
        if (cookie) return cookie

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

// Retry no consumo da API: tenta até 3 vezes, esperando 1s e depois 2s (espera crescente).
export const RETENTATIVA = { tentativas: 3, esperaInicialMs: 1000 }
const STATUS_TEMPORARIOS = [429, 502, 503, 504]

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchComRetentativa(url: string, init: RequestInit, podeRepetir: boolean): Promise<Response> {
  for (let tentativa = 1; ; tentativa++) {
    const ultima = !podeRepetir || tentativa >= RETENTATIVA.tentativas
    try {
      const response = await fetch(url, init)
      if (ultima || !STATUS_TEMPORARIOS.includes(response.status)) return response
    } catch (erro) {
      if (ultima) throw erro
    }
    await esperar(RETENTATIVA.esperaInicialMs * 2 ** (tentativa - 1))
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

  // Seguro repeti GET só lê
  const podeRepetir = method === 'GET' || 'Idempotency-Key' in headers

  let response: Response
  try {
    response = await fetchComRetentativa(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(auth ? await authHeaders() : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }, podeRepetir)
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
    }
    throw new ApiError(message, response.status, extra)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
