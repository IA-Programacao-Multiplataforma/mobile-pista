import type { SalesReport } from '../../domain/entities/SalesReport'

export interface ApiRelatorioVendas {
  totais: {
    pedidosPagos: number
    pedidosRecusados: number
    pedidosCancelados: number
    pedidosEmAndamento: number
    ingressosVendidos: number
    receita: number
  }
  eventos: {
    eventoId: string
    eventoTitulo: string
    pedidosPagos: number
    ingressosVendidos: number
    receita: number
    setores: { setorNome: string; ingressosVendidos: number; receita: number }[]
  }[]
}

export function toSalesReport(api: ApiRelatorioVendas): SalesReport {
  return {
    totals: {
      paidOrders: api.totais.pedidosPagos,
      refusedOrders: api.totais.pedidosRecusados,
      canceledOrders: api.totais.pedidosCancelados,
      inProgressOrders: api.totais.pedidosEmAndamento,
      tickets: api.totais.ingressosVendidos,
      revenue: api.totais.receita,
    },
    events: api.eventos.map((event) => ({
      eventId: event.eventoId,
      eventTitle: event.eventoTitulo,
      paidOrders: event.pedidosPagos,
      tickets: event.ingressosVendidos,
      revenue: event.receita,
      sectors: event.setores.map((sector) => ({
        sectorName: sector.setorNome,
        tickets: sector.ingressosVendidos,
        revenue: sector.receita,
      })),
    })),
  }
}
