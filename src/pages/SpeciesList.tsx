import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search, ChevronDown, LayoutList, Grid3X3, Plus,
  Pencil, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useSpeciesList } from '../hooks/useSpecies'
import { useDebounce } from '../hooks/useDebounce'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'
import { formatDate } from '../utils/formatDate'
import { categoryLabels } from '../utils/categoryColors'
import type { Species, SpeciesCategory } from '../types/species'

const CATEGORIES: SpeciesCategory[] = ['Bird', 'Fish', 'Plant', 'Mammal', 'Reptile', 'Other']

export function SpeciesList() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    const q = searchParams.get('search')
    if (q) setSearch(q)
  }, [searchParams])
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'table' | 'grid'>('table')

  const debouncedSearch = useDebounce(search, 300)
  const { species, total, totalPages, loading } = useSpeciesList(debouncedSearch, category, page)

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    setPage(1)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-navy">Espécies</h1>
        <Link to="/species/new">
          <Button>
            <Plus size={15} />
            Adicionar Espécie
          </Button>
        </Link>
      </div>

      {/* Barra de filtros */}
      <div className="bg-white rounded-xl border border-siapesq-border shadow-card p-3 mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-siapesq-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nome ou nome científico..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-siapesq-border text-sm placeholder:text-siapesq-muted focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2 rounded-full border border-siapesq-border text-sm text-siapesq-dark font-medium focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 bg-white cursor-pointer"
          >
            <option value="All">Todas as Categorias</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{categoryLabels[c]}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-siapesq-muted pointer-events-none" />
        </div>
        <div className="flex gap-1 border border-siapesq-border rounded-lg p-0.5">
          <button
            onClick={() => setView('table')}
            className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-navy text-white' : 'text-siapesq-muted hover:text-navy'}`}
            title="Visualização em tabela"
          >
            <LayoutList size={16} />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-navy text-white' : 'text-siapesq-muted hover:text-navy'}`}
            title="Visualização em grade"
          >
            <Grid3X3 size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <PageSpinner />
      ) : species.length === 0 ? (
        <EstadoVazio />
      ) : view === 'table' ? (
        <VisualizacaoTabela species={species} />
      ) : (
        <VisualizacaoGrade species={species} />
      )}

      {!loading && species.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-siapesq-muted">
            Mostrando {(page - 1) * 10 + 1} a {Math.min(page * 10, total)} de {total} registros
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-siapesq-border text-siapesq-muted hover:text-navy hover:border-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-navy text-white'
                    : 'border border-siapesq-border text-siapesq-muted hover:text-navy hover:border-navy'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-siapesq-border text-siapesq-muted hover:text-navy hover:border-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function VisualizacaoTabela({ species }: { species: Species[] }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-siapesq-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-navy">
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/80">Nome</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/80">Nome Científico</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/80">Categoria</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/80">Localização</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/80">Último Avistamento</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/80">Ações</th>
          </tr>
        </thead>
        <tbody>
          {species.map((s, i) => (
            <tr
              key={s.id}
              className={`border-b border-siapesq-border hover:bg-siapesq-surface/70 transition-colors ${i % 2 === 1 ? 'bg-siapesq-surface/30' : ''}`}
            >
              <td className="px-5 py-3.5">
                <Link
                  to={`/species/${s.id}`}
                  className="font-semibold text-navy text-sm hover:text-navy-mid transition-colors"
                >
                  {s.commonName}
                </Link>
              </td>
              <td className="px-5 py-3.5 text-sm text-siapesq-muted italic">{s.scientificName}</td>
              <td className="px-5 py-3.5"><Badge category={s.category} /></td>
              <td className="px-5 py-3.5 text-sm text-siapesq-dark">{s.location}</td>
              <td className="px-5 py-3.5 text-sm text-siapesq-muted">{formatDate(s.observationDate)}</td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1">
                  <Link
                    to={`/species/${s.id}`}
                    className="p-1.5 rounded-lg text-siapesq-muted hover:text-teal hover:bg-teal/10 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    className="p-1.5 rounded-lg text-siapesq-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VisualizacaoGrade({ species }: { species: Species[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {species.map((s) => (
        <Link
          key={s.id}
          to={`/species/${s.id}`}
          className="bg-white rounded-xl p-5 shadow-card border border-siapesq-border hover:shadow-card-hover transition-shadow block"
        >
          <div className="mb-3">
            <Badge category={s.category} />
          </div>
          <h3 className="font-bold text-navy text-sm mb-0.5">{s.commonName}</h3>
          <p className="text-xs text-siapesq-muted italic mb-3">{s.scientificName}</p>
          <p className="text-xs text-siapesq-muted">{s.location} · {formatDate(s.observationDate)}</p>
        </Link>
      ))}
    </div>
  )
}

function EstadoVazio() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-siapesq-border shadow-card">
      <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mb-4">
        <Search size={28} className="text-teal" />
      </div>
      <h3 className="text-lg font-bold text-navy mb-2">Nenhuma espécie encontrada</h3>
      <p className="text-sm text-siapesq-muted mb-6 text-center max-w-xs">
        Nenhuma espécie corresponde aos filtros aplicados. Tente ajustar a busca.
      </p>
      <Link to="/species/new">
        <Button>
          <Plus size={15} />
          Adicionar Primeira Espécie
        </Button>
      </Link>
    </div>
  )
}
