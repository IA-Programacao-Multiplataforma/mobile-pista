import { useCallback, useEffect, useRef, useState } from 'react'
import { FINAL_ORDER_STATUSES, type Order } from '../../domain/entities/Order'
import { ApiError } from '../../infrastructure/http/api'
import { getOrder } from '../../infrastructure/dependencies'

const POLL_INTERVAL_MS = 2000

interface OrderPolling {
  order: Order | null
  loading: boolean
  error: string
  sessionExpired: boolean
  elapsedSeconds: number
}

// A confirmação é assíncrona (RabbitMQ): consulta a cada 2 s e para sozinha em PAGO ou CANCELADO
export function useOrderPolling(orderId: string): OrderPolling {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sessionExpired, setSessionExpired] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const alive = useRef(true)

  const fetchOrder = useCallback(async () => {
    try {
      const next = await getOrder.execute(orderId)
      if (!alive.current) return
      setOrder(next)
      setError('')
    } catch (err) {
      if (!alive.current) return
      if (err instanceof ApiError && err.status === 401) {
        setSessionExpired(true)
        return
      }
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar o pedido.')
    } finally {
      if (alive.current) setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    alive.current = true
    const timer = setTimeout(fetchOrder, 0)
    return () => {
      alive.current = false
      clearTimeout(timer)
    }
  }, [fetchOrder])

  const finished = order !== null && FINAL_ORDER_STATUSES.includes(order.status)

  useEffect(() => {
    if (finished || sessionExpired) return

    const poll = setInterval(() => void fetchOrder(), POLL_INTERVAL_MS)
    const clock = setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000)
    return () => {
      clearInterval(poll)
      clearInterval(clock)
    }
  }, [finished, sessionExpired, fetchOrder])

  return { order, loading, error, sessionExpired, elapsedSeconds }
}
