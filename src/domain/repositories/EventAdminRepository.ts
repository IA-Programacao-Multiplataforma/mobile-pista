import type {
  ManagedEvent,
  NewEventData,
  NewSessionData,
  SectorAdjustment,
} from '../entities/ManagedEvent'

export interface EventAdminRepository {
  list(): Promise<ManagedEvent[]>
  create(data: NewEventData): Promise<ManagedEvent>
  addSession(eventId: string, session: NewSessionData): Promise<ManagedEvent>
  adjustSector(
    eventId: string,
    sessionId: string,
    sectorId: string,
    adjustment: SectorAdjustment,
  ): Promise<ManagedEvent>
  remove(eventId: string): Promise<void>
}
