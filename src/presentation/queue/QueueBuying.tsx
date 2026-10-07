import { useEffect, useRef, useState } from 'react'
import * as Crypto from 'expo-crypto'
import { router } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import type { Bag, QueueStatus } from '../../domain/entities/Queue'
import { clearBag, getBag, placeOrder, setBag } from '../../infrastructure/dependencies'
import { ApiError } from '../../infrastructure/http/api'
import { Button } from '../components/Button'
import { Banner, Card } from '../components/Ui'
import { errorText, formatPrice } from '../format'
import { colors, font, radius, spacing } from '../theme'
import { formatCountdown, useCountdown } from './useCountdown'

// O serviço de estoque também confere este limite
const MAX_PER_PURCHASE = 6

interface QueueBuyingProps {
  status: QueueStatus
  onTimeUp: () => void
}

export function QueueBuying({ status, onTimeUp }: QueueBuyingProps) {
  const sessionId = status.sessionId
  const [bag, setBagState] = useState<Bag | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const timeUpSent = useRef(false)
  // Gerada uma vez: num duplo toque ou rede instável o servidor devolve o mesmo pedido em vez de criar outro
  const idempotencyKey = useRef(Crypto.randomUUID())

  const secondsLeft = useCountdown(status.expiresAt)

  // Recupera a sacola que o cliente já tinha (ex.: reabriu o app)
  useEffect(() => {
    getBag
      .execute(sessionId)
      .then((current) => {
        setBagState(current)
        if (current) {
          setQuantities(Object.fromEntries(current.items.map((item) => [item.sectorId, item.quantity])))
        }
      })
      .catch(() => undefined)
  }, [sessionId])

  useEffect(() => {
    if (secondsLeft === 0 && !timeUpSent.current) {
      timeUpSent.current = true
      onTimeUp()
    }
  }, [secondsLeft, onTimeUp])

  const heldBySector = (sectorId: string) => bag?.items.find((item) => item.sectorId === sectorId)?.quantity ?? 0

  const totalQuantity = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0)
  const selectedTotal = status.sectors.reduce((sum, sector) => sum + sector.price * (quantities[sector.id] ?? 0), 0)

  const change = (sectorId: string, delta: number, max: number) => {
    setQuantities((current) => ({
      ...current,
      [sectorId]: Math.min(max, Math.max(0, (current[sectorId] ?? 0) + delta)),
    }))
  }

  const reserve = async () => {
    setBusy(true)
    setError('')
    try {
      const items = Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([sectorId, quantity]) => ({ sectorId, quantity }))
      setBagState(await setBag.execute(sessionId, items))
    } catch (err) {
      setError(errorText(err, 'Não foi possível reservar os ingressos.'))
      // A sacola anterior pode ter mudado no servidor: confere o que ficou valendo
      getBag.execute(sessionId).then(setBagState).catch(() => undefined)
    } finally {
      setBusy(false)
    }
  }

  const confirm = async () => {
    setBusy(true)
    setError('')
    try {
      const placed = await placeOrder.execute(sessionId, idempotencyKey.current)
      router.replace({ pathname: '/pedido/[id]', params: { id: placed.orderId, sessionId } })
    } catch (err) {
      // 409 com pedidoId: a sacola já virou um pedido (ex.: em outra tela), então leva o cliente a ele
      if (err instanceof ApiError && err.status === 409 && typeof err.data.pedidoId === 'string') {
        router.replace({ pathname: '/pedido/[id]', params: { id: err.data.pedidoId, sessionId } })
        return
      }
      setError(errorText(err, 'Não foi possível confirmar a compra.'))
      setBusy(false)
    }
  }

  const empty = async () => {
    setBusy(true)
    setError('')
    try {
      await clearBag.execute(sessionId)
      setBagState(null)
      setQuantities({})
    } catch (err) {
      setError(errorText(err, 'Não foi possível esvaziar a sacola.'))
    } finally {
      setBusy(false)
    }
  }

  const bagMatchesSelection =
    bag !== null && status.sectors.every((sector) => heldBySector(sector.id) === (quantities[sector.id] ?? 0))

  return (
    <Card>
      <View style={styles.timer} accessibilityRole="timer">
        <Ionicons name="timer-outline" size={16} color={colors.ink} />
        <Text style={font.body}>Tempo para finalizar</Text>
        <Text style={styles.timerValue}>{secondsLeft === null ? '--:--' : formatCountdown(secondsLeft)}</Text>
      </View>

      <Text style={[font.subtitle, { textAlign: 'center' }]}>É a sua vez! Escolha seus ingressos.</Text>

      <View>
        {status.sectors.map((sector) => {
          const quantity = quantities[sector.id] ?? 0
          const max = Math.min(MAX_PER_PURCHASE - (totalQuantity - quantity), sector.available + heldBySector(sector.id))
          const soldOut = sector.available + heldBySector(sector.id) === 0

          return (
            <View key={sector.id} style={styles.sectorRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.sectorName}>{sector.name}</Text>
                <Text style={font.body}>{formatPrice(sector.price)}</Text>
                <Text style={font.small}>{soldOut ? 'esgotado' : `${sector.available} disponíveis`}</Text>
              </View>
              <View style={styles.stepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Menos um ingresso de ${sector.name}`}
                  onPress={() => change(sector.id, -1, max)}
                  disabled={quantity === 0 || busy}
                  style={[styles.stepButton, (quantity === 0 || busy) && styles.stepDisabled]}
                >
                  <Ionicons name="remove" size={16} color={colors.ink} />
                </Pressable>
                <Text style={styles.stepValue} accessibilityLabel={`${quantity} de ${sector.name}`}>{quantity}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Mais um ingresso de ${sector.name}`}
                  onPress={() => change(sector.id, 1, max)}
                  disabled={quantity >= max || busy}
                  style={[styles.stepButton, (quantity >= max || busy) && styles.stepDisabled]}
                >
                  <Ionicons name="add" size={16} color={colors.ink} />
                </Pressable>
              </View>
            </View>
          )
        })}
      </View>

      <Text style={font.small}>Máximo de {MAX_PER_PURCHASE} ingressos por compra.</Text>

      {error !== '' && <Banner>{error}</Banner>}

      <Button
        title={bag ? `Atualizar sacola (${formatPrice(selectedTotal)})` : `Reservar ingressos (${formatPrice(selectedTotal)})`}
        onPress={reserve}
        loading={busy}
        disabled={totalQuantity === 0 || bagMatchesSelection}
        variant={bag ? 'secondary' : 'primary'}
      />

      {bag && (
        <View style={styles.bag}>
          <Text style={font.subtitle}>Sua sacola</Text>
          {bag.items.map((item) => (
            <View key={item.sectorId} style={styles.bagLine}>
              <Text style={font.body}>
                {item.quantity}× {item.sectorName}
              </Text>
              <Text style={styles.sectorName}>{formatPrice(item.subtotal)}</Text>
            </View>
          ))}
          <View style={[styles.bagLine, styles.bagTotal]}>
            <Text style={font.body}>Total</Text>
            <Text style={font.subtitle}>{formatPrice(bag.total)}</Text>
          </View>
          <Text style={font.small}>Seus ingressos estão reservados enquanto o contador não zerar.</Text>
          <Button title="Confirmar compra" onPress={confirm} loading={busy} disabled={busy} />
          <Button title="Esvaziar sacola" onPress={empty} variant="link" disabled={busy} />
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  timer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.paper, borderRadius: radius.sm },
  timerValue: { fontSize: 22, fontWeight: '700', color: colors.ink },
  sectorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: '#f0f2ed' },
  sectorName: { fontSize: 14, fontWeight: '700', color: colors.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepButton: { width: 34, height: 34, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  stepDisabled: { opacity: 0.4 },
  stepValue: { minWidth: 20, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.ink },
  bag: { gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.paper, borderRadius: radius.md },
  bagLine: { flexDirection: 'row', justifyContent: 'space-between' },
  bagTotal: { marginTop: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.line },
})
