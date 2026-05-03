export type SpeciesCategory = 'Bird' | 'Fish' | 'Plant' | 'Mammal' | 'Reptile' | 'Other'
export type SpeciesStatus = 'Active' | 'Inactive' | 'Endangered' | 'Extinct'

export interface Species {
  id: string
  commonName: string
  scientificName: string
  category: SpeciesCategory
  latitude: number
  longitude: number
  location: string
  observationDate: string
  notes?: string
  status?: SpeciesStatus
  uniqueIdentifier?: string
  abundance?: number
}

export interface SpeciesStats {
  total: number
  byCategory: Record<SpeciesCategory, number>
  quarterlyData: QuarterlyData[]
  byStatus?: Record<string, number>
  byMonth?: { month: string; count: number }[]
  topLocations?: { location: string; count: number }[]
}

export interface QuarterlyData {
  quarter: string
  birds: number
  fish: number
  plants: number
  mammals: number
}
