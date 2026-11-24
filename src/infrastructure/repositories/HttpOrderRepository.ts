import type { Order, OrderRequestItem, OwnedTicket, PlacedOrder } from '../../domain/entities/Order'
import type { OrderRepository } from '../../domain/repositories/OrderRepository'
import { apiRequest } from '../http/api'
import {
  toOrder,
  toOwnedTicket,
  type ApiIngressoMeu,
  type ApiPedido,
  type ApiPedidoCriado,
} from '../http/orderApi'

// Gateway (8080) remove o "/pedido" e repassa ao serviço de pedido (8083)
export class HttpOrderRepository implements OrderRepository {
  // Início do ciclo: cria o pedido (PROCESSANDO); o estoque responde depois, via RabbitMQ
  async place(sessionId: string, items: OrderRequestItem[], idempotencyKey: string): Promise<PlacedOrder> {
    const created = await apiRequest<ApiPedidoCriado>('/pedido/pedidos', {
      method: 'POST',
      auth: true,
      headers: { 'Idempotency-Key': idempotencyKey },
      body: {
        sessaoId: sessionId,
        itens: items.map((item) => ({ setorId: item.sectorId, quantidade: item.quantity })),
      },
    })
    return { orderId: created.pedidoId, status: created.status }
  }

  async get(orderId: string): Promise<Order> {
    return toOrder(await apiRequest<ApiPedido>(`/pedido/pedidos/${orderId}`, { auth: true }))
  }

  async mine(): Promise<Order[]> {
    const orders = await apiRequest<ApiPedido[]>('/pedido/pedidos/meus', { auth: true })
    return orders.map(toOrder)
  }

  async myTickets(): Promise<OwnedTicket[]> {
    const tickets = await apiRequest<ApiIngressoMeu[]>('/pedido/ingressos/meus', { auth: true })
    return tickets.map(toOwnedTicket)
  }
}
