import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, TextInput } from '../../presentation/components/AppText'
import { router } from 'expo-router'
import type { ManagedEvent, Sector, SessionStatus } from '../../domain/entities/ManagedEvent'
import { addEventSession, adjustSector, deleteEvent, listManagedEvents } from '../../infrastructure/dependencies'
import { emptySession, toSessionData, type SessionDraft } from '../../presentation/admin/drafts'
import { SessionFields } from '../../presentation/admin/SessionFields'
import { RequireAuth } from '../../presentation/auth/RequireAuth'
import { Button } from '../../presentation/components/Button'
import { Screen } from '../../presentation/components/Screen'
import { Banner, Card, Eyebrow, Pill, Title } from '../../presentation/components/Ui'
import { confirmAction } from '../../presentation/confirm'
import { errorText, formatDateTime, formatPrice } from '../../presentation/format'
import { colors, font, radius, spacing } from '../../presentation/theme'

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

function EventCard({ event, onChanged, onError }: EventCardProps) {
  const [addingDate, setAddingDate] = useState(false)
  const [draft, setDraft] = useState<SessionDraft>(emptySession())
  const [saving, setSaving] = useState(false)

  const remove = async () => {
    if (!(await confirmAction('Excluir evento', `Excluir "${event.title}"?`))) return
    try {
      await deleteEvent.execute(event.id)
      onChanged()
    } catch (err) {
      onError(errorText(err, 'Não foi possível excluir o evento.'))
    }
  }

  const addDate = async () => {
    setSaving(true)
    try {
      await addEventSession.execute(event.id, toSessionData(draft))
      setDraft(emptySession())
      setAddingDate(false)
      onChanged()
    } catch (err) {
      onError(errorText(err, 'Não foi possível adicionar a data.'))
    } finally {
      setSaving(false)
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
            <SectorLine key={sector.id} eventId={event.id} sessionId={session.id} sector={sector} onChanged={onChanged} onError={onError} />
          ))}
        </View>
      ))}

      {addingDate && (
        <>
          <SessionFields value={draft} onChange={setDraft} title="Nova data" />
          <Button title="Adicionar data" onPress={addDate} loading={saving} />
        </>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button title={addingDate ? 'cancelar nova data' : '+ nova data'} variant="link" onPress={() => setAddingDate((open) => !open)} />
        <Button title="excluir evento" variant="link" onPress={remove} />
      </View>
    </Card>
  )
}

interface SectorLineProps {
  eventId: string
  sessionId: string
  sector: Sector
  onChanged: () => void
  onError: (message: string) => void
}

function SectorLine({ eventId, sessionId, sector, onChanged, onError }: SectorLineProps) {
  const [capacity, setCapacity] = useState(String(sector.capacity))
  const [saving, setSaving] = useState(false)

  const changed = Number(capacity) !== sector.capacity

  const save = async () => {
    setSaving(true)
    try {
      await adjustSector.execute(eventId, sessionId, sector.id, { capacity: Number(capacity) })
      onChanged()
    } catch (err) {
      onError(errorText(err, 'Não foi possível ajustar o setor.'))
      setCapacity(String(sector.capacity))
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.sector}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>
          {sector.name} · {formatPrice(sector.price)}
        </Text>
        <Text style={font.small}>
          disponível {sector.available} · reservado {sector.reserved} · vendido {sector.sold}
        </Text>
      </View>
      <TextInput
        accessibilityLabel={`Capacidade de ${sector.name}`}
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="number-pad"
        style={styles.capacity}
      />
      {changed && <Button title="salvar" variant="link" onPress={save} loading={saving} />}
    </View>
  )
}

const styles = StyleSheet.create({
  session: { gap: spacing.xs, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.line },
  sector: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  capacity: { width: 64, height: 36, paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, fontSize: 13, color: colors.ink, backgroundColor: colors.white },
})
