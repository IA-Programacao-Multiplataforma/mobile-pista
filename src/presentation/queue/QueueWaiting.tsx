import { StyleSheet, View } from 'react-native'
import { Text } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import type { QueueStatus } from '../../domain/entities/Queue'
import { Banner, Card } from '../components/Ui'
import { formatPrice } from '../format'
import { colors, font, radius, spacing } from '../theme'

export function QueueWaiting({ status }: { status: QueueStatus }) {
  const others = Math.max(0, status.totalWaiting - 1)

  return (
    <Card style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="hourglass-outline" size={26} color={colors.green} />
      </View>

      <Text style={font.small}>Você está na fila</Text>
      <Text style={styles.position} accessibilityLabel={`Posição ${status.position ?? 'desconhecida'}`}>
        {status.position ?? '-'}º
      </Text>
      <Text style={[font.body, { textAlign: 'center' }]}>
        {others === 0
          ? 'Você é o único aguardando.'
          : `${others} ${others === 1 ? 'pessoa aguarda' : 'pessoas aguardam'} junto com você.`}
      </Text>

      {status.soldOut ? (
        <Banner kind="warn">Os ingressos acabaram, mas fique atento: novas datas ou desistências podem liberar lugares.</Banner>
      ) : (
        <Text style={[font.small, { textAlign: 'center' }]}>
          Quando chegar a sua vez, você escolhe o setor e a quantidade. Mantenha esta tela aberta.
        </Text>
      )}

      <View style={{ alignSelf: 'stretch' }}>
        {status.sectors.map((sector) => (
          <View key={sector.id} style={styles.row}>
            <Text style={[font.body, { flex: 1 }]}>{sector.name}</Text>
            <Text style={font.body}>{formatPrice(sector.price)}</Text>
            <Text style={[font.small, { minWidth: 70, textAlign: 'right' }]}>
              {sector.available > 0 ? `${sector.available} disp.` : 'esgotado'}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { alignItems: 'center' },
  icon: { width: 54, height: 54, borderRadius: radius.pill, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  position: { fontSize: 64, fontWeight: '700', color: colors.ink, lineHeight: 72 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: '#f0f2ed' },
})
