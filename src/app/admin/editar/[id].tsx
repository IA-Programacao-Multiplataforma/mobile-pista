import { useCallback, useEffect, useState } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import type { EventCategoryCode, EventSession, ManagedEvent, Sector, SessionStatus } from '../../../domain/entities/ManagedEvent'
import {
  addEventSession,
  addSector,
  adjustSector,
  deleteEvent,
  deleteSector,
  deleteSession,
  getEventDetails,
  updateEvent,
  updateSession,
} from '../../../infrastructure/dependencies'
import { emptySession, isoToDateText, priceToText, toLocalDateTime, toNumber, toSessionData, type SessionDraft } from '../../../presentation/admin/drafts'
import { SessionFields } from '../../../presentation/admin/SessionFields'
import { RequireAuth } from '../../../presentation/auth/RequireAuth'
import { Text } from '../../../presentation/components/AppText'
import { Button } from '../../../presentation/components/Button'
import { Screen } from '../../../presentation/components/Screen'
import { TextField } from '../../../presentation/components/TextField'
import { Banner, Card, Eyebrow, Pill, Title } from '../../../presentation/components/Ui'
import { confirmAction } from '../../../presentation/confirm'
import { errorText, formatDateTime } from '../../../presentation/format'
import { colors, font, radius, spacing } from '../../../presentation/theme'

const CATEGORIES: { code: EventCategoryCode; label: string }[] = [
  { code: 'MUSICA', label: 'Música' },
  { code: 'FESTIVAL', label: 'Festival' },
  { code: 'TEATRO', label: 'Teatro' },
  { code: 'EXPERIENCIA', label: 'Experiência' },
]

const STATUS_LABEL: Record<SessionStatus, string> = { ESTREIA: 'Estreia', DISPONIVEL: 'Venda aberta', ESGOTADO: 'Esgotado' }
const STATUS_TONE: Record<SessionStatus, 'warn' | 'ok' | 'danger'> = { ESTREIA: 'warn', DISPONIVEL: 'ok', ESGOTADO: 'danger' }

// Funções que cada bloco recebe para avisar a tela do resultado: o evento atualizado ou o erro
interface Feedback {
  onApply: (event: ManagedEvent, message: string) => void
  onFail: (error: unknown, fallback: string) => void
}

export default function EditEventRoute() {
  return (
    <RequireAuth role="ADMIN">
      <EditEventScreen />
    </RequireAuth>
  )
}

