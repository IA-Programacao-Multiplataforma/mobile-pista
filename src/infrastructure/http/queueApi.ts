import type { Bag, QueueState, QueueStatus } from '../../domain/entities/Queue'

export interface ApiStatusFila {
  sessaoId: string
  eventoId: string
  eventoTitulo: string
  dataEvento: string
  status: QueueState
  posicao: number | null
  totalNaFila: number
  vagaExpiraEm: string | null
  esgotado: boolean
  setores: { id: string; nome: string; preco: number; disponivel: number }[]
}

export interface ApiSacola {
  reservaId: string
  sessaoId: string
  expiraEm: string
  itens: {
    setorId: string
    setorNome: string
    quantidade: number
    precoUnitario: number
    subtotal: number
  }[]
  total: number
}

export function toQueueStatus(api: ApiStatusFila): QueueStatus {
  return {
    sessionId: api.sessaoId,
    eventId: api.eventoId,
    eventTitle: api.eventoTitulo,
    eventDate: api.dataEvento,
    state: api.status,
    position: api.posicao,
    totalWaiting: api.totalNaFila,
    expiresAt: api.vagaExpiraEm,
    soldOut: api.esgotado,
    sectors: api.setores.map((sector) => ({
      id: sector.id,
      name: sector.nome,
      price: sector.preco,
      available: sector.disponivel,
    })),
  }
}

export function toBag(api: ApiSacola): Bag {
  return {
    reservationId: api.reservaId,
    sessionId: api.sessaoId,
    expiresAt: api.expiraEm,
    items: api.itens.map((item) => ({
      sectorId: item.setorId,
      sectorName: item.setorNome,
      quantity: item.quantidade,
      unitPrice: item.precoUnitario,
      subtotal: item.subtotal,
    })),
    total: api.total,
  }
}
