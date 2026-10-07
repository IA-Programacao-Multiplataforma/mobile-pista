import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Text } from '../presentation/components/AppText'
import { router } from 'expo-router'
import type { Order, OrderStatus, OwnedTicket } from '../domain/entities/Order'
import { listMyOrders, listMyTickets } from '../infrastructure/dependencies'
import { RequireAuth } from '../presentation/auth/RequireAuth'
import { useAuth } from '../presentation/auth/useAuth'
import { Button } from '../presentation/components/Button'
import { Screen } from '../presentation/components/Screen'
import { Banner, Card, Eyebrow, Pill, Title } from '../presentation/components/Ui'
import { errorText, formatPrice } from '../presentation/format'
import { TicketCard } from '../presentation/tickets/TicketCard'
import { font, spacing } from '../presentation/theme'

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDENTE: 'Processando',
  CONFIRMANDO: 'Confirmando',
  PAGO: 'Pago',
  RECUSADO: 'Recusado',
  CANCELADO: 'Cancelado',
}
const STATUS_TONE: Record<OrderStatus, 'ok' | 'warn' | 'danger' | 'neutral'> = {
  PENDENTE: 'warn',
  CONFIRMANDO: 'warn',
  PAGO: 'ok',
  RECUSADO: 'danger',
  CANCELADO: 'neutral',
}

export default function ProfileRoute() {
  return (
    <RequireAuth>
      <ProfileScreen />
    </RequireAuth>
  )
}

function ProfileScreen() {
  const { user, logout } = useAuth()
  const [tickets, setTickets] = useState<OwnedTicket[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listMyTickets.execute(), listMyOrders.execute()])
      .then(([myTickets, myOrders]) => {
        setTickets(myTickets)
        setOrders(myOrders)
      })
      .catch((err) => setError(errorText(err, 'Não foi possível carregar seus dados.')))
      .finally(() => setLoading(false))
  }, [])

  if (!user) return null

  const leave = async () => {
    await logout()
    router.replace('/')
  }

  return (
    <Screen wide>
      <Button title="‹ Voltar ao início" onPress={() => router.replace('/')} variant="link" />

      <View style={{ gap: spacing.xs }}>
        <Eyebrow>MEU PERFIL</Eyebrow>
        <Title>Olá, {user.username}.</Title>
        <Text style={font.small}>
          {user.email} · {user.roles.includes('ADMIN') ? 'Administrador' : 'Cliente'}
        </Text>
      </View>

      {error !== '' && <Banner>{error}</Banner>}
      {loading && <Text style={font.small}>Carregando...</Text>}

      <Text style={font.subtitle}>Meus ingressos</Text>
      {!loading && tickets.length === 0 && (
        <Card>
          <Text style={font.small}>Você ainda não comprou ingressos. Quando comprar, eles aparecem aqui.</Text>
        </Card>
      )}
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}

      <Text style={font.subtitle}>Meus pedidos</Text>
      {!loading && orders.length === 0 && (
        <Card>
          <Text style={font.small}>Nenhum pedido ainda.</Text>
        </Card>
      )}
      {orders.map((order) => (
        <Pressable
          key={order.id}
          accessibilityRole="button"
          accessibilityLabel={`Pedido de ${order.eventTitle}`}
          onPress={() => router.push({ pathname: '/pedido/[id]', params: { id: order.id } })}
        >
          <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={font.subtitle}>{order.eventTitle}</Text>
              <Text style={font.small}>{formatPrice(order.total)}</Text>
              {order.reason && order.status !== 'PAGO' && <Text style={font.small}>{order.reason}</Text>}
            </View>
            <Pill label={STATUS_LABEL[order.status]} tone={STATUS_TONE[order.status]} />
          </Card>
        </Pressable>
      ))}

      <Button title="Voltar ao início" onPress={() => router.replace('/')} />
      <Button title="Sair da conta" onPress={leave} variant="secondary" />
    </Screen>
  )
}
