import type { EventEdit } from '../../domain/entities/ManagedEvent'
import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'

export class UpdateEvent {
  private readonly events: EventAdminRepository

  constructor(events: EventAdminRepository) {
    this.events = events
  }

  execute(eventId: string, data: EventEdit) {
    return this.events.update(eventId, data)
  }
}
