import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts'
import type { SpeciesStats } from '../../types/species'

interface Props { stats: SpeciesStats }

const ptMonths: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

export function MonthlyChart({ stats }: Props) {
  if (!stats.byMonth || stats.byMonth.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-xs text-siapesq-muted">Aguardando dados do backend</p>
      </div>
    )
  }

  const data = stats.byMonth.map(({ month, count }) => {
    const [, mm] = month.split('-')
    return { name: ptMonths[mm] ?? month, count }
  })

  return (
    <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border">
      <h2 className="font-bold text-navy text-sm mb-4">Registros por Mês</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00B4A6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00B4A6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(v: number) => [v, 'Registros']}
            contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#00B4A6"
            strokeWidth={2.5}
            fill="url(#colorCount)"
            dot={{ fill: '#00B4A6', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
