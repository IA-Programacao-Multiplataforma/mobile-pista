import type { Bag, BagRequestItem, QueueStatus } from '../../domain/entities/Queue'
import type { QueueRepository } from '../../domain/repositories/QueueRepository'
import { ApiError, apiRequest } from '../http/api'
import { toBag, toQueueStatus, type ApiSacola, type ApiStatusFila } from '../http/queueApi'

// Gateway (8080) remove o "/fila" e repassa ao serviço de fila (8084)
const base = (sessionId: string) => `/fila/sessoes/${sessionId}`

export class HttpQueueRepository implements QueueRepository {
  async join(sessionId: string): Promise<QueueStatus> {
    const status = await apiRequest<ApiStatusFila>(`${base(sessionId)}/entrar`, {
      method: 'POST',
      auth: true,
    })
    return toQueueStatus(status)
  }

  async status(sessionId: string): Promise<QueueStatus | null> {
    try {
      const status = await apiRequest<ApiStatusFila>(`${base(sessionId)}/status`, { auth: true })
      return toQueueStatus(status)
    } catch (error) {
      // 404 aqui não é falha: o cliente simplesmente ainda não entrou na fila
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  }

  async leave(sessionId: string): Promise<void> {
    await apiRequest<void>(`${base(sessionId)}/sair`, { method: 'DELETE', auth: true })
  }

  async setBag(sessionId: string, items: BagRequestItem[]): Promise<Bag> {
    const bag = await apiRequest<ApiSacola>(`${base(sessionId)}/sacola`, {
      method: 'POST',
      auth: true,
      body: { itens: items.map((item) => ({ setorId: item.sectorId, quantidade: item.quantity })) },
    })
    return toBag(bag)
  }

  async getBag(sessionId: string): Promise<Bag | null> {
    try {
      return toBag(await apiRequest<ApiSacola>(`${base(sessionId)}/sacola`, { auth: true }))
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  }

  async clearBag(sessionId: string): Promise<void> {
    await apiRequest<void>(`${base(sessionId)}/sacola`, { method: 'DELETE', auth: true })
  }
}
