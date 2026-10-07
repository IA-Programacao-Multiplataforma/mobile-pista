import { useEffect, useState } from 'react'
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text, TextInput } from '../presentation/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import type { EventCategory, TicketEvent } from '../domain/entities/TicketEvent'
import { listEvents } from '../infrastructure/dependencies'
import { Banner, Card, Eyebrow, Pill } from '../presentation/components/Ui'
import { Screen } from '../presentation/components/Screen'
import { errorText, formatPrice } from '../presentation/format'
import { colors, font, fonts, radius, spacing } from '../presentation/theme'
import { useLayout, WIDE_MAX_WIDTH } from '../presentation/useLayout'

const CATEGORIES: ('Todos' | EventCategory)[] = ['Todos', 'Música', 'Festival', 'Teatro', 'Experiência']
const GAP = 20

function PromoBanner() {
  return (
    <View style={styles.promo}>
      <Ionicons name="sparkles" size={14} color={colors.lime} />
      <Text style={styles.promoText}>Seu próximo momento começa aqui</Text>
      <Ionicons name="arrow-up-outline" size={13} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
    </View>
  )
}

const STEPS = [
  { n: '01', title: 'Escolha seu rolê', text: 'Encontre o próximo evento que combina com você.' },
  { n: '02', title: 'Entre na fila', text: 'Aguarde sua vez e separe seus ingressos na sacola.' },
  { n: '03', title: 'Viva o momento', text: 'O melhor da noite é estar lá.' },
]

