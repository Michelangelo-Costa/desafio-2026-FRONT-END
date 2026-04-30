import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, ArrowRight } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useSpeciesStats } from '../hooks/useSpecies'
import { StatsCards } from '../components/charts/StatsCards'
import { CategoryChart } from '../components/charts/CategoryChart'
import { CategoryDonut } from '../components/charts/CategoryDonut'
import { StatusChart } from '../components/charts/StatusChart'
import { MonthlyChart } from '../components/charts/MonthlyChart'
import { TopLocationsChart } from '../components/charts/TopLocationsChart'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'
import { formatDate } from '../utils/formatDate'
import { speciesService } from '../services/speciesService'
import type { Species } from '../types/species'

export function Dashboard() {
  const { stats, loading } = useSpeciesStats()
  const [recentSpecies, setRecentSpecies] = useState<Species[]>([])
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const result = await speciesService.getAll({ pageSize: 9999 })
      const list: Species[] = Array.isArray(result) ? result : (result.data ?? [])
      const headers = ['Nome Comum', 'Nome Científico', 'Categoria', 'Latitude', 'Longitude', 'Localização', 'Data de Observação', 'Status', 'Identificador']
      const rows = list.map((s) => [
        s.commonName, s.scientificName, s.category,
        s.latitude, s.longitude, s.location,
        s.observationDate ? new Date(s.observationDate).toLocaleDateString('pt-BR') : '',
        s.status ?? '', s.uniqueIdentifier ?? '',
      ])

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

      // largura de cada coluna baseada no conteúdo mais largo
      ws['!cols'] = headers.map((h, i) => ({
        wch: Math.min(
          Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length)) + 2,
          50
        ),
      }))

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Espécies')
      XLSX.writeFile(wb, `siapesq-especies-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    speciesService.getAll({ page: 1, pageSize: 5 }).then((result) => {
      const list = Array.isArray(result) ? result : (result.data ?? [])
      setRecentSpecies(list)
    })
  }, [])

  if (loading) return <PageSpinner />

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy">Painel</h1>
          <p className="text-sm text-siapesq-muted mt-0.5">{formatDate(new Date().toISOString())}</p>
        </div>
        <Button variant="primary" size="md" onClick={handleExport} loading={exporting}>
          <Download size={15} />
          Exportar Dados
        </Button>
      </div>

      {stats && (
        <>
          <StatsCards stats={stats} />

          {/* Gráfico trimestral + donut */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <CategoryChart stats={stats} />
            </div>
            <CategoryDonut stats={stats} />
          </div>

          {/* Status de conservação + registros por mês */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <StatusChart stats={stats} />
            <MonthlyChart stats={stats} />
          </div>

          {/* Top localizações */}
          <div className="mb-4">
            <TopLocationsChart stats={stats} />
          </div>
        </>
      )}

      {/* Tabela de registros recentes */}
      <div className="bg-white rounded-xl shadow-card border border-siapesq-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-siapesq-border">
          <h2 className="text-base font-bold text-navy">Registros Recentes de Espécies</h2>
          <Link
            to="/species"
            className="text-sm font-medium text-teal hover:text-teal-light flex items-center gap-1 transition-colors"
          >
            Ver Todos <ArrowRight size={14} />
          </Link>
        </div>
        {recentSpecies.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-siapesq-muted">
            Nenhuma espécie cadastrada ainda.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-navy">
                <th className="text-left px-6 py-3 text-xs font-semibold text-white/80">Nome</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-white/80">Nome Científico</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-white/80">Categoria</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-white/80">Localização</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-white/80">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentSpecies.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-siapesq-border hover:bg-siapesq-surface/70 transition-colors ${i % 2 === 1 ? 'bg-siapesq-surface/40' : ''}`}
                >
                  <td className="px-6 py-3.5">
                    <Link
                      to={`/species/${s.id}`}
                      className="font-semibold text-navy text-sm hover:text-navy-mid transition-colors"
                    >
                      {s.commonName}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-siapesq-muted italic">{s.scientificName}</td>
                  <td className="px-6 py-3.5"><Badge category={s.category} /></td>
                  <td className="px-6 py-3.5 text-sm text-siapesq-dark">{s.location}</td>
                  <td className="px-6 py-3.5 text-sm text-siapesq-muted">{formatDate(s.observationDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
