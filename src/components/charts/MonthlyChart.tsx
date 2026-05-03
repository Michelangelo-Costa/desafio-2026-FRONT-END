import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
      <div className="app-card app-card-pad flex min-h-[220px] flex-col items-center justify-center">
        <p className="text-xs text-siapesq-muted">Aguardando dados do backend</p>
      </div>
    )
  }

  const data = stats.byMonth.map(({ month, count }) => {
    const [, mm] = month.split('-')
    return { name: ptMonths[mm] ?? month, count }
  })

  return (
    <div className="app-card app-card-pad">
      <div className="mb-4">
        <p className="eyebrow mb-1">Atividade</p>
        <h2 className="section-title">Registros por mes</h2>
      </div>
      <div className="h-[235px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00B4A6" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#00B4A6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF4FA" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7F99' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7F99' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              formatter={(value) => [value ?? 0, 'Registros']}
              contentStyle={{ borderRadius: 12, border: '1px solid #D6E4F0', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#00B4A6"
              strokeWidth={3}
              fill="url(#colorCount)"
              dot={{ fill: '#00B4A6', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
