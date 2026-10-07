import { useCallback, useEffect, useRef, useState } from 'react'
import type { QueueStatus } from '../../domain/entities/Queue'
import { ApiError } from '../../infrastructure/http/api'
import { getQueueStatus } from '../../infrastructure/dependencies'

const POLL_INTERVAL_MS = 3000

interface QueuePolling {
  status: QueueStatus | null
  loading: boolean
  error: string
  sessionExpired: boolean
  refresh: () => Promise<void>
  setStatus: (status: QueueStatus | null) => void
}

// Consulta a cada 3 s só enquanto está AGUARDANDO ou ATIVO; para ao sair, expirar ou desistir
export function useQueuePolling(sessionId: string): QueuePolling {
  const [status, setStatus] = useState<QueueStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sessionExpired, setSessionExpired] = useState(false)
  const alive = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const next = await getQueueStatus.execute(sessionId)
      if (!alive.current) return
      setStatus(next)
      setError('')
    } catch (err) {
      if (!alive.current) return
      if (err instanceof ApiError && err.status === 401) {
        setSessionExpired(true)
        return
      }
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a fila.')
    } finally {
      if (alive.current) setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    alive.current = true
    const timer = setTimeout(refresh, 0)
    return () => {
      alive.current = false
      clearTimeout(timer)
    }
  }, [refresh])

  const inDispute = status?.state === 'AGUARDANDO' || status?.state === 'ATIVO'

  useEffect(() => {
    if (!inDispute || sessionExpired) return

    const timer = setInterval(() => void refresh(), POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [inDispute, sessionExpired, refresh])

  return { status, loading, error, sessionExpired, refresh, setStatus }
}
