import type { SpeciesCategory } from '../types/species'

export const categoryColors: Record<SpeciesCategory, { bg: string; text: string; dot: string }> = {
  Bird: { bg: 'bg-teal/15', text: 'text-teal', dot: 'bg-teal' },
  Fish: { bg: 'bg-navy-mid/15', text: 'text-navy-mid', dot: 'bg-navy-mid' },
  Plant: { bg: 'bg-siapesq-green/15', text: 'text-siapesq-green', dot: 'bg-siapesq-green' },
  Mammal: { bg: 'bg-[#5B8DB8]/15', text: 'text-[#5B8DB8]', dot: 'bg-[#5B8DB8]' },
  Reptile: { bg: 'bg-[#7B6FAB]/15', text: 'text-[#7B6FAB]', dot: 'bg-[#7B6FAB]' },
  Other: { bg: 'bg-siapesq-muted/15', text: 'text-siapesq-muted', dot: 'bg-siapesq-muted' },
}

export const categoryLabels: Record<SpeciesCategory, string> = {
  Bird: 'Ave',
  Fish: 'Peixe',
  Plant: 'Planta',
  Mammal: 'Mamífero',
  Reptile: 'Réptil',
  Other: 'Outra categoria',
}

export const chartColors: Record<string, string> = {
  birds: '#00B4A6',
  fish: '#0D2B5E',
  plants: '#8DC63F',
  mammals: '#5B8DB8',
}
