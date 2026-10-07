import type { BagRequestItem } from '../../domain/entities/Queue'
import type { QueueRepository } from '../../domain/repositories/QueueRepository'

export class SetBag {
  private readonly queue: QueueRepository

  constructor(queue: QueueRepository) {
    this.queue = queue
  }

  execute(sessionId: string, items: BagRequestItem[]) {
    return this.queue.setBag(sessionId, items)
  }
}
