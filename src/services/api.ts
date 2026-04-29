import axios from 'axios'
import { authService } from './authService'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = authService.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.removeToken()
      window.location.href = '/login'
    }
    const message = error.response?.data?.message || error.message || 'Erro inesperado'
    return Promise.reject(new Error(message))
  }
)

export default api
