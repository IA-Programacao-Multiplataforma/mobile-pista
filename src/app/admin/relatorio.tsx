import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../presentation/components/AppText'
import type { SalesReport } from '../../domain/entities/SalesReport'
import { getSalesReport } from '../../infrastructure/dependencies'
import { RequireAuth } from '../../presentation/auth/RequireAuth'
import { Button } from '../../presentation/components/Button'
import { Screen } from '../../presentation/components/Screen'
import { Banner, Card, Eyebrow, Title } from '../../presentation/components/Ui'
import { errorText, formatPrice } from '../../presentation/format'
import { colors, font, spacing } from '../../presentation/theme'

export default function SalesReportRoute() {
  return (
    <RequireAuth role="ADMIN">
      <SalesReportScreen />
    </RequireAuth>
  )
}

function SalesReportScreen() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setReport(await getSalesReport.execute())
      setError('')
    } catch (err) {
      setError(errorText(err, 'Não foi possível carregar o relatório.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [load])

  return (
    <Screen wide>
      <View style={{ gap: spacing.xs }}>
        <Eyebrow>ÁREA DO ADMINISTRADOR</Eyebrow>
        <Title>Relatório de vendas</Title>
      </View>

      <Button title="Atualizar" variant="link" onPress={load} />

      {error !== '' && <Banner>{error}</Banner>}
      {loading && <Text style={font.small}>Carregando...</Text>}

      {report && (
        <>
          <Card>
            <View style={styles.totals}>
              <Metric label="Receita" value={formatPrice(report.totals.revenue)} />
              <Metric label="Ingressos" value={String(report.totals.tickets)} />
              <Metric label="Pedidos pagos" value={String(report.totals.paidOrders)} />
            </View>
            <Text style={font.small}>
              recusados {report.totals.refusedOrders} · cancelados {report.totals.canceledOrders} · em andamento{' '}
              {report.totals.inProgressOrders}
            </Text>
          </Card>

          {report.events.length === 0 && <Text style={font.small}>Ainda não há vendas.</Text>}

          {report.events.map((event) => (
            <Card key={event.eventId}>
              <Text style={font.subtitle}>{event.eventTitle}</Text>
              <Text style={font.small}>
                {event.tickets} ingressos · {event.paidOrders} pedidos · {formatPrice(event.revenue)}
              </Text>
              {event.sectors.map((sector) => (
                <View key={sector.sectorName} style={styles.sector}>
                  <Text style={styles.sectorName}>{sector.sectorName}</Text>
                  <Text style={font.small}>{sector.tickets} ingressos</Text>
                  <Text style={styles.sectorRevenue}>{formatPrice(sector.revenue)}</Text>
                </View>
              ))}
            </Card>
          ))}
        </>
      )}
    </Screen>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={font.small}>{label}</Text>
      <Text style={styles.metric}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  totals: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  metric: { fontSize: 20, fontWeight: '800', color: colors.ink },
  sector: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.line },
  sectorName: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.ink },
  sectorRevenue: { fontSize: 13, fontWeight: '700', color: colors.ink },
})
