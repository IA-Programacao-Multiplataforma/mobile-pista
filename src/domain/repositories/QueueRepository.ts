import type { Bag, BagRequestItem, QueueStatus } from '../entities/Queue'

export interface QueueRepository {
  // Se o cliente já estava na fila, devolve a situação atual
  join(sessionId: string): Promise<QueueStatus>
  // null = o cliente não está na fila desta sessão
  status(sessionId: string): Promise<QueueStatus | null>
  leave(sessionId: string): Promise<void>
  setBag(sessionId: string, items: BagRequestItem[]): Promise<Bag>
  // null = sacola vazia
  getBag(sessionId: string): Promise<Bag | null>
  clearBag(sessionId: string): Promise<void>
}
