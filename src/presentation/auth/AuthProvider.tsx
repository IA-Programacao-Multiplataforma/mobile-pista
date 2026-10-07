import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser, Credentials, RegisterData } from '../../domain/entities/AuthUser'
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../../infrastructure/dependencies'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser
      .execute()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials: Credentials) => {
    setUser(await loginUser.execute(credentials))
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    setUser(await registerUser.execute(data))
  }, [])

  const logout = useCallback(async () => {
    await logoutUser.execute()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
