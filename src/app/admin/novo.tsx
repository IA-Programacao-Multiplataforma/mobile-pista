import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../../presentation/components/AppText'
import { router } from 'expo-router'
import type { EventCategoryCode } from '../../domain/entities/ManagedEvent'
import { createEvent } from '../../infrastructure/dependencies'
import { emptySession, toSessionData, type SessionDraft } from '../../presentation/admin/drafts'
import { SessionFields } from '../../presentation/admin/SessionFields'
import { RequireAuth } from '../../presentation/auth/RequireAuth'
import { Button } from '../../presentation/components/Button'
import { Screen } from '../../presentation/components/Screen'
import { TextField } from '../../presentation/components/TextField'
import { Banner, Eyebrow, Title } from '../../presentation/components/Ui'
import { errorText } from '../../presentation/format'
import { colors, font, radius, spacing } from '../../presentation/theme'

const CATEGORIES: { code: EventCategoryCode; label: string }[] = [
  { code: 'MUSICA', label: 'Música' },
  { code: 'FESTIVAL', label: 'Festival' },
  { code: 'TEATRO', label: 'Teatro' },
  { code: 'EXPERIENCIA', label: 'Experiência' },
]

export default function NewEventRoute() {
  return (
    <RequireAuth role="ADMIN">
      <NewEventScreen />
    </RequireAuth>
  )
}

function NewEventScreen() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<EventCategoryCode>('MUSICA')
  const [venue, setVenue] = useState('')
  const [city, setCity] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [sessions, setSessions] = useState<SessionDraft[]>([emptySession()])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateSession = (index: number, value: SessionDraft) =>
    setSessions((current) => current.map((session, i) => (i === index ? value : session)))

  const submit = async () => {
    setError('')
    setSubmitting(true)
    try {
      await createEvent.execute({
        title: title.trim(),
        description: description.trim(),
        category,
        venue: venue.trim(),
        city: city.trim(),
        imageUrl: imageUrl.trim(),
        imageAlt: title.trim(),
        sessions: sessions.map(toSessionData),
      })
      router.replace('/admin')
    } catch (err) {
      setError(errorText(err, 'Não foi possível criar o evento.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <Eyebrow>ÁREA DO ADMINISTRADOR</Eyebrow>
        <Title>Novo evento</Title>
      </View>

      <TextField label="Título" value={title} onChangeText={setTitle} />
      <TextField label="Descrição" value={description} onChangeText={setDescription} />

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

      <TextField label="Local" value={venue} onChangeText={setVenue} placeholder="Parque Villa-Lobos" />
      <TextField label="Cidade" value={city} onChangeText={setCity} placeholder="São Paulo, SP" />
      <TextField label="URL da imagem" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" keyboardType="url" placeholder="https://..." />

      {sessions.map((session, index) => (
        <SessionFields
          key={index}
          title={`Data ${index + 1}`}
          value={session}
          onChange={(value) => updateSession(index, value)}
          onRemove={sessions.length > 1 ? () => setSessions((current) => current.filter((_, i) => i !== index)) : undefined}
        />
      ))}
      <Button title="+ adicionar outra data" variant="link" onPress={() => setSessions((current) => [...current, emptySession()])} />

      {error !== '' && <Banner>{error}</Banner>}
      <Button title="Criar evento" onPress={submit} loading={submitting} disabled={!title || !venue || !city} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.soft },
})
