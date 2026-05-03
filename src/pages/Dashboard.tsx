import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight, Database, Download, Map, PawPrint, PlusCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useSpeciesStats } from '../hooks/useSpecies'
import { StatsCards } from '../components/charts/StatsCards'
import { CategoryChart } from '../components/charts/CategoryChart'
import { CategoryDonut } from '../components/charts/CategoryDonut'
import { StatusChart } from '../components/charts/StatusChart'
import { TopLocationsChart } from '../components/charts/TopLocationsChart'
import { Badge } from '../components/ui/Badge'
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
      const headers = ['Nome Comum', 'Nome Cientifico', 'Categoria', 'Latitude', 'Longitude', 'Localizacao', 'Data de Observacao', 'Status', 'Identificador']
      const rows = list.map((s) => [
        s.commonName,
        s.scientificName,
        s.category,
        s.latitude,
        s.longitude,
        s.location,
        s.observationDate ? new Date(s.observationDate).toLocaleDateString('pt-BR') : '',
        s.status ?? '',
        s.uniqueIdentifier ?? '',
      ])

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
      ws['!cols'] = headers.map((h, i) => ({
        wch: Math.min(Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length)) + 2, 50),
      }))

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Especies')
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
    <div className="w-full max-w-[1440px] mx-auto">
      <section
        className="relative overflow-hidden rounded-2xl mb-5 sm:mb-6 p-5 sm:p-7 lg:p-8 text-white shadow-card-hover"
        style={{ background: 'linear-gradient(135deg, #06204A 0%, #0D2B5E 38%, #008FA3 72%, #00B4A6 100%)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,100 C100,40 200,160 300,100 C400,40 500,160 600,100 C700,40 800,120 800,100 L800,200 L0,200 Z" fill="white" />
            <path d="M0,130 C120,70 220,180 340,120 C460,60 560,170 680,120 C760,90 800,140 800,130 L800,200 L0,200 Z" fill="white" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/20" />
        <div className="absolute right-6 bottom-6 hidden sm:grid grid-cols-5 gap-1 opacity-25">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
          ))}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-teal-light text-[11px] font-extrabold uppercase tracking-[0.22em] mb-2">ARCA · Painel de Monitoramento</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-2">
              Monitoramento inteligente de especies
            </h1>
            <p className="text-white/75 text-sm sm:text-base max-w-xl">
              Acompanhe registros, distribuicao geografica e indicadores de conservacao em uma visao pronta para campo e pesquisa.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/80">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Activity size={13} className="text-siapesq-green" />
                {stats?.total ?? 0} registros ativos
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Database size={13} className="text-teal-light" />
                {formatDate(new Date().toISOString())}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex min-h-11 items-center justify-center gap-2 px-4 sm:px-5 rounded-full text-sm font-bold bg-white text-navy hover:bg-white/90 shadow-sm transition-all disabled:opacity-60"
            >
              {exporting ? (
                <span className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={15} />
              )}
              Exportar
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <DashboardAction to="/species" icon={PawPrint} title="Especies" subtitle={`${stats?.total ?? 0} registros`} tone="teal" />
          <DashboardAction to="/map" icon={Map} title="Mapa" subtitle="Visualizar camadas" tone="blue" />
          <DashboardAction to="/species/new" icon={PlusCircle} title="Adicionar" subtitle="Nova especie" tone="green" />
        </div>
      </section>

      {stats && (
        <>
          <StatsCards stats={stats} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
            <div className="xl:col-span-2">
              <CategoryChart stats={stats} />
            </div>
            <CategoryDonut stats={stats} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <StatusChart stats={stats} />
            <TopLocationsChart stats={stats} />
          </div>
        </>
      )}

      <div className="app-card overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-siapesq-border">
          <div>
            <p className="eyebrow mb-1">Arquivo</p>
            <h2 className="section-title">Registros recentes</h2>
          </div>
          <Link
            to="/species"
            className="text-sm font-bold text-teal hover:text-teal-light flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        {recentSpecies.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-siapesq-muted">
            Nenhuma especie cadastrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto table-scroll-wrapper">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-navy">
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-white/80">Nome</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-white/80">Nome cientifico</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-white/80">Categoria</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-white/80">Localizacao</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-white/80">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentSpecies.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-siapesq-border hover:bg-siapesq-surface/70 transition-colors ${i % 2 === 1 ? 'bg-siapesq-surface/40' : ''}`}
                  >
                    <td className="px-4 sm:px-6 py-3.5">
                      <Link to={`/species/${s.id}`} className="font-semibold text-navy text-sm hover:text-navy-mid transition-colors">
                        {s.commonName}
                      </Link>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-sm text-siapesq-muted italic">{s.scientificName}</td>
                    <td className="px-4 sm:px-6 py-3.5"><Badge category={s.category} /></td>
                    <td className="px-4 sm:px-6 py-3.5 text-sm text-siapesq-dark">{s.location}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-sm text-siapesq-muted whitespace-nowrap">{formatDate(s.observationDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function DashboardAction({
  to,
  icon: Icon,
  title,
  subtitle,
  tone,
}: {
  to: string
  icon: typeof PawPrint
  title: string
  subtitle: string
  tone: 'teal' | 'blue' | 'green'
}) {
  const tones = {
    teal: 'bg-teal/25',
    blue: 'bg-navy-light/25',
    green: 'bg-siapesq-green/25',
  }

  return (
    <Link
      to={to}
      className="flex items-center gap-3 bg-white/12 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 transition-all border border-white/10"
    >
      <div className={`w-9 h-9 rounded-lg ${tones[tone]} flex items-center justify-center flex-shrink-0`}>
        <Icon size={17} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-white font-bold text-sm leading-tight">{title}</p>
        <p className="text-white/55 text-xs leading-tight">{subtitle}</p>
      </div>
    </Link>
  )
}
