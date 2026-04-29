export type SpeciesCategory = 'Bird' | 'Fish' | 'Plant' | 'Mammal' | 'Reptile' | 'Other'

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
  status?: 'Stable Population' | 'Endangered' | 'Vulnerable' | 'Least Concern'
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
