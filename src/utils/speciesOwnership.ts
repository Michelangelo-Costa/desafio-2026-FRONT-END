import type { AuthUser } from '../services/authService'
import type { Species } from '../types/species'

export function getSpeciesAuthorLabel(species: Species) {
  return species.createdBy?.name ?? species.createdBy?.email ?? 'Registro legado'
}

export function canManageSpecies(species: Species, currentUser: AuthUser | null) {
  if (species.createdById == null) return true
  return species.createdById === currentUser?.id
}
