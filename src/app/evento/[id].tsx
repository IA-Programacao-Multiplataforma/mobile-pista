import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'
import { Text } from '../../presentation/components/AppText'
import { router, useLocalSearchParams } from 'expo-router'
import type { EventSession, ManagedEvent, SessionStatus } from '../../domain/entities/ManagedEvent'
import { getEventDetails, joinQueue } from '../../infrastructure/dependencies'
import { ApiError } from '../../infrastructure/http/api'
import { useAuth } from '../../presentation/auth/useAuth'
import { Button } from '../../presentation/components/Button'
import { Screen } from '../../presentation/components/Screen'
import { Banner, Card, Pill } from '../../presentation/components/Ui'
import { errorText, formatDateTime, formatLongDate, formatPrice, formatTime } from '../../presentation/format'
import { colors, font, spacing } from '../../presentation/theme'
import { useLayout } from '../../presentation/useLayout'

const STATUS_LABEL: Record<SessionStatus, string> = {
  ESTREIA: 'Estreia',
  DISPONIVEL: 'Venda aberta',
  ESGOTADO: 'Esgotado',
}
const STATUS_TONE: Record<SessionStatus, 'warn' | 'ok' | 'danger'> = {
  ESTREIA: 'warn',
  DISPONIVEL: 'ok',
  ESGOTADO: 'danger',
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1500&q=85'

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, logout } = useAuth()
  const { isDesktop } = useLayout()

  const [event, setEvent] = useState<ManagedEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [joining, setJoining] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<{ sessionId: string; message: string } | null>(null)

  useEffect(() => {
    getEventDetails
      .execute(id)
      .then(setEvent)
      .catch((err) => setLoadError(errorText(err, 'Não foi possível carregar o evento.')))
      .finally(() => setLoading(false))
  }, [id])

  const handleJoin = async (session: EventSession) => {
    if (!user) {
      router.push({ pathname: '/entrar', params: { from: `/evento/${id}` } })
      return
    }

    setJoining(session.id)
    setJoinError(null)
    try {
      await joinQueue.execute(session.id)
      router.push(`/fila/${session.id}`)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await logout()
        router.push({ pathname: '/entrar', params: { from: `/evento/${id}` } })
        return
      }
      setJoinError({ sessionId: session.id, message: errorText(err, 'Não foi possível entrar na fila.') })
    } finally {
      setJoining(null)
    }
  }

  const now = new Date()
  const sessions = (event?.sessions ?? [])
    .filter((session) => new Date(session.eventDate) >= now)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))

  return (
    <Screen wide>
      {loading && <ActivityIndicator color={colors.green} />}
      {loadError !== '' && <Banner>{loadError}</Banner>}

      {event && (
        <View style={isDesktop ? styles.columns : { gap: spacing.lg }}>
          <View style={isDesktop ? styles.leftColumn : undefined}>
          <Card style={styles.hero}>
            <Image
              source={{ uri: event.imageUrl || FALLBACK_IMAGE }}
              style={[styles.heroImage, isDesktop && { height: 320 }]}
              accessibilityLabel={event.imageAlt || event.title}
            />
            <View style={{ padding: spacing.lg, gap: spacing.xs }}>
              <Text style={font.title}>{event.title}</Text>
              {event.description !== '' && <Text style={font.body}>{event.description}</Text>}
              <Text style={font.small}>
                {event.venue} · {event.city}
              </Text>
            </View>
          </Card>
          </View>

          <View style={isDesktop ? styles.rightColumn : { gap: spacing.lg }}>
          <Text style={font.subtitle}>Datas disponíveis</Text>
          {sessions.length === 0 && <Text style={font.small}>Não há datas futuras para este evento.</Text>}

          {sessions.map((session) => {
            const salesOpen = session.status !== 'ESTREIA'
            const soldOut = session.status === 'ESGOTADO'

            return (
              <Card key={session.id}>
                <View style={styles.sessionHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionDate}>{formatLongDate(session.eventDate)}</Text>
                    <Text style={font.small}>{formatTime(session.eventDate)}</Text>
                  </View>
                  <Pill label={STATUS_LABEL[session.status]} tone={STATUS_TONE[session.status]} />
                </View>

                {session.sectors.map((sector) => (
                  <View key={sector.id} style={styles.sectorRow}>
                    <Text style={[font.body, { flex: 1 }]}>{sector.name}</Text>
                    <Text style={font.body}>{formatPrice(sector.price)}</Text>
                    <Text style={[font.small, styles.sectorAvailability]}>
                      {!salesOpen ? 'em breve' : sector.available > 0 ? `${sector.available} disp.` : 'esgotado'}
                    </Text>
                  </View>
                ))}

                {soldOut && <Banner kind="warn">Os ingressos acabaram, mas você pode entrar na fila e aguardar desistências.</Banner>}
                {joinError?.sessionId === session.id && <Banner>{joinError.message}</Banner>}

                <Button
                  title={
                    !salesOpen
                      ? `A venda abre em ${formatDateTime(session.salesStart)}`
                      : user
                        ? 'Entrar na fila'
                        : 'Entre para comprar'
                  }
                  onPress={() => handleJoin(session)}
                  disabled={!salesOpen}
                  loading={joining === session.id}
                />
              </Card>
            )
          })}
          </View>
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl },
  leftColumn: { flex: 1.15 },
  rightColumn: { flex: 1, gap: spacing.lg },
  hero: { padding: 0, overflow: 'hidden', gap: 0 },
  heroImage: { width: '100%', height: 180, backgroundColor: colors.line },
  sessionHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  sessionDate: { fontSize: 15, fontWeight: '700', color: colors.ink },
  sectorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: '#f0f2ed' },
  sectorAvailability: { minWidth: 70, textAlign: 'right' },
})
