import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'

export class DeleteSector {
  private readonly events: EventAdminRepository

  constructor(events: EventAdminRepository) {
    this.events = events
  }

  execute(eventId: string, sessionId: string, sectorId: string) {
    return this.events.removeSector(eventId, sessionId, sectorId)
  }
}
