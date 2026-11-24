import type { SessionDates } from '../../domain/entities/ManagedEvent'
import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'

export class UpdateSession {
  private readonly events: EventAdminRepository

  constructor(events: EventAdminRepository) {
    this.events = events
  }

  execute(eventId: string, sessionId: string, dates: SessionDates) {
    return this.events.updateSession(eventId, sessionId, dates)
  }
}
