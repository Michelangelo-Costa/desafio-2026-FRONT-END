import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Info, Calendar, Tag, Hash } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useSpeciesDetail } from '../hooks/useSpecies'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'
import { formatDate } from '../utils/formatDate'
import type { SpeciesCategory } from '../types/species'

const statusLabels: Record<string, string> = {
  'Active': 'Ativo',
  'Stable Population': 'População Estável',
  'Endangered': 'Em Perigo',
  'Vulnerable': 'Vulnerável',
  'Least Concern': 'Pouco Preocupante',
}

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

function MiniMap({ lat, lon, name, category }: { lat: number; lon: number; name: string; category: SpeciesCategory }) {
  const hasCoords = lat !== 0 || lon !== 0
  if (!hasCoords) {
    return (
      <div className="rounded-xl overflow-hidden mb-4 h-52 bg-siapesq-surface border border-siapesq-border flex flex-col items-center justify-center gap-2">
        <MapPin size={24} className="text-siapesq-muted" />
        <p className="text-xs text-siapesq-muted">Coordenadas não informadas</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl overflow-hidden mb-4 h-52">
      <MapContainer
        center={[lat, lon]}
        zoom={7}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]} icon={createIcon(category)}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export function SpeciesDetail() {
  const { id } = useParams<{ id: string }>()
  const { species, loading, error } = useSpeciesDetail(id!)

  if (loading) return <PageSpinner />

  if (error || !species) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-bold text-navy mb-2">Espécie não encontrada</p>
        <Link to="/species"><Button variant="outline">Voltar à Lista</Button></Link>
      </div>
    )
  }

  const lat = Number(species.latitude) || 0
  const lon = Number(species.longitude) || 0

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-siapesq-muted">
        <Link to="/species" className="hover:text-navy transition-colors">Espécies</Link>
        <span>›</span>
        <span className="text-navy font-medium">{species.commonName}</span>
      </nav>

      {/* Banner hero */}
      <div
        className="relative w-full rounded-xl overflow-hidden h-48 flex items-end p-8"
        style={{ background: 'linear-gradient(135deg, #0D2B5E 0%, #1B4F8A 60%, #2563A8 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-transparent" />
        <div className="relative z-10">
          {species.status && (
            <span className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-semibold border border-teal text-teal bg-teal/10">
              {statusLabels[species.status] ?? species.status}
            </span>
          )}
          <h1 className="text-4xl font-bold text-white mb-1">{species.commonName}</h1>
          <p className="text-white/70 italic text-sm">{species.scientificName}</p>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-3 gap-4">
        {/* Habitat — ocupa 2/3 */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-card border border-siapesq-border">
          <h2 className="flex items-center gap-2 font-bold text-navy text-sm mb-4">
            <MapPin size={16} className="text-teal" />
            Avistamento do Habitat Principal
          </h2>

          <MiniMap lat={lat} lon={lon} name={species.commonName} category={species.category} />

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

        {/* Taxonomia — ocupa 1/3 */}
        <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border">
          <h2 className="flex items-center gap-2 font-bold text-navy text-sm mb-4">
            <Info size={16} className="text-teal" />
            Taxonomia e Metadados
          </h2>
          <div className="flex flex-col gap-3">
            <div className="bg-siapesq-surface rounded-xl px-4 py-3.5 border border-siapesq-border">
              <p className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                <Tag size={10} /> Categoria
              </p>
              <Badge category={species.category} />
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
      {species.notes && (
        <div className="bg-white rounded-xl p-6 shadow-card border border-siapesq-border">
          <h2 className="font-bold text-navy text-sm mb-2">Notas de Campo</h2>
          <p className="text-sm text-siapesq-dark leading-relaxed">{species.notes}</p>
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
