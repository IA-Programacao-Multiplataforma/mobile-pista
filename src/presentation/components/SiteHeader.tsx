import { Pressable, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router, usePathname } from 'expo-router'
import { useAuth } from '../auth/useAuth'
import { colors, fonts, spacing } from '../theme'
import { useLayout, WIDE_MAX_WIDTH } from '../useLayout'
import { Text } from './AppText'

export function Brand() {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel="Pista, ir para o início" onPress={() => router.replace('/')} style={styles.brand}>
      <View style={styles.brandMark}>
        <Ionicons name="ticket" size={18} color={colors.ink} />
      </View>
      <Text style={styles.brandName}>
        pista<Text style={{ color: colors.coral }}>.</Text>
      </Text>
    </Pressable>
  )
}

export function SiteHeader() {
  const { user } = useAuth()
  const { isDesktop } = useLayout()
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <View style={styles.bar}>
      <View style={[styles.inner, { paddingHorizontal: isDesktop ? spacing.xl : spacing.lg }]}>
        <View style={styles.left}>
          {!isHome && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              style={styles.back}
            >
              <Ionicons name="arrow-back" size={20} color={colors.ink} />
            </Pressable>
          )}
          <Brand />
        </View>

        <View style={styles.right}>
          {user?.roles.includes('ADMIN') && (
            <Pressable accessibilityRole="button" accessibilityLabel="Administração" onPress={() => router.push('/admin')} style={styles.action}>
              <Ionicons name="settings-outline" size={19} color={colors.ink} />
              {isDesktop && <Text style={styles.actionText}>Admin</Text>}
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={user ? 'Meu perfil' : 'Entrar'}
            onPress={() => router.push(user ? '/perfil' : '/entrar')}
            style={styles.action}
          >
            <Ionicons name="person-circle-outline" size={24} color={colors.ink} />
            <Text style={styles.actionText}>{user ? user.username : 'Entrar'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: colors.line },
  inner: { width: '100%', maxWidth: WIDE_MAX_WIDTH, alignSelf: 'center', height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  back: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.ink },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, fontWeight: '700', color: colors.ink },
})
