import type { AuthRepository } from '../../domain/repositories/AuthRepository'

export class LogoutUser {
  private readonly auth: AuthRepository

  constructor(auth: AuthRepository) {
    this.auth = auth
  }

  execute() {
    return this.auth.logout()
  }
}
