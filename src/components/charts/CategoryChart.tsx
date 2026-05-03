import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SpeciesStats } from '../../types/species'

interface ActivityChartProps {
  stats: SpeciesStats
}

const ptMonths: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

function getActivityData(stats: SpeciesStats) {
  if (stats.byMonth && stats.byMonth.length > 0) {
    return stats.byMonth.map(({ month, count }) => {
      const [, mm] = month.split('-')
      return { name: ptMonths[mm] ?? month, count }
    })
  }

  return (stats.quarterlyData ?? []).map((item) => ({
    name: item.quarter,
    count: item.birds + item.fish + item.plants + item.mammals,
  }))
}

export function CategoryChart({ stats }: ActivityChartProps) {
  const data = getActivityData(stats)
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const peak = data.reduce((max, item) => Math.max(max, item.count), 0)

  return (
    <div className="app-card app-card-pad">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow mb-1">Atividade</p>
          <h2 className="section-title">Registros ao longo do tempo</h2>
          <p className="mt-1 text-xs text-siapesq-muted">
            Acompanhe se a base esta sendo alimentada com frequencia.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right sm:min-w-[180px]">
          <div className="rounded-xl border border-siapesq-border bg-siapesq-surface/60 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-siapesq-muted">Total</p>
            <p className="text-lg font-extrabold text-navy">{total}</p>
          </div>
          <div className="rounded-xl border border-siapesq-border bg-siapesq-surface/60 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-siapesq-muted">Pico</p>
            <p className="text-lg font-extrabold text-navy">{peak}</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-siapesq-muted">
          Aguardando dados do backend
        </div>
      ) : (
        <div className="h-[280px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B4A6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00B4A6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF4FA" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7F99' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7F99' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value ?? 0, 'Registros']}
                labelFormatter={(label) => `Periodo: ${label}`}
                contentStyle={{ borderRadius: 14, border: '1px solid #D6E4F0', boxShadow: '0 10px 30px rgba(13,43,94,0.12)', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#00B4A6"
                strokeWidth={3}
                fill="url(#activityGradient)"
                dot={{ fill: '#00B4A6', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, stroke: '#0D2B5E', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
