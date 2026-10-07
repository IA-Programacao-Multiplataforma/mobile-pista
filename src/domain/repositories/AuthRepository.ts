import type { AuthUser, Credentials, RegisterData } from '../entities/AuthUser'

export interface AuthRepository {
  login(credentials: Credentials): Promise<AuthUser>
  register(data: RegisterData): Promise<AuthUser>
  currentUser(): Promise<AuthUser | null>
  logout(): Promise<void>
}
