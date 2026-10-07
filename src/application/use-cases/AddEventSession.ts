import type { NewSessionData } from '../../domain/entities/ManagedEvent'
import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'

export class AddEventSession {
  private readonly events: EventAdminRepository

  constructor(events: EventAdminRepository) {
    this.events = events
  }

  execute(eventId: string, session: NewSessionData) {
    return this.events.addSession(eventId, session)
  }
}