function HowItWorksAndFooter({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View>
      <View style={[styles.howWrap, { paddingHorizontal: isDesktop ? spacing.xl : spacing.lg }]}>
        <View style={[styles.how, isDesktop && { flexDirection: 'row', alignItems: 'center' }]}>
          <View style={[styles.howTitle, isDesktop && { flex: 1.3 }]}>
            <Eyebrow>SEM COMPLICAÇÃO</Eyebrow>
            <Text style={[font.title, { fontSize: isDesktop ? 30 : 26 }]}>
              Da escolha ao <Text style={{ color: '#8a9b3f' }}>encontro.</Text>
            </Text>
          </View>
          {STEPS.map((step) => (
            <View key={step.n} style={[styles.step, isDesktop && { flex: 1 }]}>
              <Text style={styles.stepNumber}>{step.n}</Text>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={font.small}>{step.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.footerInner, { paddingHorizontal: isDesktop ? spacing.xl : spacing.lg }, !isDesktop && { flexDirection: 'column', gap: spacing.sm, alignItems: 'flex-start' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.footerMark}>
              <Ionicons name="ticket" size={14} color={colors.ink} />
            </View>
            <Text style={styles.footerBrand}>
              pista<Text style={{ color: colors.coral }}>.</Text>
            </Text>
          </View>
          <Text style={font.small}>Encontre seu próximo momento.</Text>
          <Text style={font.small}>© 2026 Pista Ingressos</Text>
        </View>
      </View>
    </View>
  )
}

export default function StoreScreen() {
  const { isDesktop, columns } = useLayout()
  const [events, setEvents] = useState<TicketEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Todos')

  useEffect(() => {
    listEvents
      .execute()
      .then(setEvents)
      .catch((err) => setError(errorText(err, 'Não foi possível carregar os eventos.')))
      .finally(() => setLoading(false))
  }, [])

  const term = search.trim().toLocaleLowerCase('pt-BR')
  const visible = events.filter((event) => {
    const matchesCategory = category === 'Todos' || event.category === category
    const matchesSearch = `${event.title} ${event.venue} ${event.city}`.toLocaleLowerCase('pt-BR').includes(term)
    return matchesCategory && matchesSearch
  })

  const featured = isDesktop && category === 'Todos' && term === '' ? visible[0] : undefined

  // A última linha ganha espaços vazios para os cards dela não esticarem (todos usam flex: 1)
  const rows: TicketEvent[][] = []
  for (let i = 0; i < visible.length; i += columns) rows.push(visible.slice(i, i + columns))

  return (
    <Screen wide banner={<PromoBanner />} footer={<HowItWorksAndFooter isDesktop={isDesktop} />}>
      {featured && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver ${featured.title}`}
          onPress={() => router.push(`/evento/${featured.id}`)}
        >
          <ImageBackground source={{ uri: featured.imageUrl }} style={styles.hero} imageStyle={{ borderRadius: radius.lg }}>
            <View style={styles.heroShade} />
            <View style={styles.heroContent}>
              <View style={styles.heroTag}>
                <View style={styles.heroDot} />
                <Text style={styles.heroTagText}>EM DESTAQUE</Text>
              </View>
              <Text style={styles.heroTitle}>{featured.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' }}>
                <Text style={styles.heroMeta}>
                  <Ionicons name="calendar-outline" size={14} color="#fff" /> {featured.dateLabel}
                </Text>
                <Text style={styles.heroMeta}>
                  <Ionicons name="location-outline" size={14} color="#fff" /> {featured.venue}, {featured.city}
                </Text>
              </View>
              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Ver datas e entrar na fila</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.ink} />
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      )}

      <View style={[styles.titleRow, !isDesktop && { flexDirection: 'column', alignItems: 'stretch' }]}>
        <View style={{ gap: spacing.xs, flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Ionicons name='musical-note' size={14} color={colors.coral} />
            <Eyebrow>FEITO PRA SAIR DE CASA</Eyebrow>
          </View>
          <Text style={[font.title, { fontSize: isDesktop ? 40 : 28 }]}>
            Tem coisa boa <Text style={{ color: '#8a9b3f' }}>acontecendo.</Text>
          </Text>
        </View>

        <View style={[styles.search, isDesktop && { width: 360 }]}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            accessibilityLabel="Buscar eventos"
            placeholder="Artista, evento ou local"
            placeholderTextColor="#a2aba6"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.tabsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xl }}>
          {CATEGORIES.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: category === item }}
              onPress={() => setCategory(item)}
              style={[styles.tab, category === item && styles.tabActive]}
            >
              <Text style={[styles.tabText, category === item && styles.tabTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {error !== '' && <Banner>{error}</Banner>}
      {loading && <Text style={font.small}>Carregando eventos...</Text>}
      {!loading && !error && visible.length === 0 && (
        <Card>
          <Text style={font.subtitle}>Nenhum evento por aqui</Text>
          <Text style={font.small}>Tente outra busca ou escolha uma categoria diferente.</Text>
        </Card>
      )}

      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((event) => (
          <Pressable
            key={event.id}
            accessibilityRole="button"
            accessibilityLabel={`Ver ${event.title}`}
            onPress={() => router.push(`/evento/${event.id}`)}
            style={(state) => [
              styles.cardSlot,
              // "hovered" só existe no navegador (mouse em cima do card)
              (state as { hovered?: boolean }).hovered && styles.cardHover,
            ]}
          >
            <Card style={styles.eventCard}>
              <View>
                <Image source={{ uri: event.imageUrl }} style={[styles.image, isDesktop && { height: 190 }]} accessibilityLabel={event.imageAlt} />
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{event.category}</Text>
                </View>
                {event.badge && (
                  <View style={styles.badge}>
                    <Pill label={event.badge} tone={event.badge === 'Esgotado' ? 'danger' : 'warn'} />
                  </View>
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardDate}>
                  <Ionicons name="calendar-outline" size={12} color={colors.coral} /> {event.dateLabel}
                </Text>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                {event.description !== '' && (
                  <Text style={font.small} numberOfLines={2}>
                    {event.description}
                  </Text>
                )}
                <View style={styles.cardFoot}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="location-outline" size={13} color="#8a9b3f" />
                    <Text style={[font.small, { flex: 1 }]} numberOfLines={1}>
                      {event.venue} · {event.city}
                    </Text>
                  </View>
                  <Text style={styles.price}>
                    <Text style={font.small}>a partir de </Text>
                    {formatPrice(event.price)}
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
            ))}
            {Array.from({ length: columns - row.length }).map((_, i) => (
              <View key={`vazio-${i}`} style={styles.cardSlot} />
            ))}
          </View>
        ))}
      </View>

      {visible.length > 0 && (
        <Text style={styles.count}>
          MOSTRANDO {visible.length} DE {events.length} EVENTOS
        </Text>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  promo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 34, paddingHorizontal: spacing.lg, backgroundColor: colors.green },
  promoText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  howWrap: { width: '100%', maxWidth: WIDE_MAX_WIDTH, alignSelf: 'center', paddingBottom: spacing.xxl },
  how: { gap: spacing.xl, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.line },
  howTitle: { gap: spacing.xs },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingLeft: spacing.lg, borderLeftWidth: 1, borderLeftColor: colors.line },
  stepNumber: { fontFamily: fonts.heading, fontSize: 18, color: '#8a9b3f' },
  stepTitle: { fontFamily: fonts.heading, fontSize: 15, color: colors.ink },
  footer: { backgroundColor: '#eef2ea', borderTopWidth: 1, borderTopColor: colors.line },
  footerInner: { width: '100%', maxWidth: WIDE_MAX_WIDTH, alignSelf: 'center', minHeight: 84, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.lg },
  footerMark: { width: 26, height: 26, borderRadius: 7, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  footerBrand: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.ink },

  hero: { minHeight: 340, justifyContent: 'flex-end', overflow: 'hidden', borderRadius: radius.lg },
  heroShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(24,49,44,0.55)', borderRadius: radius.lg },
  heroContent: { gap: spacing.md, padding: 36 },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lime },
  heroTagText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, color: colors.lime },
  heroTitle: { fontFamily: fonts.headingBold, fontSize: 52, color: '#fff', lineHeight: 56 },
  heroMeta: { fontSize: 14, fontWeight: '600', color: '#fff' },
  heroButton: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', marginTop: spacing.sm, paddingHorizontal: 20, paddingVertical: 13, borderRadius: radius.sm, backgroundColor: colors.lime },
  heroButtonText: { fontSize: 14, fontWeight: '800', color: colors.ink },

  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, minHeight: 46, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink },
  tabsBar: { borderBottomWidth: 1, borderBottomColor: colors.line },
  tab: { paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: colors.coral },
  tabText: { fontSize: 14, fontWeight: '500', color: colors.muted },
  tabTextActive: { color: colors.ink, fontWeight: '700' },

  grid: { gap: GAP },
  row: { flexDirection: 'row', gap: GAP, alignItems: 'stretch' },
  cardSlot: { flex: 1, minWidth: 0 },
  cardHover: { transform: [{ translateY: -4 }] },
  eventCard: { flex: 1, padding: 0, overflow: 'hidden', gap: 0 },
  image: { width: '100%', height: 160, backgroundColor: colors.line },
  badge: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  categoryTag: { position: 'absolute', bottom: spacing.sm, left: spacing.sm, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: 'rgba(24,49,44,0.8)' },
  categoryTagText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  cardBody: { gap: 6, padding: spacing.lg },
  cardDate: { fontSize: 12, fontWeight: '600', color: colors.muted },
  cardTitle: { fontFamily: fonts.heading, fontSize: 20, color: colors.ink },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: '#edf0eb' },
  price: { fontSize: 15, fontWeight: '800', color: colors.ink },
  count: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: '#96a09a' },
})
