import type {
  EventEdit,
  ManagedEvent,
  NewEventData,
  NewSectorData,
  NewSessionData,
  SectorAdjustment,
  SessionDates,
} from '../../domain/entities/ManagedEvent'
import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'
import { apiRequest } from '../http/api'
import { toApiDate, toApiEvento, toApiSessao, toManagedEvent, type ApiEvento } from '../http/eventApi'

// Gateway (8080) remove o "/estoque" e repassa ao micro-estoque (8082)
const BASE = '/estoque/eventos'

export class HttpEventAdminRepository implements EventAdminRepository {
  async list(): Promise<ManagedEvent[]> {
    const events = await apiRequest<ApiEvento[]>(BASE)
    return events.map(toManagedEvent)
  }

  async create(data: NewEventData): Promise<ManagedEvent> {
    const event = await apiRequest<ApiEvento>(BASE, {
      method: 'POST',
      body: toApiEvento(data),
      auth: true,
    })
    return toManagedEvent(event)
  }

  async addSession(eventId: string, session: NewSessionData): Promise<ManagedEvent> {
    const event = await apiRequest<ApiEvento>(`${BASE}/${eventId}/sessoes`, {
      method: 'POST',
      body: toApiSessao(session),
      auth: true,
    })
    return toManagedEvent(event)
  }

  async adjustSector(
    eventId: string,
    sessionId: string,
    sectorId: string,
    adjustment: SectorAdjustment,
  ): Promise<ManagedEvent> {
    const event = await apiRequest<ApiEvento>(
      `${BASE}/${eventId}/sessoes/${sessionId}/setores/${sectorId}`,
      {
        method: 'PUT',
        body: { nome: adjustment.name, capacidade: adjustment.capacity, preco: adjustment.price },
        auth: true,
      },
    )
    return toManagedEvent(event)
  }

  async update(eventId: string, data: EventEdit): Promise<ManagedEvent> {
    const event = await apiRequest<ApiEvento>(`${BASE}/${eventId}`, {
      method: 'PUT',
      body: {
        titulo: data.title,
        descricao: data.description,
        categoria: data.category,
        local: data.venue,
        cidade: data.city,
        imagemUrl: data.imageUrl,
        imagemAlt: data.imageAlt,
      },
      auth: true,
    })
    return toManagedEvent(event)
  }

  async updateSession(eventId: string, sessionId: string, dates: SessionDates): Promise<ManagedEvent> {
    const event = await apiRequest<ApiEvento>(`${BASE}/${eventId}/sessoes/${sessionId}`, {
      method: 'PUT',
      body: { dataEvento: toApiDate(dates.eventDate), inicioVenda: toApiDate(dates.salesStart) },
      auth: true,
    })
    return toManagedEvent(event)
  }

  async removeSession(eventId: string, sessionId: string): Promise<ManagedEvent> {
    const event = await apiRequest<ApiEvento>(`${BASE}/${eventId}/sessoes/${sessionId}`, { method: 'DELETE', auth: true })
    return toManagedEvent(event)
  }

  async addSector(eventId: string, sessionId: string, sector: NewSectorData): Promise<ManagedEvent> {
    const event = await apiRequest<ApiEvento>(`${BASE}/${eventId}/sessoes/${sessionId}/setores`, {
      method: 'POST',
      body: { nome: sector.name, preco: sector.price, capacidade: sector.capacity },
      auth: true,
    })
    return toManagedEvent(event)
  }

  async removeSector(eventId: string, sessionId: string, sectorId: string): Promise<ManagedEvent> {
    const event = await apiRequest<ApiEvento>(`${BASE}/${eventId}/sessoes/${sessionId}/setores/${sectorId}`, {
      method: 'DELETE',
      auth: true,
    })
    return toManagedEvent(event)
  }

  async remove(eventId: string): Promise<void> {
    await apiRequest<void>(`${BASE}/${eventId}`, { method: 'DELETE', auth: true })
  }
}
