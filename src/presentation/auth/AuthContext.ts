import { createContext } from 'react'
import type { AuthUser, Credentials, RegisterData } from '../../domain/entities/AuthUser'

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  login: (credentials: Credentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
