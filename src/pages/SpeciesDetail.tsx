import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Info, Calendar, Tag, Hash, Pencil, Trash2, Save, X, Shield } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useSpeciesDetail } from '../hooks/useSpecies'
import { extractOtherCategory, stripOtherCategory, useSpeciesForm } from '../hooks/useSpeciesForm'
import { speciesService } from '../services/speciesService'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PageSpinner } from '../components/ui/Spinner'
import { formatDate } from '../utils/formatDate'
import { categoryLabels } from '../utils/categoryColors'
import type { SpeciesCategory } from '../types/species'

const STATUS_OPTIONS = [
  { value: '', label: 'Sem status' },
  { value: 'Stable Population', label: 'População Estável' },
  { value: 'Least Concern', label: 'Pouco Preocupante' },
  { value: 'Vulnerable', label: 'Vulnerável' },
  { value: 'Endangered', label: 'Em Perigo' },
] as const

const CATEGORIES: SpeciesCategory[] = ['Bird', 'Fish', 'Plant', 'Mammal', 'Reptile', 'Other']

const statusLabels: Record<string, string> = {
  'Active': 'Ativo',
  'Stable Population': 'População Estável',
  'Endangered': 'Em Perigo',
  'Vulnerable': 'Vulnerável',
  'Least Concern': 'Pouco Preocupante',
}

const statusColors: Record<string, string> = {
  'Stable Population': 'border-siapesq-green text-siapesq-green bg-siapesq-green/10',
  'Least Concern': 'border-teal text-teal bg-teal/10',
  'Vulnerable': 'border-amber-500 text-amber-600 bg-amber-50',
  'Endangered': 'border-red-500 text-red-500 bg-red-50',
}

const API_STATUS_OPTIONS = [
  STATUS_OPTIONS[0],
  { value: 'Active', label: 'Ativa' },
  { value: 'Inactive', label: 'Inativa' },
  { value: 'Endangered', label: 'Em Perigo' },
  { value: 'Extinct', label: 'Extinta' },
] as const

const apiStatusLabels: Record<string, string> = {
  ...statusLabels,
  Active: 'Ativo',
  Inactive: 'Inativo',
  Endangered: 'Em Perigo',
  Extinct: 'Extinto',
}

const apiStatusColors: Record<string, string> = {
  ...statusColors,
  Active: 'border-siapesq-green text-siapesq-green bg-siapesq-green/10',
  Inactive: 'border-siapesq-muted text-siapesq-muted bg-siapesq-muted/10',
  Endangered: 'border-red-500 text-red-500 bg-red-50',
  Extinct: 'border-slate-600 text-slate-700 bg-slate-100',
}

const BASE_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const BASE_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const markerColors: Record<SpeciesCategory, string> = {
  Bird: '#00B4A6',
  Fish: '#1B4F8A',
  Plant: '#8DC63F',
  Mammal: '#5B8DB8',
  Reptile: '#7B6FAB',
  Other: '#8899AA',
}

function createIcon(category: SpeciesCategory) {
  const color = markerColors[category] ?? '#0D2B5E'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
    </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

function InteractiveMap({ lat, lon, name, category }: { lat: number; lon: number; name: string; category: SpeciesCategory }) {
  const hasCoords = lat !== 0 || lon !== 0
  const coordinateWarning = getCoordinateWarning(lat, lon)
  if (!hasCoords) {
    return (
      <div className="rounded-xl overflow-hidden mb-4 h-52 sm:h-64 bg-siapesq-surface border border-siapesq-border flex flex-col items-center justify-center gap-2">
        <MapPin size={24} className="text-siapesq-muted" />
        <p className="text-xs text-siapesq-muted">Coordenadas não informadas</p>
      </div>
    )
  }
  return (
    <>
      {coordinateWarning && (
        <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {coordinateWarning}
        </p>
      )}
      <div className="rounded-xl overflow-hidden mb-4 h-52 sm:h-64">
        <MapContainer
          center={[lat, lon]}
          zoom={7}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
        >
          <TileLayer attribution={BASE_TILE_ATTRIBUTION} url={BASE_TILE_URL} />
          <MapResizeFix />
          <Marker position={[lat, lon]} icon={createIcon(category)}>
            <Popup>{name}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </>
  )
}

function MapResizeFix() {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize()
    }, 120)

    return () => window.clearTimeout(timer)
  }, [map])

  return null
}

