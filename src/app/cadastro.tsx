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

export default function RegisterScreen() {
  const { register } = useAuth()
  const { from } = useLocalSearchParams<{ from?: string }>()

  const [form, setForm] = useState({ username: '', email: '', cep: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async () => {
    setError('')
    setSubmitting(true)
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        cep: form.cep.trim(),
        password: form.password,
      })
      router.replace((from || '/') as Href)
    } catch (err) {
      setError(errorText(err, 'Não foi possível criar a conta.'))
    } finally {
      setSubmitting(false)
    }
  }

  const complete = form.username && form.email && form.cep && form.password

  return (
    <Screen>
      <AuthCard>
      <View style={{ gap: spacing.xs }}>
        <Eyebrow>PRIMEIRA VEZ POR AQUI?</Eyebrow>
        <Title>Crie sua conta.</Title>
      </View>

      <TextField label="Nome de usuário" value={form.username} onChangeText={update('username')} autoCapitalize="none" autoComplete="username" placeholder="como quer ser chamado" />
      <TextField label="E-mail" value={form.email} onChangeText={update('email')} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="voce@email.com" />
      <TextField label="CEP" value={form.cep} onChangeText={update('cep')} keyboardType="number-pad" autoComplete="postal-code" placeholder="00000-000" />
      <TextField label="Senha" value={form.password} onChangeText={update('password')} secureTextEntry autoComplete="new-password" placeholder="Crie uma senha" />

      {error !== '' && <Banner>{error}</Banner>}

      <Button title="Criar conta" onPress={submit} loading={submitting} disabled={!complete} />

      <Text style={[font.small, { textAlign: 'center' }]}>
        Já tem conta?{' '}
        <Link href={{ pathname: '/entrar', params: { from } }} style={{ color: colors.green, fontWeight: '700' }}>
          Entre
        </Link>
      </Text>
      </AuthCard>
    </Screen>
  )
}
