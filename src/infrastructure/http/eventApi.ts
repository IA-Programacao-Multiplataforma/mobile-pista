import type {
  EventCategoryCode,
  ManagedEvent,
  NewEventData,
  NewSessionData,
  SessionStatus,
} from '../../domain/entities/ManagedEvent'

export interface ApiSetor {
  id: string
  nome: string
  preco: number
  capacidade: number
  disponivel: number
  reservado: number
  vendido: number
}

export interface ApiSessao {
  id: string
  dataEvento: string
  inicioVenda: string
  status: SessionStatus
  setores: ApiSetor[]
}

export interface ApiEvento {
  id: string
  titulo: string
  descricao: string | null
  categoria: EventCategoryCode
  local: string
  cidade: string
  imagemUrl: string | null
  imagemAlt: string | null
  sessoes: ApiSessao[]
}

// <input type="datetime-local"> entrega "2026-10-18T14:00"; a API quer os segundos
const toApiDate = (value: string) => (value.length === 16 ? `${value}:00` : value)

export function toApiSessao(session: NewSessionData) {
  return {
    dataEvento: toApiDate(session.eventDate),
    inicioVenda: toApiDate(session.salesStart),
    setores: session.sectors.map((sector) => ({
      nome: sector.name,
      preco: sector.price,
      capacidade: sector.capacity,
    })),
  }
}

export function toApiEvento(data: NewEventData) {
  return {
    titulo: data.title,
    descricao: data.description,
    categoria: data.category,
    local: data.venue,
    cidade: data.city,
    imagemUrl: data.imageUrl,
    imagemAlt: data.imageAlt,
    sessoes: data.sessions.map(toApiSessao),
  }
}

export function toManagedEvent(api: ApiEvento): ManagedEvent {
  return {
    id: api.id,
    title: api.titulo,
    description: api.descricao ?? '',
    category: api.categoria,
    venue: api.local,
    city: api.cidade,
    imageUrl: api.imagemUrl ?? '',
    imageAlt: api.imagemAlt ?? '',
    sessions: api.sessoes.map((session) => ({
      id: session.id,
      eventDate: session.dataEvento,
      salesStart: session.inicioVenda,
      status: session.status,
      sectors: session.setores.map((sector) => ({
        id: sector.id,
        name: sector.nome,
        price: sector.preco,
        capacity: sector.capacidade,
        available: sector.disponivel,
        reserved: sector.reservado,
        sold: sector.vendido,
      })),
    })),
  }
}
