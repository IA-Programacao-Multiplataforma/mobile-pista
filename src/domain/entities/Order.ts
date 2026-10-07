export type OrderStatus = 'PENDENTE' | 'CONFIRMANDO' | 'PAGO' | 'RECUSADO' | 'CANCELADO'

// Estados finais: o app para de consultar o pedido quando chega a um destes
export const FINAL_ORDER_STATUSES: OrderStatus[] = ['PAGO', 'RECUSADO', 'CANCELADO']

export interface OrderItem {
  sectorName: string
  quantity: number
  unitPrice: number
  subtotal: number
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
  eventTitle: string
  eventDate: string
  total: number
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

export interface PlacedOrder {
  orderId: string
  status: OrderStatus
}
