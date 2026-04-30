import type { Species, SpeciesStats } from '../types/species'
import { mockSpecies, mockStats } from '../utils/mockData'

const USE_MOCK = !import.meta.env.VITE_API_URL

async function simulateDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function unwrap<T>(res: { data: T }): T {
  const raw = res.data as any
  // If backend wraps in { data: <payload> }, unwrap one level
  if (raw && typeof raw === 'object' && 'data' in raw && !('commonName' in raw) && !('byCategory' in raw)) {
    return raw.data as T
  }
  return raw as T
}

export const speciesService = {
  async getAll(params?: { search?: string; category?: string; page?: number; pageSize?: number }) {
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
      return { data: paginated, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
    }

    const { default: api } = await import('./api')
    const res = await api.get('/species', { params })
    return res.data
  },

  async getById(id: string): Promise<Species> {
    if (USE_MOCK) {
      await simulateDelay()
      const species = mockSpecies.find((s) => s.id === id)
      if (!species) throw new Error('Species not found')
      return species
    }
    const { default: api } = await import('./api')
    const res = await api.get(`/species/${id}`)
    return unwrap(res)
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
      return newSpecies
    }
    const { default: api } = await import('./api')
    const res = await api.post('/species', data)
    return unwrap(res)
  },

  async getStats(): Promise<SpeciesStats> {
    if (USE_MOCK) {
      await simulateDelay()
      return mockStats
    }
    const { default: api } = await import('./api')
    const res = await api.get('/species/stats')
    return unwrap(res)
  },
}
