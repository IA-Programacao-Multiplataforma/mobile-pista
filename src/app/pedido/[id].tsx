import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Text } from '../../presentation/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../../presentation/auth/useAuth'
import { RequireAuth } from '../../presentation/auth/RequireAuth'
import { Button } from '../../presentation/components/Button'
import { Screen } from '../../presentation/components/Screen'
import { Banner, Card, Eyebrow, Title } from '../../presentation/components/Ui'
import { formatDateTime, formatPrice } from '../../presentation/format'
import { useOrderPolling } from '../../presentation/order/useOrderPolling'
import { colors, font, radius, spacing } from '../../presentation/theme'

export default function OrderRoute() {
  return (
    <RequireAuth>
      <OrderScreen />
    </RequireAuth>
  )
}

function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { logout } = useAuth()
  const { order, loading, error, sessionExpired, elapsedSeconds } = useOrderPolling(id)

  useEffect(() => {
    if (sessionExpired) {
      void logout().then(() => router.replace({ pathname: '/entrar', params: { from: `/pedido/${id}` } }))
    }
  }, [sessionExpired, logout, id])

  const status = order?.status

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <Eyebrow>SEU PEDIDO</Eyebrow>
        {order && <Title>{order.eventTitle}</Title>}
        {order && <Text style={font.small}>{formatDateTime(order.eventDate)} · {formatPrice(order.total)}</Text>}
      </View>

      {loading && <ActivityIndicator color={colors.green} />}
      {error !== '' && !loading && <Banner kind="warn">{error} Tentando de novo...</Banner>}

      {(status === 'PENDENTE' || status === 'CONFIRMANDO') && (
        <Card style={{ alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.green} />
          <Text style={font.subtitle}>Confirmando seus ingressos...</Text>
          <Text style={[font.small, { textAlign: 'center' }]}>
            Pode levar alguns segundos. Não feche esta tela.
          </Text>
          {elapsedSeconds >= 45 && (
            <Banner kind="warn">
              Está demorando mais que o normal. Você pode sair desta tela: o resultado aparece em &quot;Meus pedidos&quot; no seu perfil.
            </Banner>
          )}
        </Card>
      )}

      {status === 'PAGO' && order && (
        <>
          <Card style={{ alignItems: 'center' }}>
            <View style={{ width: 54, height: 54, borderRadius: radius.pill, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark" size={28} color={colors.green} />
            </View>
            <Text style={font.title}>Compra confirmada!</Text>
            <Text style={[font.small, { textAlign: 'center' }]}>Seus ingressos estão garantidos. Apresente o código na entrada.</Text>
          </Card>

          {order.tickets.map((ticket) => (
            <Card key={ticket.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={font.small}>INGRESSO · {ticket.sectorName.toUpperCase()}</Text>
                <Text style={{ fontSize: 20, fontWeight: '700', letterSpacing: 1, color: colors.ink }} selectable>
                  {ticket.code}
                </Text>
              </View>
              <Ionicons name="ticket-outline" size={26} color={colors.green} />
            </Card>
          ))}

          <Button title="Ver meus ingressos" onPress={() => router.replace('/perfil')} />
          <Button title="Voltar ao início" onPress={() => router.replace('/')} variant="link" />
        </>
      )}

      {status === 'CANCELADO' && (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.warn} />
          <Text style={font.subtitle}>Pedido cancelado</Text>
          <Banner kind="warn">
            {order?.reason === 'Reserva expirada ou liberada'
              ? 'Sua reserva expirou antes da confirmação.'
              : (order?.reason ?? 'Não foi possível confirmar seus ingressos.')}
          </Banner>
          <Button title="Voltar ao início" onPress={() => router.replace('/')} />
        </Card>
      )}
    </Screen>
  )
}
