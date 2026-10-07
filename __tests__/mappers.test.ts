import { toOrder, toOwnedTicket, type ApiIngressoMeu, type ApiPedido } from '../src/infrastructure/http/orderApi'
import { toSalesReport, type ApiRelatorioVendas } from '../src/infrastructure/http/reportApi'

describe('mapeamento do pedido (API em português -> app)', () => {
  const pedido: ApiPedido = {
    id: 'p1',
    status: 'PAGO',
    motivo: null,
    eventoTitulo: 'Festival',
    dataEvento: '2027-10-18T20:00:00',
    total: 200,
    itens: [{ setorNome: 'Pista', quantidade: 2, precoUnitario: 100, subtotal: 200 }],
    ingressos: [{ id: 'i1', setorNome: 'Pista', codigo: 'PISTA-AAAA' }],
  }

  it('converte o pedido com itens e ingressos', () => {
    expect(toOrder(pedido)).toEqual({
      id: 'p1',
      status: 'PAGO',
      reason: null,
      eventTitle: 'Festival',
      eventDate: '2027-10-18T20:00:00',
      total: 200,
      items: [{ sectorName: 'Pista', quantity: 2, unitPrice: 100, subtotal: 200 }],
      tickets: [{ id: 'i1', sectorName: 'Pista', code: 'PISTA-AAAA' }],
    })
  })

  it('preserva o motivo da recusa', () => {
    expect(toOrder({ ...pedido, status: 'RECUSADO', motivo: 'Saldo insuficiente', ingressos: [] })).toMatchObject({
      status: 'RECUSADO',
      reason: 'Saldo insuficiente',
      tickets: [],
    })
  })

  it('converte o ingresso do perfil', () => {
    const api: ApiIngressoMeu = {
      id: 'i1',
      pedidoId: 'p1',
      eventoTitulo: 'Festival',
      dataEvento: '2027-10-18T20:00:00',
      setorNome: 'Pista',
      codigo: 'PISTA-AAAA',
    }
    expect(toOwnedTicket(api)).toEqual({
      id: 'i1',
      orderId: 'p1',
      eventTitle: 'Festival',
      eventDate: '2027-10-18T20:00:00',
      sectorName: 'Pista',
      code: 'PISTA-AAAA',
    })
  })
})

describe('mapeamento do relatório de vendas', () => {
  const api: ApiRelatorioVendas = {
    totais: { pedidosPagos: 2, pedidosRecusados: 1, pedidosCancelados: 0, pedidosEmAndamento: 3, ingressosVendidos: 5, receita: 500 },
    eventos: [
      {
        eventoId: 'e1',
        eventoTitulo: 'Festival',
        pedidosPagos: 2,
        ingressosVendidos: 5,
        receita: 500,
        setores: [{ setorNome: 'Pista', ingressosVendidos: 5, receita: 500 }],
      },
    ],
  }

  it('converte totais e eventos por setor', () => {
    const report = toSalesReport(api)

    expect(report.totals).toEqual({
      paidOrders: 2,
      refusedOrders: 1,
      canceledOrders: 0,
      inProgressOrders: 3,
      tickets: 5,
      revenue: 500,
    })
    expect(report.events[0]).toEqual({
      eventId: 'e1',
      eventTitle: 'Festival',
      paidOrders: 2,
      tickets: 5,
      revenue: 500,
      sectors: [{ sectorName: 'Pista', tickets: 5, revenue: 500 }],
    })
  })

  it('aceita relatório sem vendas', () => {
    expect(toSalesReport({ ...api, eventos: [] }).events).toEqual([])
  })
})
