import { TrendingUp, Minus, PawPrint, Bird, Fish, Leaf } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SpeciesStats } from '../../types/species'

interface StatsCardsProps {
  stats: SpeciesStats
}

interface CardConfig {
  key: string
  label: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  change: string
  trend: 'up' | 'stable'
}

const cards: CardConfig[] = [
  {
    key: 'total',
    label: 'TOTAL DE ESPÉCIES',
    icon: PawPrint,
    iconBg: 'bg-navy/10',
    iconColor: 'text-navy',
    change: '+12 este mês',
    trend: 'up',
  },
  {
    key: 'Bird',
    label: 'AVES',
    icon: Bird,
    iconBg: 'bg-teal/10',
    iconColor: 'text-teal',
    change: '+5 este mês',
    trend: 'up',
  },
  {
    key: 'Fish',
    label: 'PEIXES',
    icon: Fish,
    iconBg: 'bg-navy-mid/10',
    iconColor: 'text-navy-mid',
    change: 'Estável',
    trend: 'stable',
  },
  {
    key: 'Plant',
    label: 'PLANTAS',
    icon: Leaf,
    iconBg: 'bg-siapesq-green/10',
    iconColor: 'text-siapesq-green',
    change: '+7 este mês',
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(({ key, label, icon: Icon, iconBg, iconColor, change, trend }) => (
        <div key={key} className="bg-white rounded-xl p-5 shadow-card border border-siapesq-border">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold text-siapesq-muted tracking-wider">{label}</p>
            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={iconColor} />
            </div>
          </div>
          <p className="text-3xl font-bold text-navy mb-1.5">
            {values[key].toLocaleString('pt-BR')}
          </p>
          <div className="flex items-center gap-1.5">
            {trend === 'up' ? (
              <TrendingUp size={13} className="text-siapesq-green" />
            ) : (
              <Minus size={13} className="text-siapesq-muted" />
            )}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-siapesq-green' : 'text-siapesq-muted'}`}>
              {change}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
