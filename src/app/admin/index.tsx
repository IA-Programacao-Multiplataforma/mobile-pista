import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../presentation/components/AppText'
import { router } from 'expo-router'
import type { ManagedEvent, SessionStatus } from '../../domain/entities/ManagedEvent'
import { deleteEvent, listManagedEvents } from '../../infrastructure/dependencies'
import { RequireAuth } from '../../presentation/auth/RequireAuth'
import { Button } from '../../presentation/components/Button'
import { Screen } from '../../presentation/components/Screen'
import { Banner, Card, Eyebrow, Pill, Title } from '../../presentation/components/Ui'
import { confirmAction } from '../../presentation/confirm'
import { errorText, formatDateTime, formatPrice } from '../../presentation/format'
import { colors, font, spacing } from '../../presentation/theme'

const STATUS_LABEL: Record<SessionStatus, string> = { ESTREIA: 'Estreia', DISPONIVEL: 'Venda aberta', ESGOTADO: 'Esgotado' }
const STATUS_TONE: Record<SessionStatus, 'warn' | 'ok' | 'danger'> = { ESTREIA: 'warn', DISPONIVEL: 'ok', ESGOTADO: 'danger' }

export default function AdminRoute() {
  return (
    <RequireAuth role="ADMIN">
      <AdminScreen />
    </RequireAuth>
  )
}

function AdminScreen() {
  const [events, setEvents] = useState<ManagedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    try {
      setEvents(await listManagedEvents.execute())
      setError('')
    } catch (err) {
      setError(errorText(err, 'Não foi possível carregar os eventos.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(reload, 0)
    return () => clearTimeout(timer)
  }, [reload])

  return (
    <Screen wide>
      <View style={{ gap: spacing.xs }}>
        <Eyebrow>ÁREA DO ADMINISTRADOR</Eyebrow>
        <Title>Eventos cadastrados</Title>
      </View>

      <Button title="+ Novo evento" onPress={() => router.push('/admin/novo')} />
      <Button title="Ver relatório de vendas" variant="link" onPress={() => router.push('/admin/relatorio')} />

      {error !== '' && <Banner>{error}</Banner>}
      {loading && <Text style={font.small}>Carregando...</Text>}
      {!loading && events.length === 0 && !error && <Text style={font.small}>Nenhum evento cadastrado ainda.</Text>}

      {events.map((event) => (
        <EventCard key={event.id} event={event} onChanged={reload} onError={setError} />
      ))}
    </Screen>
  )
}

interface EventCardProps {
  event: ManagedEvent
  onChanged: () => void
  onError: (message: string) => void
}

// Resumo do evento na lista; a edição completa fica na tela "Editar"
function EventCard({ event, onChanged, onError }: EventCardProps) {
  const remove = async () => {
    if (!(await confirmAction('Excluir evento', `Excluir "${event.title}"?`))) return
    try {
      await deleteEvent.execute(event.id)
      onChanged()
    } catch (err) {
      onError(errorText(err, 'Não foi possível excluir o evento.'))
    }
  }

  return (
    <Card>
      <Text style={font.subtitle}>{event.title}</Text>
      <Text style={font.small}>
        {event.venue} · {event.city}
      </Text>

      {event.sessions.map((session) => (
        <View key={session.id} style={styles.session}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>{formatDateTime(session.eventDate)}</Text>
            <Pill label={STATUS_LABEL[session.status]} tone={STATUS_TONE[session.status]} />
          </View>
          <Text style={font.small}>venda abre em {formatDateTime(session.salesStart)}</Text>
          {session.sectors.map((sector) => (
            <View key={sector.id} style={styles.sector}>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: colors.ink }}>
                {sector.name} · {formatPrice(sector.price)}
              </Text>
              <Text style={font.small}>
                vendido {sector.sold} · disponível {sector.available} · capacidade {sector.capacity}
              </Text>
            </View>
          ))}
        </View>
      ))}

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button
          title="Editar evento"
          onPress={() => router.push({ pathname: '/admin/editar/[id]', params: { id: event.id } })}
          style={{ flex: 1 }}
        />
        <Button title="Excluir" variant="secondary" onPress={remove} style={{ flex: 1 }} />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  session: { gap: spacing.xs, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.line },
  sector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm, paddingVertical: spacing.xs },
})
