import { useState, useEffect, useCallback } from 'react'
import { speciesService } from '../services/speciesService'
import type { Species, SpeciesStats } from '../types/species'

export function useSpeciesList(search: string, category: string, page: number) {
  const [species, setSpecies] = useState<Species[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await speciesService.getAll({ search, category, page, pageSize: 10 })
      // handle both { data: [], total, totalPages } and array fallback
      const list = Array.isArray(result) ? result : (result.data ?? [])
      setSpecies(list)
      setTotal(Array.isArray(result) ? list.length : (result.total ?? list.length))
      setTotalPages(Array.isArray(result) ? 1 : (result.totalPages ?? 1))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load species')
    } finally {
      setLoading(false)
    }
  }, [search, category, page])

  useEffect(() => { fetch() }, [fetch])

  return { species, total, totalPages, loading, error, refetch: fetch }
}

export function useSpeciesDetail(id: string) {
  const [species, setSpecies] = useState<Species | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    speciesService.getById(id)
      .then(setSpecies)
      .catch((e) => setError(e instanceof Error ? e.message : 'Not found'))
      .finally(() => setLoading(false))
  }, [id])

  return { species, loading, error }
}

export function useSpeciesStats() {
  const [stats, setStats] = useState<SpeciesStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    speciesService.getStats().then(setStats).finally(() => setLoading(false))
  }, [])

  return { stats, loading }
}
