import type { SpeciesStats } from '../../types/species'

interface Props { stats: SpeciesStats }

const COLORS = ['#0D2B5E', '#1B4F8A', '#2563A8', '#00B4A6', '#1CBFB2', '#8DC63F', '#A3D65A', '#B8E07A']

export function TopLocationsChart({ stats }: Props) {
  if (!stats.topLocations || stats.topLocations.length === 0) {
    return (
      <div className="app-card app-card-pad flex min-h-[200px] flex-col items-center justify-center">
        <p className="text-xs text-siapesq-muted">Aguardando dados do backend</p>
      </div>
    )
  }

  const data = stats.topLocations.slice(0, 8)
  const max = Math.max(...data.map((item) => item.count), 1)

  return (
    <div className="app-card app-card-pad">
      <div className="mb-5">
        <p className="eyebrow mb-1">Territorio</p>
        <h2 className="section-title">Top localizacoes</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((item, i) => (
          <div key={item.location} className="rounded-xl border border-siapesq-border bg-siapesq-surface/45 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="truncate text-sm font-bold text-siapesq-dark">{item.location}</span>
              <span className="text-sm font-extrabold text-navy">{item.count}</span>
            </div>
            <div className="h-2.5 rounded-full bg-white overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max((item.count / max) * 100, 8)}%`, backgroundColor: COLORS[i % COLORS.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
