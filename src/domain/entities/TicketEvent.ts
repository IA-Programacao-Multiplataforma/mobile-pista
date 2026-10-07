export type EventCategory = 'Música' | 'Festival' | 'Teatro' | 'Experiência'

export interface TicketEvent {
  id: string
  title: string
  description: string
  category: EventCategory
  venue: string
  city: string
  dateLabel: string
  day: string
  month: string
  time: string
  price: number
  imageUrl: string
  imageAlt: string
  badge?: string
}
