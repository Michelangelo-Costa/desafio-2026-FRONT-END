import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { SpeciesStats, SpeciesCategory } from '../../types/species'
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

  return (
    <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border">
      <h2 className="font-bold text-navy text-sm mb-4">Distribuição por Categoria</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [value, name]}
            contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }}
          />
          <Legend
            formatter={(value) => <span className="text-xs text-siapesq-dark">{value}</span>}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
