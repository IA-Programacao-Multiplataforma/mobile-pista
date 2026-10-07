import type { OrderRepository } from '../../domain/repositories/OrderRepository'

export class GetOrder {
  private readonly orders: OrderRepository

  constructor(orders: OrderRepository) {
    this.orders = orders
  }

  execute(orderId: string) {
    return this.orders.get(orderId)
  }
}
