import { useRef, useState } from 'react'
import * as Crypto from 'expo-crypto'
import { router } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import type { EventSession } from '../../domain/entities/ManagedEvent'
import { placeOrder } from '../../infrastructure/dependencies'
import { ApiError } from '../../infrastructure/http/api'
import { Button } from '../components/Button'
import { Banner } from '../components/Ui'
import { errorText, formatPrice } from '../format'
import { colors, font, radius, spacing } from '../theme'

// O serviço de estoque também confere este limite
const MAX_PER_PURCHASE = 6

interface SessionPurchaseProps {
  session: EventSession
  onUnauthorized: () => void
}

// Cliente escolhe setores e quantidades; "Comprar" cria o pedido e leva à tela que acompanha o status
export function SessionPurchase({ session, onUnauthorized }: SessionPurchaseProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // Gerada uma vez: num duplo toque o servidor devolve o mesmo pedido em vez de criar outro
  const idempotencyKey = useRef(Crypto.randomUUID())

  const totalQuantity = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0)
  const total = session.sectors.reduce((sum, sector) => sum + sector.price * (quantities[sector.id] ?? 0), 0)

  const change = (sectorId: string, delta: number, max: number) => {
    setQuantities((current) => ({
      ...current,
      [sectorId]: Math.min(max, Math.max(0, (current[sectorId] ?? 0) + delta)),
    }))
  }

  const buy = async () => {
    setBusy(true)
    setError('')
    try {
      const items = Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([sectorId, quantity]) => ({ sectorId, quantity }))
      const placed = await placeOrder.execute(session.id, items, idempotencyKey.current)
      router.push({ pathname: '/pedido/[id]', params: { id: placed.orderId } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized()
        return
      }
      setError(errorText(err, 'Não foi possível criar o pedido.'))
      setBusy(false)
    }
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {session.sectors.map((sector) => {
        const quantity = quantities[sector.id] ?? 0
        const max = Math.min(MAX_PER_PURCHASE - (totalQuantity - quantity), sector.available)

        return (
          <View key={sector.id} style={styles.sectorRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.sectorName}>{sector.name}</Text>
              <Text style={font.body}>{formatPrice(sector.price)}</Text>
              <Text style={font.small}>{sector.available > 0 ? `${sector.available} disponíveis` : 'esgotado'}</Text>
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

      <Text style={font.small}>Máximo de {MAX_PER_PURCHASE} ingressos por compra.</Text>
      {error !== '' && <Banner>{error}</Banner>}

      <Button
        title={`Comprar (${formatPrice(total)})`}
        onPress={buy}
        loading={busy}
        disabled={totalQuantity === 0 || busy}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  sectorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: '#f0f2ed' },
  sectorName: { fontSize: 14, fontWeight: '700', color: colors.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepButton: { width: 34, height: 34, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  stepDisabled: { opacity: 0.4 },
  stepValue: { minWidth: 20, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.ink },
})
