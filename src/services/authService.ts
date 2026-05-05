const TOKEN_KEY = 'siapesq_token'
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role?: string
}

export interface AuthResult {
  token: string
  user: AuthUser
}

async function readJson<T>(response: Response): Promise<T> {
  return response.json().catch(() => ({})) as Promise<T>
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const body = await readJson<{ message?: string; error?: string; data?: T } & T>(response)

  if (response.status === 401) {
    authService.removeToken()
    if (window.location.pathname !== '/login') {
      window.location.replace('/login')
    }
  }

  if (!response.ok) {
    throw new Error(body.message || body.error || 'Nao foi possivel concluir a acao')
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T
  }

  return body as T
}

function isJwtLike(token: string | null): token is string {
  return !!token && token !== 'undefined' && token !== 'null' && token.split('.').length === 3
}

export const authService = {
  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!isJwtLike(token)) {
      localStorage.removeItem(TOKEN_KEY)
      return null
    }

    return token
  },

  setToken(token: string) {
    if (!isJwtLike(token)) {
      localStorage.removeItem(TOKEN_KEY)
      throw new Error('Token de autenticacao invalido retornado pela API')
    }

    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  isAuthenticated(): boolean {
    return !!authService.getToken()
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const data = await request<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    authService.setToken(data.token)
    return data
  },

  async register(input: { name: string; email: string; password: string }): Promise<AuthResult> {
    const data = await request<AuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    authService.setToken(data.token)
    return data
  },

  async forgotPassword(email: string): Promise<{ message?: string }> {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async resetPassword(token: string, password: string): Promise<{ message?: string }> {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message?: string }> {
    const token = authService.getToken()
    return request('/auth/change-password', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  async me(): Promise<AuthUser> {
    const token = authService.getToken()
    return request('/auth/me', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  },

  logout() {
    authService.removeToken()
  },
}
