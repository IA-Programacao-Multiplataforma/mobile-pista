import type { ManagedEvent, SessionStatus } from '../../domain/entities/ManagedEvent'
import type { EventCategory, TicketEvent } from '../../domain/entities/TicketEvent'
import type { EventRepository } from '../../domain/repositories/EventRepository'
import { apiRequest } from '../http/api'
import { toManagedEvent, type ApiEvento, type ApiSessao } from '../http/eventApi'

const CATEGORY_LABEL: Record<ApiEvento['categoria'], EventCategory> = {
  MUSICA: 'Música',
  FESTIVAL: 'Festival',
  TEATRO: 'Teatro',
  EXPERIENCIA: 'Experiência',
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1500&q=85'

const pad = (value: number) => String(value).padStart(2, '0')

// O cartão mostra a próxima sessão à venda; se não houver, a próxima em estreia; por último as esgotadas
const STATUS_PRIORITY: Record<SessionStatus, number> = { DISPONIVEL: 0, ESTREIA: 1, ESGOTADO: 2 }

function pickSession(sessions: ApiSessao[], now: Date): ApiSessao | undefined {
  return sessions
    .filter((session) => new Date(session.dataEvento) >= now)
    .sort(
      (a, b) =>
        STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] || a.dataEvento.localeCompare(b.dataEvento),
    )[0]
}

function toTicketEvent(api: ApiEvento, now: Date): TicketEvent | null {
  const session = pickSession(api.sessoes, now)
  if (!session) return null

  const date = new Date(session.dataEvento)
  const prices = session.setores.map((sector) => sector.preco)

  return {
    id: api.id,
    title: api.titulo,
    description: api.descricao ?? '',
    category: CATEGORY_LABEL[api.categoria],
    venue: api.local,
    city: api.cidade,
    dateLabel: `${WEEKDAYS[date.getDay()]}, ${pad(date.getDate())} ${MONTHS[date.getMonth()]}`,
    day: pad(date.getDate()),
    month: MONTHS[date.getMonth()].toUpperCase(),
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    price: prices.length > 0 ? Math.min(...prices) : 0,
    imageUrl: api.imagemUrl || FALLBACK_IMAGE,
    imageAlt: api.imagemAlt || api.titulo,
    badge:
      session.status === 'ESTREIA' ? 'Estreia' : session.status === 'ESGOTADO' ? 'Esgotado' : undefined,
  }
}

export class HttpEventRepository implements EventRepository {
  async list(): Promise<TicketEvent[]> {
    const events = await apiRequest<ApiEvento[]>('/estoque/eventos')
    const now = new Date()

    return events
      .map((event) => toTicketEvent(event, now))
      .filter((event): event is TicketEvent => event !== null)
  }

  async get(eventId: string): Promise<ManagedEvent> {
    return toManagedEvent(await apiRequest<ApiEvento>(`/estoque/eventos/${eventId}`))
  }
}
