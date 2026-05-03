import { categoryColors, categoryLabels } from '../../utils/categoryColors'
import type { SpeciesCategory } from '../../types/species'

interface BadgeProps {
  category: SpeciesCategory
  label?: string
}

export function Badge({ category, label }: BadgeProps) {
  const colors = categoryColors[category]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label ?? categoryLabels[category]}
    </span>
  )
}
