// PROCESSANDO: esperando o estoque | REALIZADO: comprado | CANCELADO: não havia ingressos
export type OrderStatus = 'PROCESSANDO' | 'REALIZADO' | 'CANCELADO'

// Estados finais: o app para de consultar o pedido quando chega a um destes
export const FINAL_ORDER_STATUSES: OrderStatus[] = ['REALIZADO', 'CANCELADO']

export interface OrderItem {
  sectorName: string | null
  quantity: number
  unitPrice: number | null
  subtotal: number | null
}

export interface Ticket {
  id: string
  sectorName: string
  code: string
}

export interface Order {
  id: string
  status: OrderStatus
  reason: string | null
  // Só chegam quando o estoque confirma (REALIZADO)
  eventTitle: string | null
  eventDate: string | null
  total: number | null
  items: OrderItem[]
  tickets: Ticket[]
}

export interface OwnedTicket {
  id: string
  orderId: string
  eventTitle: string
  eventDate: string
  sectorName: string
  code: string
}

export interface OrderRequestItem {
  sectorId: string
  quantity: number
}

export interface PlacedOrder {
  orderId: string
  status: OrderStatus
}
