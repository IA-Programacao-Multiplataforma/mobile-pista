export type EventCategoryCode = 'MUSICA' | 'FESTIVAL' | 'TEATRO' | 'EXPERIENCIA'

export type SessionStatus = 'ESTREIA' | 'DISPONIVEL' | 'ESGOTADO'

export interface Sector {
  id: string
  name: string
  price: number
  capacity: number
  available: number
  reserved: number
  sold: number
}

export interface EventSession {
  id: string
  eventDate: string
  salesStart: string
  status: SessionStatus
  sectors: Sector[]
}

export interface ManagedEvent {
  id: string
  title: string
  description: string
  category: EventCategoryCode
  venue: string
  city: string
  imageUrl: string
  imageAlt: string
  sessions: EventSession[]
}

export interface NewSectorData {
  name: string
  price: number
  capacity: number
}

export interface NewSessionData {
  eventDate: string
  salesStart: string
  sectors: NewSectorData[]
}

export interface NewEventData {
  title: string
  description: string
  category: EventCategoryCode
  venue: string
  city: string
  imageUrl: string
  imageAlt: string
  sessions: NewSessionData[]
}

// Só o que foi informado muda
export interface SectorAdjustment {
  capacity?: number
  price?: number
}
