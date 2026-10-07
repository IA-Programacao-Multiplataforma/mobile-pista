import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Text } from '../../presentation/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { joinQueue, leaveQueue } from '../../infrastructure/dependencies'
import { useAuth } from '../../presentation/auth/useAuth'
import { RequireAuth } from '../../presentation/auth/RequireAuth'
import { Button } from '../../presentation/components/Button'
import { Screen } from '../../presentation/components/Screen'
import { Banner, Card, Eyebrow, Title } from '../../presentation/components/Ui'
import { errorText, formatDateTime } from '../../presentation/format'
import { QueueBuying } from '../../presentation/queue/QueueBuying'
import { QueueWaiting } from '../../presentation/queue/QueueWaiting'
import { useQueuePolling } from '../../presentation/queue/useQueuePolling'
import { colors, font, spacing } from '../../presentation/theme'

export default function QueueRoute() {
  return (
    <RequireAuth>
      <QueueScreen />
    </RequireAuth>
  )
}

function QueueScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const { logout } = useAuth()
  const { status, loading, error, sessionExpired, refresh, setStatus } = useQueuePolling(sessionId)

  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (sessionExpired) {
      void logout().then(() => router.replace({ pathname: '/entrar', params: { from: `/fila/${sessionId}` } }))
    }
  }, [sessionExpired, logout, sessionId])

  const join = async () => {
    setBusy(true)
    setActionError('')
    try {
      setStatus(await joinQueue.execute(sessionId))
    } catch (err) {
      setActionError(errorText(err, 'Não foi possível entrar na fila.'))
    } finally {
      setBusy(false)
    }
  }

  const leave = async () => {
    setBusy(true)
    setActionError('')
    try {
      await leaveQueue.execute(sessionId)
      router.replace(status ? `/evento/${status.eventId}` : '/')
    } catch (err) {
      setActionError(errorText(err, 'Não foi possível sair da fila.'))
      setBusy(false)
    }
  }

  const backToEvent = () => router.replace(status ? `/evento/${status.eventId}` : '/')
  const inDispute = status?.state === 'AGUARDANDO' || status?.state === 'ATIVO'

  return (
    <Screen>
      {status && (
        <View style={{ gap: spacing.xs }}>
          <Eyebrow>FILA DE COMPRA</Eyebrow>
          <Title>{status.eventTitle}</Title>
          <Text style={font.small}>{formatDateTime(status.eventDate)}</Text>
        </View>
      )}

      {loading && <Text style={font.small}>Carregando...</Text>}

      {error !== '' && !loading && <Banner kind="warn">{error} Tentando de novo automaticamente...</Banner>}

      {!loading && !status && error === '' && (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="time-outline" size={28} color={colors.green} />
          <Text style={font.subtitle}>Você ainda não está na fila</Text>
          <Text style={font.small}>Entre na fila para garantir sua vez de comprar.</Text>
          <Button title="Entrar na fila" onPress={join} loading={busy} />
        </Card>
      )}

      {status?.state === 'AGUARDANDO' && <QueueWaiting status={status} />}

      {status?.state === 'ATIVO' && (
        <QueueBuying status={status} onTimeUp={refresh} />
      )}

      {status?.state === 'EXPIROU' && (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="alarm-outline" size={28} color={colors.warn} />
          <Text style={font.subtitle}>Seu tempo acabou</Text>
          <Text style={[font.small, { textAlign: 'center' }]}>
            Os ingressos que você segurava foram liberados. Você pode entrar na fila de novo, indo para o fim.
          </Text>
          <Button title="Entrar de novo" onPress={join} loading={busy} />
        </Card>
      )}

      {(status?.state === 'DESISTIU' || status?.state === 'CONCLUIU') && (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="checkmark-circle-outline" size={28} color={colors.green} />
          <Text style={font.subtitle}>{status.state === 'CONCLUIU' ? 'Compra concluída' : 'Você saiu da fila'}</Text>
          <Button title="Voltar ao evento" onPress={backToEvent} />
          {status.state === 'DESISTIU' && <Button title="Entrar na fila novamente" onPress={join} variant="link" loading={busy} />}
          {status.state === 'CONCLUIU' && <Button title="Ver meus ingressos" onPress={() => router.replace('/perfil')} variant="link" />}
        </Card>
      )}

      {actionError !== '' && <Banner>{actionError}</Banner>}

      {inDispute && <Button title="Sair da fila" onPress={leave} variant="link" disabled={busy} />}
    </Screen>
  )
}
