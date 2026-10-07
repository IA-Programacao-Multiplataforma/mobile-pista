import type { Order, OrderStatus, OwnedTicket } from '../../domain/entities/Order'

export interface ApiPedido {
  id: string
  status: OrderStatus
  motivo: string | null
  eventoTitulo: string
  dataEvento: string
  total: number
  itens: { setorNome: string; quantidade: number; precoUnitario: number; subtotal: number }[]
  ingressos: { id: string; setorNome: string; codigo: string }[]
}

export interface ApiIngressoMeu {
  id: string
  pedidoId: string
  eventoTitulo: string
  dataEvento: string
  setorNome: string
  codigo: string
}

export interface ApiPedidoCriado {
  pedidoId: string
  status: OrderStatus
}

export function toOrder(api: ApiPedido): Order {
  return {
    id: api.id,
    status: api.status,
    reason: api.motivo,
    eventTitle: api.eventoTitulo,
    eventDate: api.dataEvento,
    total: api.total,
    items: api.itens.map((item) => ({
      sectorName: item.setorNome,
      quantity: item.quantidade,
      unitPrice: item.precoUnitario,
      subtotal: item.subtotal,
    })),
    tickets: api.ingressos.map((ticket) => ({
      id: ticket.id,
      sectorName: ticket.setorNome,
      code: ticket.codigo,
    })),
  }
}

export function toOwnedTicket(api: ApiIngressoMeu): OwnedTicket {
  return {
    id: api.id,
    orderId: api.pedidoId,
    eventTitle: api.eventoTitulo,
    eventDate: api.dataEvento,
    sectorName: api.setorNome,
    code: api.codigo,
  }
}
