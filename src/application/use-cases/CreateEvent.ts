import type { NewEventData } from '../../domain/entities/ManagedEvent'
import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'

export class CreateEvent {
  private readonly events: EventAdminRepository

  constructor(events: EventAdminRepository) {
    this.events = events
  }

  execute(data: NewEventData) {
    return this.events.create(data)
  }
}
