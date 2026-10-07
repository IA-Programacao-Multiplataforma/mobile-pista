import type { EventRepository } from '../../domain/repositories/EventRepository'

export class ListEvents {
  private readonly events: EventRepository

  constructor(events: EventRepository) {
    this.events = events
  }

  execute() {
    return this.events.list()
  }
}
