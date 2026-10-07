import type { EventRepository } from '../../domain/repositories/EventRepository'

export class GetEventDetails {
  private readonly events: EventRepository

  constructor(events: EventRepository) {
    this.events = events
  }

  execute(eventId: string) {
    return this.events.get(eventId)
  }
}
