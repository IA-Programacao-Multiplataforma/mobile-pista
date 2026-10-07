import type { QueueRepository } from '../../domain/repositories/QueueRepository'

export class ClearBag {
  private readonly queue: QueueRepository

  constructor(queue: QueueRepository) {
    this.queue = queue
  }

  execute(sessionId: string) {
    return this.queue.clearBag(sessionId)
  }
}
