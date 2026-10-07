import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing } from '../theme'
import { useLayout, WIDE_MAX_WIDTH } from '../useLayout'
import { SiteHeader } from './SiteHeader'

interface ScreenProps {
  children: ReactNode
  scroll?: boolean
  wide?: boolean
  banner?: ReactNode
  footer?: ReactNode
}

export function Screen({ children, scroll = true, wide = false, banner, footer }: ScreenProps) {
  const { isDesktop } = useLayout()
  // O cabeçalho é nosso, então reservamos a margem da barra de status (verde quando há a faixa da vitrine)
  const { top } = useSafeAreaInsets()
  const content = [
    styles.content,
    wide && { maxWidth: WIDE_MAX_WIDTH },
    isDesktop && { padding: spacing.xl, gap: spacing.xl },
  ]

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <View style={{ height: top, backgroundColor: banner ? colors.green : colors.paper }} />
      {banner}
      <SiteHeader />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={content}>{children}</View>
            {footer}
          </ScrollView>
        ) : (
          <View style={[styles.flex, content]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg, maxWidth: 720, width: '100%', alignSelf: 'center' },
})
