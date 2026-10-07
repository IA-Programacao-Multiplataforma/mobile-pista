import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native'
import { Text } from './AppText'
import { colors, radius, spacing } from '../theme'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'link' | 'danger'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }: ButtonProps) {
  const inactive = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        variant === 'link' && styles.link,
        inactive && styles.inactive,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.green} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' && styles.textPrimary,
            variant === 'secondary' && styles.textSecondary,
            variant === 'danger' && styles.textDanger,
            variant === 'link' && styles.textLink,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { minHeight: 46, paddingHorizontal: spacing.lg, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.green },
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  danger: { backgroundColor: colors.dangerBg },
  link: { minHeight: 32, paddingHorizontal: 0, alignSelf: 'center' },
  inactive: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: { fontSize: 14, fontWeight: '700' },
  textPrimary: { color: colors.white },
  textSecondary: { color: colors.ink },
  textDanger: { color: colors.danger },
  textLink: { color: colors.green },
})
