import type { SpeciesStats } from '../../types/species'

interface Props { stats: SpeciesStats }

const statusLabels: Record<string, string> = {
  Active: 'Ativo',
  Inactive: 'Inativo',
  Endangered: 'Em perigo',
  Extinct: 'Extinto',
}

const statusColors: Record<string, string> = {
  Active: '#1B4F8A',
  Inactive: '#8899AA',
  Endangered: '#EF4444',
  Extinct: '#334155',
}

export function StatusChart({ stats }: Props) {
  if (!stats.byStatus) {
    return (
      <div className="app-card app-card-pad flex min-h-[220px] flex-col items-center justify-center">
        <p className="text-xs text-siapesq-muted">Aguardando dados do backend</p>
      </div>
    )
  }

  const data = Object.entries(stats.byStatus)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: statusLabels[key] ?? key,
      value,
      color: statusColors[key] ?? '#8899AA',
    }))
    .sort((a, b) => b.value - a.value)

  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="app-card app-card-pad">
      <div className="mb-5">
        <p className="eyebrow mb-1">Conservacao</p>
        <h2 className="section-title">Status de conservacao</h2>
      </div>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.name}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate text-sm font-bold text-siapesq-dark">{item.name}</span>
              </div>
              <span className="text-sm font-extrabold text-navy">{item.value}</span>
            </div>
            <div className="h-3 rounded-full bg-siapesq-surface overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max((item.value / max) * 100, 8)}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
