import type { OrderRepository } from '../../domain/repositories/OrderRepository'

export class PlaceOrder {
  private readonly orders: OrderRepository

  constructor(orders: OrderRepository) {
    this.orders = orders
  }

  execute(sessionId: string, idempotencyKey: string) {
    return this.orders.place(sessionId, idempotencyKey)
  }
}
