import { StyleSheet, View, type TextInputProps } from 'react-native'
import { Text, TextInput } from './AppText'
import { colors, radius, spacing } from '../theme'

interface TextFieldProps extends TextInputProps {
  label: string
}

export function TextField({ label, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#a2aba6"
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs + 2 },
  label: { fontSize: 12, fontWeight: '600', color: colors.soft },
  input: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    fontSize: 15,
    color: colors.ink,
  },
})
