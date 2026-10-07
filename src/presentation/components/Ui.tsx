import type { ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { Text } from './AppText'
import { colors, font, radius, shadow, spacing } from '../theme'

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function Banner({ kind = 'error', children }: { kind?: 'error' | 'warn' | 'ok'; children: ReactNode }) {
  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, kind === 'error' && styles.bannerError, kind === 'warn' && styles.bannerWarn, kind === 'ok' && styles.bannerOk]}
    >
      <Text style={[styles.bannerText, kind === 'error' && { color: colors.danger }, kind === 'warn' && { color: colors.warn }, kind === 'ok' && { color: colors.ok }]}>
        {children}
      </Text>
    </View>
  )
}

export function Pill({ label, tone }: { label: string; tone: 'warn' | 'ok' | 'danger' | 'neutral' }) {
  const palette = {
    warn: { bg: colors.warnBg, fg: colors.warn },
    ok: { bg: colors.okBg, fg: colors.ok },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    neutral: { bg: colors.line, fg: colors.soft },
  }[tone]

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.pillText, { color: palette.fg }]}>{label}</Text>
    </View>
  )
}

export function AuthCard({ children }: { children: ReactNode }) {
  return <View style={styles.authCard}>{children}</View>
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={font.title}>{children}</Text>
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={font.small}>{children}</Text>
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg + 2, gap: spacing.md, backgroundColor: colors.white, borderWidth: 1, borderColor: '#ebeee9', borderRadius: radius.md },
  authCard: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: spacing.lg, padding: 28, backgroundColor: colors.white, borderWidth: 1, borderColor: '#ebeee9', borderRadius: radius.lg, ...shadow.card },
  banner: { padding: spacing.md, borderRadius: radius.sm },
  bannerError: { backgroundColor: colors.dangerBg },
  bannerWarn: { backgroundColor: colors.warnBg },
  bannerOk: { backgroundColor: colors.okBg },
  bannerText: { fontSize: 13, lineHeight: 19 },
  pill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontSize: 10, fontWeight: '700' },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: colors.muted },
})
