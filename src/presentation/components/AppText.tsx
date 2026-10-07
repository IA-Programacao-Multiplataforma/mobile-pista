import { forwardRef } from 'react'
import { StyleSheet, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from 'react-native'
import { fonts } from '../theme'

// Com fonte personalizada o React Native não escolhe o peso: troca fontWeight pela variação da DM Sans
// Quem já define fontFamily (os títulos) fica como está
const BY_WEIGHT: Record<string, string> = {
  '400': fonts.body,
  normal: fonts.body,
  '500': fonts.bodyMedium,
  '600': fonts.bodyMedium,
  '700': fonts.bodyBold,
  bold: fonts.bodyBold,
  '800': fonts.bodyBold,
  '900': fonts.bodyBold,
}

function withFamily(style: TextProps['style']): TextProps['style'] {
  const flat = StyleSheet.flatten(style) ?? {}
  if (flat.fontFamily) return [style, { fontWeight: 'normal' }]
  return [style, { fontFamily: BY_WEIGHT[String(flat.fontWeight ?? '400')] ?? fonts.body, fontWeight: 'normal' }]
}

export const Text = forwardRef<RNText, TextProps>(function Text({ style, ...props }, ref) {
  return <RNText ref={ref} {...props} style={withFamily(style)} />
})

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput({ style, ...props }, ref) {
  return <RNTextInput ref={ref} {...props} style={[{ fontFamily: fonts.body }, style]} />
})
