import { useEffect, useState } from 'react'

export function useCountdown(isoInstant: string | null): number | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!isoInstant) return

    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [isoInstant])

  if (!isoInstant) return null
  return Math.max(0, Math.ceil((new Date(isoInstant).getTime() - now) / 1000))
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
