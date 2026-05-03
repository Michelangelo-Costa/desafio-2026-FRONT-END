import { Bird, Fish, Leaf, Minus, PawPrint, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SpeciesStats } from '../../types/species'

interface StatsCardsProps {
  stats: SpeciesStats
}

interface CardConfig {
  key: string
  label: string
  helper: string
  icon: LucideIcon
  gradient: string
  change: string
  trend: 'up' | 'stable'
}

const cards: CardConfig[] = [
  {
    key: 'total',
    label: 'Total de especies',
    helper: 'Base monitorada',
    icon: PawPrint,
    gradient: 'from-navy via-navy-mid to-navy-light',
    change: '+12 este mes',
    trend: 'up',
  },
  {
    key: 'Bird',
    label: 'Aves',
    helper: 'Registros alados',
    icon: Bird,
    gradient: 'from-teal to-teal-light',
    change: '+5 este mes',
    trend: 'up',
  },
  {
    key: 'Fish',
    label: 'Peixes',
    helper: 'Ambientes aquaticos',
    icon: Fish,
    gradient: 'from-navy-mid to-[#2563A8]',
    change: 'Estavel',
    trend: 'stable',
  },
  {
    key: 'Plant',
    label: 'Plantas',
    helper: 'Cobertura vegetal',
    icon: Leaf,
    gradient: 'from-siapesq-green to-[#A8D957]',
    change: '+7 este mes',
    trend: 'up',
  },
]

export function StatsCards({ stats }: StatsCardsProps) {
  const byCategory = stats.byCategory ?? {}
  const values: Record<string, number> = {
    total: stats.total ?? 0,
    Bird: byCategory.Bird ?? 0,
    Fish: byCategory.Fish ?? 0,
    Plant: byCategory.Plant ?? 0,
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
      {cards.map(({ key, label, helper, icon: Icon, gradient, change, trend }) => (
        <div key={key} className="app-card relative overflow-hidden p-4 sm:p-5 group hover:shadow-card-hover transition-shadow">
          <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradient}`} />
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wide text-siapesq-muted leading-tight">
                {label}
              </p>
              <p className="hidden sm:block text-xs text-siapesq-muted/80 mt-1">{helper}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <Icon size={19} className="text-white" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-navy mb-2 leading-none">
            {values[key].toLocaleString('pt-BR')}
          </p>
          <div className="flex items-center gap-1.5 min-h-5">
            {trend === 'up' ? (
              <TrendingUp size={13} className="text-siapesq-green" />
            ) : (
              <Minus size={13} className="text-siapesq-muted" />
            )}
            <span className={`text-xs font-bold ${trend === 'up' ? 'text-siapesq-green' : 'text-siapesq-muted'}`}>
              {change}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
