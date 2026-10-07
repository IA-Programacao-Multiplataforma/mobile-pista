import type { RegisterData } from '../../domain/entities/AuthUser'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'

export class RegisterUser {
  private readonly auth: AuthRepository

  constructor(auth: AuthRepository) {
    this.auth = auth
  }

  execute(data: RegisterData) {
    return this.auth.register(data)
  }
}
