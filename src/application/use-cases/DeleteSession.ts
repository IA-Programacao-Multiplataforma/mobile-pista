import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'

export class DeleteSession {
  private readonly events: EventAdminRepository

  constructor(events: EventAdminRepository) {
    this.events = events
  }

  execute(eventId: string, sessionId: string) {
    return this.events.removeSession(eventId, sessionId)
  }
}