function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [event, setEvent] = useState<ManagedEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setEvent(await getEventDetails.execute(id))
    } catch (err) {
      setError(errorText(err, 'Não foi possível carregar o evento.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [load])

  const feedback: Feedback = {
    onApply: (updated, message) => {
      setEvent(updated)
      setNotice(message)
      setError('')
    },
    onFail: (err, fallback) => {
      setError(errorText(err, fallback))
      setNotice('')
    },
  }

  const removeEvent = async () => {
    if (!event) return
    if (!(await confirmAction('Excluir evento', `Excluir "${event.title}" e todas as datas e tipos de ingresso?`))) return
    try {
      await deleteEvent.execute(event.id)
      router.replace('/admin')
    } catch (err) {
      feedback.onFail(err, 'Não foi possível excluir o evento.')
    }
  }

  return (
    <Screen wide>
      <View style={{ gap: spacing.xs }}>
        <Eyebrow>ÁREA DO ADMINISTRADOR</Eyebrow>
        <Title>{event ? `Editar: ${event.title}` : 'Editar evento'}</Title>
      </View>

      <Button title="‹ Voltar à lista de eventos" variant="link" onPress={() => router.replace('/admin')} />

      {notice !== '' && <Banner kind="ok">{notice}</Banner>}
      {error !== '' && <Banner>{error}</Banner>}
      {loading && <Text style={font.small}>Carregando...</Text>}

      {event && (
        <>
          <EventDataForm key={`dados-${event.id}`} event={event} {...feedback} />

          <Text style={font.subtitle}>Datas e tipos de ingresso</Text>
          {event.sessions.map((session, index) => (
            <SessionEditor
              key={session.id}
              event={event}
              session={session}
              index={index}
              {...feedback}
            />
          ))}

          <NewSessionForm event={event} {...feedback} />

          <Card>
            <Text style={font.subtitle}>Excluir evento</Text>
            <Text style={font.small}>
              Só é possível se nenhum ingresso foi vendido. Apaga o evento, todas as datas e todos os tipos de ingresso.
            </Text>
            <Button title="Excluir evento" variant="danger" onPress={removeEvent} />
          </Card>
        </>
      )}
    </Screen>
  )
}

// ------------------------------------------------------------------ dados do evento

function EventDataForm({ event, onApply, onFail }: { event: ManagedEvent } & Feedback) {
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description)
  const [category, setCategory] = useState<EventCategoryCode>(event.category)
  const [venue, setVenue] = useState(event.venue)
  const [city, setCity] = useState(event.city)
  const [imageUrl, setImageUrl] = useState(event.imageUrl)
  const [imageAlt, setImageAlt] = useState(event.imageAlt)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const updated = await updateEvent.execute(event.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        venue: venue.trim(),
        city: city.trim(),
        imageUrl: imageUrl.trim(),
        imageAlt: imageAlt.trim(),
      })
      onApply(updated, 'Dados do evento salvos.')
    } catch (err) {
      onFail(err, 'Não foi possível salvar os dados do evento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <Text style={font.subtitle}>Dados do evento</Text>

      <TextField label="Título" value={title} onChangeText={setTitle} />
      <TextField label="Descrição" value={description} onChangeText={setDescription} multiline numberOfLines={5} style={{ minHeight: 110, paddingTop: spacing.md, textAlignVertical: 'top' }} />

      <Text style={font.label}>Categoria</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((item) => (
          <Pressable
            key={item.code}
            accessibilityRole="button"
            accessibilityState={{ selected: category === item.code }}
            onPress={() => setCategory(item.code)}
            style={[styles.chip, category === item.code && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === item.code && { color: colors.white }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <TextField label="Local" value={venue} onChangeText={setVenue} />
      <TextField label="Cidade" value={city} onChangeText={setCity} />
      <TextField label="URL da imagem" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" keyboardType="url" placeholder="https://..." />
      {imageUrl.trim() !== '' && <Image source={{ uri: imageUrl.trim() }} style={styles.preview} accessibilityLabel="Pré-visualização da imagem" />}
      <TextField label="Texto alternativo da imagem" value={imageAlt} onChangeText={setImageAlt} />

      <Button title="Salvar dados do evento" onPress={save} loading={saving} disabled={!title.trim() || !venue.trim() || !city.trim()} />
    </Card>
  )
}

// ------------------------------------------------------------------ uma data (sessão)

function SessionEditor({ event, session, index, onApply, onFail }: { event: ManagedEvent; session: EventSession; index: number } & Feedback) {
  const [eventDate, setEventDate] = useState(isoToDateText(session.eventDate))
  const [salesStart, setSalesStart] = useState(isoToDateText(session.salesStart))
  const [saving, setSaving] = useState(false)

  const totalSold = session.sectors.reduce((sum, sector) => sum + sector.sold, 0)
  const changed = eventDate !== isoToDateText(session.eventDate) || salesStart !== isoToDateText(session.salesStart)

  const saveDates = async () => {
    setSaving(true)
    try {
      const updated = await updateSession.execute(event.id, session.id, {
        eventDate: toLocalDateTime(eventDate, 'Data e hora do evento'),
        salesStart: toLocalDateTime(salesStart, 'Início da venda'),
      })
      onApply(updated, `Data ${index + 1} salva.`)
    } catch (err) {
      onFail(err, 'Não foi possível salvar a data.')
    } finally {
      setSaving(false)
    }
  }

  const removeSession = async () => {
    const message = `Excluir a data de ${formatDateTime(session.eventDate)} e todos os seus tipos de ingresso?`
    if (!(await confirmAction('Excluir data', message))) return
    try {
      onApply(await deleteSession.execute(event.id, session.id), 'Data excluída.')
    } catch (err) {
      onFail(err, 'Não foi possível excluir a data.')
    }
  }

  return (
    <Card>
      <View style={styles.head}>
        <Text style={font.subtitle}>Data {index + 1}</Text>
        <Pill label={STATUS_LABEL[session.status]} tone={STATUS_TONE[session.status]} />
      </View>
      <Text style={font.small}>{totalSold > 0 ? `${totalSold} ingresso(s) vendido(s) nesta data` : 'nenhum ingresso vendido ainda'}</Text>

      <TextField label="Data e hora do evento" value={eventDate} onChangeText={setEventDate} placeholder="2027-10-18 20:00" autoCapitalize="none" />
      <TextField label="Início da venda" value={salesStart} onChangeText={setSalesStart} placeholder="2027-10-01 10:00" autoCapitalize="none" />
      <Button title="Salvar datas" onPress={saveDates} loading={saving} disabled={!changed} />

      <Text style={[font.label, { marginTop: spacing.sm }]}>Tipos de ingresso</Text>
      {session.sectors.map((sector) => (
        <SectorEditor
          key={`${sector.id}-${sector.name}-${sector.price}-${sector.capacity}`}
          event={event}
          session={session}
          sector={sector}
          onApply={onApply}
          onFail={onFail}
        />
      ))}

      <AddSectorForm event={event} session={session} onApply={onApply} onFail={onFail} />

      <Button title="Excluir esta data" variant="link" onPress={removeSession} />
    </Card>
  )
}

// ------------------------------------------------------------------ um tipo de ingresso (setor)

function SectorEditor({ event, session, sector, onApply, onFail }: { event: ManagedEvent; session: EventSession; sector: Sector } & Feedback) {
  const [name, setName] = useState(sector.name)
  const [price, setPrice] = useState(priceToText(sector.price))
  const [capacity, setCapacity] = useState(String(sector.capacity))
  const [saving, setSaving] = useState(false)

  const changed = name.trim() !== sector.name || toNumber(price) !== sector.price || Number(capacity) !== sector.capacity

  const save = async () => {
    const newPrice = toNumber(price)
    const newCapacity = Number(capacity)
    if (Number.isNaN(newPrice) || Number.isNaN(newCapacity)) {
      onFail(new Error('Confira o preço e a capacidade.'), '')
      return
    }

    setSaving(true)
    try {
      const updated = await adjustSector.execute(event.id, session.id, sector.id, {
        name: name.trim() !== sector.name ? name.trim() : undefined,
        price: newPrice !== sector.price ? newPrice : undefined,
        capacity: newCapacity !== sector.capacity ? newCapacity : undefined,
      })
      onApply(updated, `"${name.trim()}" salvo.`)
    } catch (err) {
      onFail(err, 'Não foi possível salvar o tipo de ingresso.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!(await confirmAction('Excluir tipo de ingresso', `Excluir "${sector.name}" desta data?`))) return
    try {
      onApply(await deleteSector.execute(event.id, session.id, sector.id), `"${sector.name}" excluído.`)
    } catch (err) {
      onFail(err, 'Não foi possível excluir o tipo de ingresso.')
    }
  }

  return (
    <View style={styles.sector}>
      <TextField label="Nome" value={name} onChangeText={setName} />
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <TextField label="Preço (R$)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Capacidade" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" />
        </View>
      </View>
      <Text style={font.small}>
        vendido {sector.sold} · disponível {sector.available}
      </Text>
      <View style={styles.actions}>
        <Button title="Salvar" onPress={save} loading={saving} disabled={!changed || !name.trim()} style={{ flex: 1 }} />
        <Button title="Excluir" variant="secondary" onPress={remove} style={{ flex: 1 }} />
      </View>
    </View>
  )
}

function AddSectorForm({ event, session, onApply, onFail }: { event: ManagedEvent; session: EventSession } & Feedback) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [capacity, setCapacity] = useState('')
  const [saving, setSaving] = useState(false)

  const add = async () => {
    const newPrice = toNumber(price)
    const newCapacity = Number(capacity)
    if (Number.isNaN(newPrice) || Number.isNaN(newCapacity)) {
      onFail(new Error('Confira o preço e a capacidade.'), '')
      return
    }

    setSaving(true)
    try {
      const updated = await addSector.execute(event.id, session.id, { name: name.trim(), price: newPrice, capacity: newCapacity })
      onApply(updated, `"${name.trim()}" acrescentado.`)
      setName('')
      setPrice('')
      setCapacity('')
      setOpen(false)
    } catch (err) {
      onFail(err, 'Não foi possível acrescentar o tipo de ingresso.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return <Button title="+ novo tipo de ingresso" variant="link" onPress={() => setOpen(true)} />

  return (
    <View style={styles.sector}>
      <Text style={font.label}>Novo tipo de ingresso</Text>
      <TextField label="Nome" value={name} onChangeText={setName} placeholder="Camarote" />
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <TextField label="Preço (R$)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="189,90" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Capacidade" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" placeholder="100" />
        </View>
      </View>
      <View style={styles.actions}>
        <Button title="Acrescentar" onPress={add} loading={saving} disabled={!name.trim() || !price || !capacity} style={{ flex: 1 }} />
        <Button title="Cancelar" variant="secondary" onPress={() => setOpen(false)} style={{ flex: 1 }} />
      </View>
    </View>
  )
}

// ------------------------------------------------------------------ nova data

function NewSessionForm({ event, onApply, onFail }: { event: ManagedEvent } & Feedback) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<SessionDraft>(emptySession())
  const [saving, setSaving] = useState(false)

  const add = async () => {
    setSaving(true)
    try {
      const updated = await addEventSession.execute(event.id, toSessionData(draft))
      onApply(updated, 'Nova data acrescentada.')
      setDraft(emptySession())
      setOpen(false)
    } catch (err) {
      onFail(err, 'Não foi possível acrescentar a data.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return <Button title="+ Nova data" variant="secondary" onPress={() => setOpen(true)} />

  return (
    <Card>
      <SessionFields value={draft} onChange={setDraft} title="Nova data" />
      <View style={styles.actions}>
        <Button title="Acrescentar data" onPress={add} loading={saving} style={{ flex: 1 }} />
        <Button title="Cancelar" variant="secondary" onPress={() => setOpen(false)} style={{ flex: 1 }} />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.soft },
  preview: { width: '100%', height: 180, borderRadius: radius.md, backgroundColor: colors.line },
  sector: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm, backgroundColor: colors.paper },
  actions: { flexDirection: 'row', gap: spacing.md },
})
