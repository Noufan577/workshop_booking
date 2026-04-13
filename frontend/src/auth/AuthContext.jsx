import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, refreshCsrf } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    setLoading(true)
    try {
      await refreshCsrf()
      const data = await apiFetch('/me/')
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const logout = useCallback(async () => {
    await apiFetch('/auth/logout/', { method: 'POST', body: '{}' })
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, reload: loadMe, logout, setUser }),
    [user, loading, loadMe, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside provider')
  return ctx
}
