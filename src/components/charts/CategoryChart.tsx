import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { SpeciesStats } from '../../types/species'

interface CategoryChartProps {
  stats: SpeciesStats
}

export function CategoryChart({ stats }: CategoryChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border mb-6">
      <h2 className="text-base font-bold text-navy mb-4">Espécies por Categoria</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={stats.quarterlyData} barGap={4} barCategoryGap="30%">
          <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7F99' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7F99' }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #D6E4F0', boxShadow: '0 4px 24px rgba(13,43,94,0.08)' }}
            cursor={{ fill: 'rgba(13,43,94,0.04)' }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="birds" name="Aves" fill="#00B4A6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="fish" name="Peixes" fill="#0D2B5E" radius={[4, 4, 0, 0]} />
          <Bar dataKey="plants" name="Plantas" fill="#8DC63F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
