import type { OrderRepository } from '../../domain/repositories/OrderRepository'

export class ListMyTickets {
  private readonly orders: OrderRepository

  constructor(orders: OrderRepository) {
    this.orders = orders
  }

  execute() {
    return this.orders.myTickets()
  }
}
