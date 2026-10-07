import type { AuthUser, Credentials, RegisterData } from '../../domain/entities/AuthUser'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'
import { API_URL, authHeaders, tokenStorage } from '../http/api'

// Gateway (8080) remove o "/login" e repassa ao serviço de login (8081)
const AUTH_URL = `${API_URL}/login/autenticacao/v1`

async function send(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Tente novamente.')
  }
}

// O backend devolve { erro } (login) ou { message } (cadastro)
async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json()
    return body.erro ?? body.message ?? fallback
  } catch {
    return fallback
  }
}

export class HttpAuthRepository implements AuthRepository {
  async login(credentials: Credentials): Promise<AuthUser> {
    const response = await send(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error(await errorMessage(response, 'Não foi possível entrar.'))
    }

    return this.startSession(response)
  }

  async register(data: RegisterData): Promise<AuthUser> {
    const response = await send(`${AUTH_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await errorMessage(response, 'Não foi possível criar a conta.'))
    }

    return this.startSession(response)
  }

  async currentUser(): Promise<AuthUser | null> {
    if (!(await tokenStorage.get())) return null

    const response = await send(`${AUTH_URL}/me`, { headers: await authHeaders() })

    if (response.status === 401) {
      await tokenStorage.clear()
      return null
    }
    if (!response.ok) {
      throw new Error('Não foi possível carregar seus dados.')
    }

    return (await response.json()) as AuthUser
  }

  async logout(): Promise<void> {
    await tokenStorage.clear()
  }

  private async startSession(response: Response): Promise<AuthUser> {
    const { token } = (await response.json()) as { token: string }
    await tokenStorage.save(token)

    const user = await this.currentUser()
    if (!user) throw new Error('Sessão inválida. Entre novamente.')
    return user
  }
}
