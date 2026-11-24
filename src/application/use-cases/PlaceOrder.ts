import type { OrderRequestItem } from '../../domain/entities/Order'
import type { OrderRepository } from '../../domain/repositories/OrderRepository'

export class PlaceOrder {
  private readonly orders: OrderRepository

  constructor(orders: OrderRepository) {
    this.orders = orders
  }

  execute(sessionId: string, items: OrderRequestItem[], idempotencyKey: string) {
    return this.orders.place(sessionId, items, idempotencyKey)
  }
}
