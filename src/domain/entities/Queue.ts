export type QueueState = 'AGUARDANDO' | 'ATIVO' | 'CONCLUIU' | 'DESISTIU' | 'EXPIROU'

export interface SectorAvailability {
  id: string
  name: string
  price: number
  available: number
}

export interface QueueStatus {
  sessionId: string
  eventId: string
  eventTitle: string
  eventDate: string
  state: QueueState
  position: number | null
  totalWaiting: number
  expiresAt: string | null
  soldOut: boolean
  sectors: SectorAvailability[]
}

export interface BagItem {
  sectorId: string
  sectorName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Bag {
  reservationId: string
  sessionId: string
  expiresAt: string
  items: BagItem[]
  total: number
}

export interface BagRequestItem {
  sectorId: string
  quantity: number
}
