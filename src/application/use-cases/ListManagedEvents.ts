import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'

export class ListManagedEvents {
  private readonly events: EventAdminRepository

  constructor(events: EventAdminRepository) {
    this.events = events
  }

  execute() {
    return this.events.list()
  }
}
