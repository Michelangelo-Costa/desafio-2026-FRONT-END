import { useEffect, useState } from 'react'
import { authService, type AuthUser } from '../services/authService'

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadUser() {
      try {
        const currentUser = await authService.me()
        if (active) setUser(currentUser)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadUser()

    return () => {
      active = false
    }
  }, [])

  return { user, loading }
}
