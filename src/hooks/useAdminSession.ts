import { useCallback, useEffect, useState } from 'react'
import { authService, type AdminSession } from '../services/auth'

/** Sessão do painel administrativo: carregamento, login e logout. */
export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setSession(await authService.getSession())
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    return authService.onAuthChange(() => void refresh())
  }, [refresh])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authService.signIn(email, password)
      setSession(result)
      return result
    },
    [],
  )

  const signOut = useCallback(async () => {
    await authService.signOut()
    setSession(null)
  }, [])

  return { session, loading, signIn, signOut, requiresLogin: authService.requiresLogin }
}
