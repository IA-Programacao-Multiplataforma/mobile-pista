import { useState } from 'react'
import { View } from 'react-native'
import { Text } from '../presentation/components/AppText'
import { Link, router, useLocalSearchParams, type Href } from 'expo-router'
import { useAuth } from '../presentation/auth/useAuth'
import { Button } from '../presentation/components/Button'
import { Screen } from '../presentation/components/Screen'
import { TextField } from '../presentation/components/TextField'
import { AuthCard, Banner, Eyebrow, Title } from '../presentation/components/Ui'
import { errorText } from '../presentation/format'
import { colors, font, spacing } from '../presentation/theme'

export default function LoginScreen() {
  const { login } = useAuth()
  const { from } = useLocalSearchParams<{ from?: string }>()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setError('')
    setSubmitting(true)
    try {
      await login({ email: email.trim(), password })
      router.replace((from || '/') as Href)
    } catch (err) {
      setError(errorText(err, 'Não foi possível entrar.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen>
      <AuthCard>
      <View style={{ gap: spacing.xs }}>
        <Eyebrow>BOM TE VER DE NOVO</Eyebrow>
        <Title>Entre na sua conta.</Title>
      </View>

      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="voce@email.com"
      />
      <TextField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        placeholder="Sua senha"
        onSubmitEditing={submit}
      />

      {error !== '' && <Banner>{error}</Banner>}

      <Button title="Entrar" onPress={submit} loading={submitting} disabled={!email || !password} />

      <Text style={[font.small, { textAlign: 'center' }]}>
        Ainda não tem conta?{' '}
        <Link href={{ pathname: '/cadastro', params: { from } }} style={{ color: colors.green, fontWeight: '700' }}>
          Cadastre-se
        </Link>
      </Text>
      </AuthCard>
    </Screen>
  )
}
