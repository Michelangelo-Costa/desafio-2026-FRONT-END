import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { SpeciesStats } from '../../types/species'

interface Props { stats: SpeciesStats }

const GRADIENT_COLORS = [
  '#0D2B5E', '#1B4F8A', '#2563A8', '#00B4A6',
  '#1CBFB2', '#8DC63F', '#A3D65A', '#B8E07A',
]

export function TopLocationsChart({ stats }: Props) {
  if (!stats.topLocations || stats.topLocations.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-xs text-siapesq-muted">Aguardando dados do backend</p>
      </div>
    )
  }

  const data = stats.topLocations.slice(0, 8)

  return (
    <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border">
      <h2 className="font-bold text-navy text-sm mb-4">Top Localizações</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="location"
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            formatter={(v: number) => [v, 'Espécies']}
            contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map((_, i) => (
              <Cell key={i} fill={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
