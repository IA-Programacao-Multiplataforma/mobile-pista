export type Role = 'ADMIN' | 'USER'

export interface AuthUser {
  id: string
  username: string
  email: string
  cep: string
  roles: Role[]
}

export interface Credentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  cep: string
  password: string
}