function getCoordinateWarning(lat: number, lon: number) {
  if (Math.abs(lat) < 1 && Math.abs(lon) < 1) {
    return 'A coordenada esta muito perto de 0,0. O ponto pode ter sido marcado acidentalmente no oceano.'
  }
  const likelyOutsideBrazil = lat < -35 || lat > 8 || lon < -75 || lon > -30
  if (likelyOutsideBrazil) {
    return 'Essa coordenada parece estar fora da area do Brasil. Confira se latitude e longitude foram informadas corretamente.'
  }
  return null
}

export function SpeciesDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { species, loading, error } = useSpeciesDetail(id!)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (loading) return <PageSpinner />

  if (error || !species) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-bold text-navy mb-2">Espécie não encontrada</p>
        <Link to="/species"><Button variant="outline">Voltar à Lista</Button></Link>
      </div>
    )
  }

  if (editing) {
    return <EditMode species={species} onCancel={() => setEditing(false)} />
  }

  const lat = Number(species.latitude) || 0
  const lon = Number(species.longitude) || 0
  const otherCategory = species.category === 'Other' ? extractOtherCategory(species.notes) : ''
  const statusClass = species.status ? (apiStatusColors[species.status] ?? 'border-teal text-teal bg-teal/10') : ''

  async function handleDelete() {
    setDeleting(true)
    try {
      await speciesService.delete(id!)
      navigate('/species')
    } catch {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-siapesq-muted">
        <Link to="/species" className="hover:text-navy transition-colors">Espécies</Link>
        <span>›</span>
        <span className="text-navy font-medium truncate">{species.commonName}</span>
      </nav>

      {/* Banner hero */}
      <div
        className="relative w-full rounded-xl overflow-hidden h-36 sm:h-48 flex items-end p-4 sm:p-8"
        style={{ background: 'linear-gradient(135deg, #0D2B5E 0%, #1B4F8A 60%, #2563A8 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-transparent" />
        <div className="relative z-10 flex-1">
          {species.status && (
            <span className={`inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
              {apiStatusLabels[species.status] ?? species.status}
            </span>
          )}
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1">{species.commonName}</h1>
          <p className="text-white/70 italic text-sm">{species.scientificName}</p>
        </div>
        {/* Actions */}
        <div className="relative z-10 flex items-center gap-2 flex-shrink-0 self-start mt-2 sm:mt-0 sm:self-end">
          <button
            onClick={() => setEditing(true)}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white transition-colors backdrop-blur-sm"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-red-700">Excluir "{species.commonName}"?</p>
            <p className="text-xs text-red-500 mt-0.5">Essa ação não pode ser desfeita.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {deleting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Excluir
            </button>
          </div>
        </div>
      )}

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Habitat */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 shadow-card border border-siapesq-border">
          <h2 className="flex items-center gap-2 font-bold text-navy text-sm mb-4">
            <MapPin size={16} className="text-teal" />
            Avistamento do Habitat Principal
          </h2>

          <InteractiveMap lat={lat} lon={lon} name={species.commonName} category={species.category} />

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-siapesq-surface rounded-xl px-5 py-3.5 border border-siapesq-border">
              <p className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider mb-1">Latitude</p>
              <p className="text-sm font-bold text-navy">
                {lat !== 0 ? `${Math.abs(lat).toFixed(4)}° ${lat < 0 ? 'S' : 'N'}` : '—'}
              </p>
            </div>
            <div className="bg-siapesq-surface rounded-xl px-5 py-3.5 border border-siapesq-border">
              <p className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider mb-1">Longitude</p>
              <p className="text-sm font-bold text-navy">
                {lon !== 0 ? `${Math.abs(lon).toFixed(4)}° ${lon < 0 ? 'O' : 'L'}` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Taxonomia */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-card border border-siapesq-border">
          <h2 className="flex items-center gap-2 font-bold text-navy text-sm mb-4">
            <Info size={16} className="text-teal" />
            Taxonomia e Metadados
          </h2>
          <div className="flex flex-col gap-3">
            <div className="bg-siapesq-surface rounded-xl px-4 py-3.5 border border-siapesq-border">
              <p className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                <Tag size={10} /> Categoria
              </p>
              <Badge category={species.category} label={otherCategory || undefined} />
            </div>
            <div className="bg-siapesq-surface rounded-xl px-4 py-3.5 border border-siapesq-border">
              <p className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                <Shield size={10} /> Status de Conservação
              </p>
              <p className="text-sm font-semibold text-navy">
                {species.status ? (apiStatusLabels[species.status] ?? species.status) : 'Não definido'}
              </p>
            </div>
            <div className="bg-siapesq-surface rounded-xl px-4 py-3.5 border border-siapesq-border">
              <p className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={10} /> Data de Registro
              </p>
              <p className="text-sm font-semibold text-navy">{formatDate(species.observationDate)}</p>
            </div>
            {species.uniqueIdentifier && (
              <div className="bg-siapesq-surface rounded-xl px-4 py-3.5 border border-siapesq-border">
                <p className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Hash size={10} /> Identificador Único
                </p>
                <p className="text-xs font-mono text-navy-mid font-semibold break-all">{species.uniqueIdentifier}</p>
              </div>
            )}
            {species.location && (
              <div className="bg-siapesq-surface rounded-xl px-4 py-3.5 border border-siapesq-border">
                <p className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={10} /> Localização
                </p>
                <p className="text-sm font-semibold text-navy">{species.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notas de Campo */}
      {stripOtherCategory(species.notes) && (
        <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border">
          <h2 className="font-bold text-navy text-sm mb-2">Notas de Campo</h2>
          <p className="text-sm text-siapesq-dark leading-relaxed">{stripOtherCategory(species.notes)}</p>
        </div>
      )}

      <div>
        <Link to="/species">
          <Button variant="outline">
            <ArrowLeft size={14} />
            Voltar à Lista de Espécies
          </Button>
        </Link>
      </div>
    </div>
  )
}

function EditMode({ species, onCancel }: { species: import('../types/species').Species; onCancel: () => void }) {
  const navigate = useNavigate()
  const { form, onSubmit, submitting, submitError, submitSuccess } = useSpeciesForm(
    () => { setTimeout(() => navigate(0), 800) },
    species
  )
  const { register, watch, formState: { errors } } = form
  const abundance = watch('abundance') ?? 1
  const selectedCategory = watch('category')

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-siapesq-green/10 flex items-center justify-center mb-4">
          <Save size={30} className="text-siapesq-green" />
        </div>
        <h2 className="text-xl font-bold text-navy mb-1">Alterações salvas!</h2>
        <p className="text-sm text-siapesq-muted">Recarregando...</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-siapesq-border/60 text-siapesq-muted hover:text-navy transition-colors">
            <X size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-navy">Editar Espécie</h1>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-card border border-siapesq-border p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <Input label="Nome Comum" error={errors.commonName?.message} {...register('commonName')} />
          <Input label="Nome Científico" error={errors.scientificName?.message} {...register('scientificName')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-siapesq-dark">Categoria</label>
            <select
              {...register('category')}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-siapesq-dark bg-white focus:outline-none focus:ring-2 focus:border-teal focus:ring-teal/20 transition-all appearance-none cursor-pointer ${errors.category ? 'border-red-500' : 'border-siapesq-border'}`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{categoryLabels[c]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-siapesq-dark flex items-center gap-1.5">
              <Shield size={13} className="text-teal" />
              Status de Conservação
            </label>
            <select
              {...register('status')}
              className="w-full rounded-xl border border-siapesq-border px-4 py-2.5 text-sm text-siapesq-dark bg-white focus:outline-none focus:ring-2 focus:border-teal focus:ring-teal/20 transition-all appearance-none cursor-pointer"
            >
              {API_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <Input label="Data de Observação" type="date" error={errors.observationDate?.message} {...register('observationDate')} />
        </div>

        {selectedCategory === 'Other' && (
          <div className="mb-6">
            <Input
              label="Nome da categoria"
              placeholder="ex: Anfibio, Inseto, Fungo..."
              error={errors.otherCategory?.message}
              {...register('otherCategory')}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Input label="Latitude" error={errors.latitude?.message} {...register('latitude')} />
          <Input label="Longitude" error={errors.longitude?.message} {...register('longitude')} />
          <Input label="Localização" error={errors.location?.message} {...register('location')} />
        </div>

        {/* Abundância */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-siapesq-dark">Abundância na Região</label>
            <span className="text-sm font-bold text-navy">{abundance}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            {...register('abundance')}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00B4A6 0%, #00B4A6 ${(abundance - 1) / 9 * 100}%, #E2E8F0 ${(abundance - 1) / 9 * 100}%, #E2E8F0 100%)`,
            }}
          />
        </div>

        {/* Notas */}
        <div className="mb-8">
          <label className="text-sm font-medium text-siapesq-dark block mb-1">Notas de Campo</label>
          <textarea
            {...register('notes')}
            rows={4}
            placeholder="Descreva o habitat, comportamento observado..."
            className="w-full rounded-xl border border-siapesq-border px-4 py-3 text-sm text-siapesq-dark placeholder:text-siapesq-muted focus:outline-none focus:ring-2 focus:border-teal focus:ring-teal/20 resize-none transition-all"
          />
        </div>

        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">{submitError}</p>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-siapesq-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X size={14} />
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            <Save size={15} />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  )
}
