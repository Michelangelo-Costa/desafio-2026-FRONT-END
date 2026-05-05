import type { Species, SpeciesStats } from '../types/species'
import { mockSpecies, mockStats } from '../utils/mockData'
import type { PaginatedResponse } from '../types/api'
import { getCached, setCached, invalidateCache } from '../utils/apiCache'

const USE_MOCK = !import.meta.env.VITE_API_URL

async function simulateDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type ApiEnvelope<T> = { data: T }
type SpeciesListResponse = PaginatedResponse<Species> | Species[]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function unwrap<T>(res: { data: T | ApiEnvelope<T> }): T {
  const raw = res.data
  if (isRecord(raw) && 'data' in raw && !('commonName' in raw) && !('byCategory' in raw)) {
    return raw.data as T
  }
  return raw as T
}

export const speciesService = {
  async getAll(params?: { search?: string; category?: string; page?: number; pageSize?: number }): Promise<SpeciesListResponse> {
    const cacheKey = `species:list:${JSON.stringify(params ?? {})}`
    const cached = getCached<SpeciesListResponse>(cacheKey)
    if (cached) return cached

    if (USE_MOCK) {
      await simulateDelay()
      let data = [...mockSpecies]
      if (params?.search) {
        const q = params.search.toLowerCase()
        data = data.filter(
          (s) => s.commonName.toLowerCase().includes(q) || s.scientificName.toLowerCase().includes(q)
        )
      }
      if (params?.category && params.category !== 'All') {
        data = data.filter((s) => s.category === params.category)
      }
      const page = params?.page ?? 1
      const pageSize = params?.pageSize ?? 10
      const total = data.length
      const paginated = data.slice((page - 1) * pageSize, page * pageSize)
      const result: PaginatedResponse<Species> = { data: paginated, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
      setCached(cacheKey, result)
      return result
    }

    const { default: api } = await import('./api')
    const res = await api.get('/species', { params })
    const result = res.data
    setCached(cacheKey, result)
    return result
  },

  async getById(id: string): Promise<Species> {
    const cacheKey = `species:detail:${id}`
    const cached = getCached<Species>(cacheKey)
    if (cached) return cached

    if (USE_MOCK) {
      await simulateDelay()
      const species = mockSpecies.find((s) => s.id === id)
      if (!species) throw new Error('Species not found')
      setCached(cacheKey, species)
      return species
    }
    const { default: api } = await import('./api')
    const res = await api.get(`/species/${id}`)
    const result = unwrap(res)
    setCached(cacheKey, result)
    return result
  },

  async create(data: Omit<Species, 'id' | 'uniqueIdentifier'>): Promise<Species> {
    if (USE_MOCK) {
      await simulateDelay(600)
      const newSpecies: Species = {
        ...data,
        id: String(Date.now()),
        uniqueIdentifier: `SPQ-${new Date().getFullYear()}-${data.category.charAt(0)}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      }
      mockSpecies.unshift(newSpecies)
      invalidateCache('species:')
      return newSpecies
    }
    const { default: api } = await import('./api')
    const res = await api.post('/species', data)
    invalidateCache('species:')
    return unwrap(res)
  },

  async update(id: string, data: Partial<Omit<Species, 'id' | 'uniqueIdentifier'>>): Promise<Species> {
    if (USE_MOCK) {
      await simulateDelay(500)
      const idx = mockSpecies.findIndex((s) => s.id === id)
      if (idx === -1) throw new Error('Species not found')
      mockSpecies[idx] = { ...mockSpecies[idx], ...data }
      invalidateCache('species:')
      return mockSpecies[idx]
    }
    const { default: api } = await import('./api')
    const res = await api.put(`/species/${id}`, data)
    invalidateCache('species:')
    return unwrap(res)
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay(400)
      const idx = mockSpecies.findIndex((s) => s.id === id)
      if (idx === -1) throw new Error('Species not found')
      mockSpecies.splice(idx, 1)
      invalidateCache('species:')
      return
    }
    const { default: api } = await import('./api')
    await api.delete(`/species/${id}`)
    invalidateCache('species:')
  },

  async getStats(): Promise<SpeciesStats> {
    const cacheKey = 'species:stats'
    const cached = getCached<SpeciesStats>(cacheKey)
    if (cached) return cached

    if (USE_MOCK) {
      await simulateDelay()
      setCached(cacheKey, mockStats)
      return mockStats
    }
    const { default: api } = await import('./api')
    const res = await api.get('/species/stats')
    const result = unwrap(res)
    setCached(cacheKey, result)
    return result
  },
}
