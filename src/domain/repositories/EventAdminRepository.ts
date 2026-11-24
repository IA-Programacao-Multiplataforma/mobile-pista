import type {
  EventEdit,
  ManagedEvent,
  NewEventData,
  NewSectorData,
  NewSessionData,
  SectorAdjustment,
  SessionDates,
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
  // Edição: dados do evento, datas, tipos de ingresso e exclusões. Cada uma devolve o evento atualizado.
  update(eventId: string, data: EventEdit): Promise<ManagedEvent>
  updateSession(eventId: string, sessionId: string, dates: SessionDates): Promise<ManagedEvent>
  removeSession(eventId: string, sessionId: string): Promise<ManagedEvent>
  addSector(eventId: string, sessionId: string, sector: NewSectorData): Promise<ManagedEvent>
  removeSector(eventId: string, sessionId: string, sectorId: string): Promise<ManagedEvent>
  remove(eventId: string): Promise<void>
}
