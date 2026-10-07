export const colors = {
  ink: '#18312c',
  muted: '#74817d',
  soft: '#4f615a',
  paper: '#f7f8f4',
  white: '#ffffff',
  line: '#e5e9e3',
  lime: '#ddf36a',
  coral: '#f16d55',
  green: '#1d473c',
  dangerBg: '#fbe3dd',
  danger: '#8a2f20',
  warnBg: '#fbeccb',
  warn: '#7a4a00',
  okBg: '#e3f2b8',
  ok: '#1d473c',
}

export const radius = { sm: 6, md: 10, lg: 14, pill: 99 }

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }

export const fonts = {
  heading: 'SpaceGrotesk_600SemiBold',
  headingBold: 'SpaceGrotesk_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
}

export const font = {
  title: { fontSize: 26, color: colors.ink, fontFamily: fonts.headingBold },
  subtitle: { fontSize: 18, color: colors.ink, fontFamily: fonts.heading },
  body: { fontSize: 14, color: colors.ink },
  small: { fontSize: 12, color: colors.muted },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.soft },
}

export const shadow = {
  card: { shadowColor: '#1c322b', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
}
