import type { SectorAdjustment } from '../../domain/entities/ManagedEvent'
import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'

export class AdjustSector {
  private readonly events: EventAdminRepository

  constructor(events: EventAdminRepository) {
    this.events = events
  }

  execute(eventId: string, sessionId: string, sectorId: string, adjustment: SectorAdjustment) {
    return this.events.adjustSector(eventId, sessionId, sectorId, adjustment)
  }
}
