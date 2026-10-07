import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'

export class DeleteEvent {
  private readonly events: EventAdminRepository

  constructor(events: EventAdminRepository) {
    this.events = events
  }

  execute(eventId: string) {
    return this.events.remove(eventId)
  }
}
