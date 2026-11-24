// Só pedidos REALIZADOS contam como venda
export interface SectorSales {
  sectorName: string
  tickets: number
  revenue: number
}

export interface EventSales {
  eventId: string
  eventTitle: string
  completedOrders: number
  tickets: number
  revenue: number
  sectors: SectorSales[]
}

export interface SalesTotals {
  completedOrders: number
  canceledOrders: number
  inProgressOrders: number
  tickets: number
  revenue: number
}

export interface SalesReport {
  totals: SalesTotals
  events: EventSales[]
}
