import type { ManagedEvent } from '../entities/ManagedEvent'
import type { TicketEvent } from '../entities/TicketEvent'

export interface EventRepository {
  list(): Promise<TicketEvent[]>
  get(eventId: string): Promise<ManagedEvent>
}
