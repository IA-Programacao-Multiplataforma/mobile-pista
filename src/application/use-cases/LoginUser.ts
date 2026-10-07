import type { Credentials } from '../../domain/entities/AuthUser'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'

export class LoginUser {
  private readonly auth: AuthRepository

  constructor(auth: AuthRepository) {
    this.auth = auth
  }

  execute(credentials: Credentials) {
    return this.auth.login(credentials)
  }
}
