import { createContext, useContext } from 'react'
import type { AuthUser } from '../services/authService'

export interface UserContextValue {
  user: AuthUser | null
  loading: boolean
}

export const UserContext = createContext<UserContextValue>({ user: null, loading: true })

export function useUser() {
  return useContext(UserContext)
}
