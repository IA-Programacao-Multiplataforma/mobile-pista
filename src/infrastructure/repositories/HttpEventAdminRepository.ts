import type {
  ManagedEvent,
  NewEventData,
  NewSessionData,
  SectorAdjustment,
} from '../../domain/entities/ManagedEvent'
import type { EventAdminRepository } from '../../domain/repositories/EventAdminRepository'
import { apiRequest } from '../http/api'
import { toApiEvento, toApiSessao, toManagedEvent, type ApiEvento } from '../http/eventApi'

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
        body: { capacidade: adjustment.capacity, preco: adjustment.price },
        auth: true,
      },
    )
    return toManagedEvent(event)
  }

  async remove(eventId: string): Promise<void> {
    await apiRequest<void>(`${BASE}/${eventId}`, { method: 'DELETE', auth: true })
  }
}
