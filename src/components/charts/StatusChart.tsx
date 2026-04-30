import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { SpeciesStats } from '../../types/species'

interface Props { stats: SpeciesStats }

const statusLabels: Record<string, string> = {
  'Endangered': 'Em Perigo',
  'Vulnerable': 'Vulnerável',
  'Stable Population': 'Pop. Estável',
  'Least Concern': 'Pouco Preocupante',
  'Active': 'Ativo',
}

const statusColors: Record<string, string> = {
  'Endangered': '#EF4444',
  'Vulnerable': '#F97316',
  'Stable Population': '#00B4A6',
  'Least Concern': '#8DC63F',
  'Active': '#1B4F8A',
}

export function StatusChart({ stats }: Props) {
  if (!stats.byStatus) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border flex flex-col items-center justify-center min-h-[200px]">
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

  return (
    <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border">
      <h2 className="font-bold text-navy text-sm mb-4">Status de Conservação</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            formatter={(v: number) => [v, 'Espécies']}
            contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
