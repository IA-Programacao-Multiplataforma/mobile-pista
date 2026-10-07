import type { QueueRepository } from '../../domain/repositories/QueueRepository'

export class JoinQueue {
  private readonly queue: QueueRepository

  constructor(queue: QueueRepository) {
    this.queue = queue
  }

  execute(sessionId: string) {
    return this.queue.join(sessionId)
  }
}
