const TOKEN_KEY = 'siapesq_token'

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY)
  },

  async login(email: string, password: string): Promise<{ token: string; user: unknown }> {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || 'Credenciais inválidas')
    }

    const data = await res.json()
    authService.setToken(data.token)
    return data
  },

  logout() {
    authService.removeToken()
  },
}
