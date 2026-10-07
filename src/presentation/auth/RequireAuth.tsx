import type { ReactNode } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Redirect, usePathname } from 'expo-router'
import type { Role } from '../../domain/entities/AuthUser'
import { colors } from '../theme'
import { useAuth } from './useAuth'

interface RequireAuthProps {
  children: ReactNode
  role?: Role
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.green} />
      </View>
    )
  }

  if (!user) {
    return <Redirect href={{ pathname: '/entrar', params: { from: pathname } }} />
  }

  if (role && !user.roles.includes(role)) {
    return <Redirect href="/" />
  }

  return <>{children}</>
}
