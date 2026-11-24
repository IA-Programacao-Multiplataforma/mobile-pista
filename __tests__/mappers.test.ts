import { toOrder, toOwnedTicket, type ApiIngressoMeu, type ApiPedido } from '../src/infrastructure/http/orderApi'
import { toSalesReport, type ApiRelatorioVendas } from '../src/infrastructure/http/reportApi'

describe('mapeamento do pedido (API em português -> app)', () => {
  const pedido: ApiPedido = {
    id: 'p1',
    status: 'REALIZADO',
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
      status: 'REALIZADO',
      reason: null,
      eventTitle: 'Festival',
      eventDate: '2027-10-18T20:00:00',
      total: 200,
      items: [{ sectorName: 'Pista', quantity: 2, unitPrice: 100, subtotal: 200 }],
      tickets: [{ id: 'i1', sectorName: 'Pista', code: 'PISTA-AAAA' }],
    })
  })

  it('preserva o motivo do cancelamento', () => {
    expect(toOrder({ ...pedido, status: 'CANCELADO', motivo: 'Ingressos insuficientes no setor Pista', ingressos: [] })).toMatchObject({
      status: 'CANCELADO',
      reason: 'Ingressos insuficientes no setor Pista',
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
    totais: { pedidosRealizados: 2, pedidosCancelados: 0, pedidosEmAndamento: 3, ingressosVendidos: 5, receita: 500 },
    eventos: [
      {
        eventoId: 'e1',
        eventoTitulo: 'Festival',
        pedidosRealizados: 2,
        ingressosVendidos: 5,
        receita: 500,
        setores: [{ setorNome: 'Pista', ingressosVendidos: 5, receita: 500 }],
      },
    ],
  }

  it('converte totais e eventos por setor', () => {
    const report = toSalesReport(api)

    expect(report.totals).toEqual({
      completedOrders: 2,
      canceledOrders: 0,
      inProgressOrders: 3,
      tickets: 5,
      revenue: 500,
    })
    expect(report.events[0]).toEqual({
      eventId: 'e1',
      eventTitle: 'Festival',
      completedOrders: 2,
      tickets: 5,
      revenue: 500,
      sectors: [{ sectorName: 'Pista', tickets: 5, revenue: 500 }],
    })
  })

  it('aceita relatório sem vendas', () => {
    expect(toSalesReport({ ...api, eventos: [] }).events).toEqual([])
  })
})
