export type EventCategoryCode = 'MUSICA' | 'FESTIVAL' | 'TEATRO' | 'EXPERIENCIA'

export type SessionStatus = 'ESTREIA' | 'DISPONIVEL' | 'ESGOTADO'

export interface Sector {
  id: string
  name: string
  price: number
  capacity: number
  available: number
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

// Dados do evento que o administrador edita (as datas e os setores têm edição própria)
export interface EventEdit {
  title: string
  description: string
  category: EventCategoryCode
  venue: string
  city: string
  imageUrl: string
  imageAlt: string
}

export interface SessionDates {
  eventDate: string
  salesStart: string
}

// Só o que foi informado muda
export interface SectorAdjustment {
  name?: string
  capacity?: number
  price?: number
}
