import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { SpeciesCategory, SpeciesStats } from '../../types/species'
import { categoryLabels } from '../../utils/categoryColors'

interface Props { stats: SpeciesStats }

const COLORS: Record<SpeciesCategory, string> = {
  Bird: '#00B4A6',
  Fish: '#1B4F8A',
  Plant: '#8DC63F',
  Mammal: '#5B8DB8',
  Reptile: '#7B6FAB',
  Other: '#8899AA',
}

export function CategoryDonut({ stats }: Props) {
  const data = (Object.entries(stats.byCategory ?? {}) as [SpeciesCategory, number][])
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: categoryLabels[key] ?? key, value, color: COLORS[key] }))

  if (data.length === 0) return null

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="app-card app-card-pad">
      <div className="mb-3">
        <p className="eyebrow mb-1">Composicao</p>
        <h2 className="section-title">Distribuicao</h2>
      </div>
      <div className="relative h-[235px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value ?? 0, String(name)]}
              contentStyle={{ borderRadius: 12, border: '1px solid #D6E4F0', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-navy leading-none">{total}</p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-siapesq-muted mt-1">registros</p>
          </div>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((item) => (
          <span key={item.name} className="inline-flex items-center gap-1.5 text-xs font-semibold text-siapesq-dark">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
        ))}
      </div>
    </div>
  )
}
