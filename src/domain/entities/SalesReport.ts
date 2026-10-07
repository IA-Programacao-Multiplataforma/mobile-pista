// Só pedidos PAGOS contam como venda
export interface SectorSales {
  sectorName: string
  tickets: number
  revenue: number
}

export interface EventSales {
  eventId: string
  eventTitle: string
  paidOrders: number
  tickets: number
  revenue: number
  sectors: SectorSales[]
}

export interface SalesTotals {
  paidOrders: number
  refusedOrders: number
  canceledOrders: number
  inProgressOrders: number
  tickets: number
  revenue: number
}

export interface SalesReport {
  totals: SalesTotals
  events: EventSales[]
}
