import { useEffect, useState } from 'react'
import { UserContext } from './user'
import { authService, type AuthUser } from '../services/authService'

export function UserProvider({ children }: { children: React.ReactNode }) {
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

    if (authService.isAuthenticated()) {
      void loadUser()
    } else {
      setLoading(false)
    }

    return () => { active = false }
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}
