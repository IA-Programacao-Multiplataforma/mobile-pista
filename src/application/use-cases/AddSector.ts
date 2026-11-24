import type { NewSectorData } from '../../domain/entities/ManagedEvent'
import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'

export class AddSector {
  private readonly events: EventAdminRepository

  constructor(events: EventAdminRepository) {
    this.events = events
  }

  execute(eventId: string, sessionId: string, sector: NewSectorData) {
    return this.events.addSector(eventId, sessionId, sector)
  }
}
