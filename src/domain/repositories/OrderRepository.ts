import type { Order, OrderRequestItem, OwnedTicket, PlacedOrder } from '../entities/Order'

export interface OrderRepository {
  place(sessionId: string, items: OrderRequestItem[], idempotencyKey: string): Promise<PlacedOrder>
  get(orderId: string): Promise<Order>
  mine(): Promise<Order[]>
  myTickets(): Promise<OwnedTicket[]>
}
