import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import QRCode from 'react-native-qrcode-svg'
import type { OwnedTicket } from '../../domain/entities/Order'
import { formatLongDate, formatTime } from '../format'
import { colors, radius, spacing } from '../theme'

export function TicketCard({ ticket }: { ticket: OwnedTicket }) {
  const [horizontal, setHorizontal] = useState(false)
  const year = new Date(ticket.eventDate).getFullYear()
  const qrValue = `PISTA|${ticket.code}|${ticket.id}`

  return (
    <View
      style={[styles.ticket, horizontal && { flexDirection: 'row' }]}
      onLayout={(event) => setHorizontal(event.nativeEvent.layout.width >= 560)}
      accessibilityLabel={`Ingresso ${ticket.code} para ${ticket.eventTitle}`}>
      <View style={[styles.strip, horizontal && styles.stripVertical]}>
        <View style={{ flex: 1, backgroundColor: colors.lime }} />
        <View style={{ flex: 1, backgroundColor: colors.coral }} />
      </View>

      <View style={[styles.main, horizontal && { flex: 1 }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Ionicons name="ticket" size={12} color={colors.ink} />
          </View>
          <Text style={styles.brand}>
            pista<Text style={{ color: colors.coral }}>.</Text>
          </Text>
          <Text style={styles.tag}>INGRESSO</Text>
        </View>

        <Text style={styles.title}>{ticket.eventTitle}</Text>

        <View style={styles.grid}>
          <Info icon="calendar-outline" label="Data" value={`${formatLongDate(ticket.eventDate)} de ${year}`} />
          <Info icon="time-outline" label="Horário" value={formatTime(ticket.eventDate)} />
          <Info icon="location-outline" label="Setor" value={ticket.sectorName} />
          <Info icon="ticket-outline" label="Entrada" value="1 pessoa" />
        </View>

        <View style={styles.foot}>
          <Text style={styles.footLabel}>PEDIDO #{ticket.orderId.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.code} selectable>
            {ticket.code}
          </Text>
        </View>
      </View>

      {/* picote: linha tracejada com os recortes laterais */}
      <View style={horizontal ? styles.perforationV : styles.perforation}>
        {horizontal ? (
          <>
            <View style={[styles.notch, { top: -11, left: -11 }]} />
            <View style={[styles.notch, { bottom: -11, left: -11 }]} />
          </>
        ) : (
          <>
            <View style={[styles.notch, { top: -11, left: -11 }]} />
            <View style={[styles.notch, { top: -11, right: -11 }]} />
          </>
        )}
      </View>

      <View style={[styles.stub, horizontal && styles.stubSide]}>
        <View style={styles.qrBox}>
          <QRCode value={qrValue} size={horizontal ? 120 : 96} color={colors.ink} backgroundColor="#ffffff" />
        </View>
        <Text style={styles.scan}>APRESENTE NA ENTRADA</Text>
      </View>
    </View>
  )
}

function Info({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.info}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name={icon} size={11} color={colors.coral} />
        <Text style={styles.infoLabel}>{label.toUpperCase()}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  ticket: {
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
  },
  strip: { height: 5, flexDirection: 'row' },
  main: { gap: spacing.md, padding: spacing.lg + 2 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandMark: { width: 22, height: 22, borderRadius: 6, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 15, fontWeight: '700', color: colors.ink },
  tag: { marginLeft: 'auto', fontSize: 9, fontWeight: '800', letterSpacing: 1.4, color: '#8a9b3f' },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, lineHeight: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md, columnGap: spacing.lg },
  info: { width: '47%', gap: 3 },
  infoLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.9, color: '#8a9590' },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.ink },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#d9dfd7',
    borderStyle: 'dashed',
  },
  footLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, color: '#8a9590' },
  code: { fontSize: 16, fontWeight: '800', letterSpacing: 1.4, color: colors.ink },
  perforation: { height: 0, position: 'relative', zIndex: 2 },
  perforationV: { width: 0, alignSelf: 'stretch', position: 'relative', zIndex: 2 },
  stripVertical: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
  stubSide: { flexDirection: 'column', justifyContent: 'center', width: 190, borderTopWidth: 0, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed' },
  notch: {
    position: 'absolute',
    top: -11,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl - 4,
    backgroundColor: colors.green,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  qrBox: { padding: 8, backgroundColor: colors.white, borderRadius: radius.md },
  scan: { flex: 1, fontSize: 10, fontWeight: '800', letterSpacing: 0.9, color: 'rgba(255,255,255,0.8)' },
})
