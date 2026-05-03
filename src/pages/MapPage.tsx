import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents, WMSTileLayer } from 'react-leaflet'
import { Link, useNavigate } from 'react-router-dom'
import { Layers, MapPin, PlusCircle, X } from 'lucide-react'
import L from 'leaflet'
import 'leaflet.heat'
import { speciesService } from '../services/speciesService'
import type { Species, SpeciesCategory } from '../types/species'
import { categoryLabels } from '../utils/categoryColors'
import { PageSpinner } from '../components/ui/Spinner'

const BASE_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const BASE_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const markerColors: Record<SpeciesCategory, string> = {
  Bird: '#00B4A6',
  Fish: '#1B4F8A',
  Plant: '#8DC63F',
  Mammal: '#5B8DB8',
  Reptile: '#7B6FAB',
  Other: '#8899AA',
}

const HEATMAP_GRADIENT = {
  0.18: '#D8F6F1',
  0.35: '#5EEAD4',
  0.55: '#14B8A6',
  0.72: '#8DC63F',
  0.88: '#FACC15',
  1.0: '#EF4444',
}

const HEATMAP_LEGEND = 'linear-gradient(to right, #D8F6F1, #5EEAD4, #14B8A6, #8DC63F, #FACC15, #EF4444)'

function createIcon(category: SpeciesCategory) {
  const color = markerColors[category]
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
    </svg>`
  return L.divIcon({ html: svg, className: '', iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -36] })
}

function FitBounds({ species }: { species: Species[] }) {
  const map = useMap()
  useEffect(() => {
    const valid = species.filter((s) => s.latitude !== 0 || s.longitude !== 0)
    if (valid.length === 0) return
    const bounds = L.latLngBounds(valid.map((s) => [s.latitude, s.longitude]))
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 })
  }, [species, map])
  return null
}

function HeatmapLayer({ species }: { species: Species[] }) {
  const map = useMap()
  useEffect(() => {
    const points = species
      .filter((s) => s.latitude !== 0 || s.longitude !== 0)
      .map((s) => {
        const abundance = Number.isFinite(s.abundance) ? Number(s.abundance) : 1
        const intensity = Math.min(1, Math.max(0.25, abundance / 10))
        return [s.latitude, s.longitude, intensity] as [number, number, number]
      })
    if (points.length === 0) return
    const heat = (L as any).heatLayer(points, {
      radius: 26,
      blur: 20,
      maxZoom: 9,
      minOpacity: 0.24,
      max: 1,
      gradient: HEATMAP_GRADIENT,
    })
    heat.addTo(map)
    return () => { map.removeLayer(heat) }
  }, [map, species])
  return null
}

function MapCreateEvents({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
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

// ─── NASA GIBS ────────────────────────────────────────────────────────────────

function MapInfoPanel({
  mode,
  activeSat,
  date,
}: {
  mode: MapMode
  activeSat: GibsLayerDef | null
  date: string
}) {
  return (
    <div className="absolute inset-x-3 bottom-3 z-[1000] rounded-2xl border border-siapesq-border bg-white/95 p-3 shadow-card backdrop-blur sm:left-4 sm:right-auto sm:w-[430px] sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          {mode === 'heatmap' ? (
            <>
              <p className="text-xs font-extrabold text-navy">Densidade de registros</p>
              <div className="mt-2 h-2.5 rounded-full" style={{ background: HEATMAP_LEGEND }} />
              <div className="mt-1 flex justify-between text-[10px] text-siapesq-muted">
                <span>Baixa</span>
                <span>Alta</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-extrabold text-navy">Legenda</p>
              <div className="mt-2 flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {Object.entries(markerColors).map(([cat, color]) => (
                  <span key={cat} className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-siapesq-dark">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {categoryLabels[cat as SpeciesCategory]}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {activeSat && (
          <div className="border-t border-siapesq-border pt-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-navy">{activeSat.label}</p>
              <span className="rounded-full border border-siapesq-border bg-siapesq-surface px-1.5 py-0.5 text-[9px] text-siapesq-muted">
                {activeSat.coverage}
              </span>
            </div>
            {activeSat.legendGradient && (
              <>
                <div className="h-2.5 rounded-full" style={{ background: activeSat.legendGradient }} />
                <div className="mt-1 flex justify-between text-[10px] text-siapesq-muted">
                  <span>{activeSat.legendLeft}</span>
                  <span>{activeSat.legendRight}</span>
                </div>
              </>
            )}
            <p className="mt-1 text-[9px] text-siapesq-muted/70">
              {activeSat.source ?? 'NASA GIBS'}{date ? ` · ${date}` : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

type SatelliteLayerKey = 'none' | 'truecolor' | 'sst' | 'chlorophyll' | 'ndvi' | 'landtemp'

interface GibsLayerDef {
  label: string
  description: string
  coverage: string
  protocol: 'tile' | 'wmts' | 'wms'
  layer: string
  source?: string
  url?: string
  attribution?: string
  ext?: 'jpg' | 'png'
  legendGradient?: string
  legendLeft?: string
  legendRight?: string
}

const GIBS_WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi'
const GIBS_WMTS_BASE = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best'

const GIBS_LAYERS: Record<Exclude<SatelliteLayerKey, 'none'>, GibsLayerDef> = {
  truecolor: {
    label: 'Cor Real',
    description: 'Imagem base de satelite continua',
    coverage: 'Global',
    protocol: 'tile',
    layer: 'World_Imagery',
    source: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  ndvi: {
    label: 'Vegetação (NDVI)',
    description: 'Índice de vegetação MODIS/Terra (composto 8 dias)',
    coverage: 'Terra',
    protocol: 'wmts',
    layer: 'MODIS_Terra_NDVI_8Day',
    ext: 'png',
    legendGradient: 'linear-gradient(to right, #8B4513, #D2B48C, #90EE90, #228B22, #006400)',
    legendLeft: 'Deserto / Sem veg.',
    legendRight: 'Densa',
  },
  sst: {
    label: 'Temp. do Mar',
    description: 'Temperatura superficial do oceano',
    coverage: 'Oceano',
    protocol: 'wms',
    layer: 'GHRSST_L4_MUR_Sea_Surface_Temperature',
    legendGradient: 'linear-gradient(to right, #00008B, #0000FF, #00BFFF, #00FF00, #FFFF00, #FF8C00, #FF0000)',
    legendLeft: 'Fria',
    legendRight: 'Quente',
  },
  chlorophyll: {
    label: 'Clorofila',
    description: 'Concentração de clorofila-a (Aqua/MODIS L2)',
    coverage: 'Oceano',
    protocol: 'wms',
    layer: 'MODIS_Aqua_L2_Chlorophyll_A',
    legendGradient: 'linear-gradient(to right, #440154, #31688e, #35b779, #fde725)',
    legendLeft: 'Baixa',
    legendRight: 'Alta',
  },
  landtemp: {
    label: 'Temp. Terrestre',
    description: 'Temperatura da superfície terrestre (MODIS/Terra)',
    coverage: 'Terra',
    protocol: 'wms',
    layer: 'MODIS_Terra_Land_Surface_Temp_Day',
    legendGradient: 'linear-gradient(to right, #00008B, #00BFFF, #00FF00, #FFFF00, #FF8C00, #FF0000)',
    legendLeft: 'Fria',
    legendRight: 'Quente',
  },
}

function getGibsDate(daysBack = 7): string {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  return d.toISOString().slice(0, 10)
}

// ─────────────────────────────────────────────────────────────────────────────

const categoryFilters: { value: string; label: string }[] = [
  { value: 'All', label: 'Todas' },
  { value: 'Bird', label: 'Aves' },
  { value: 'Fish', label: 'Peixes' },
  { value: 'Plant', label: 'Plantas' },
  { value: 'Mammal', label: 'Mamíferos' },
  { value: 'Reptile', label: 'Répteis' },
  { value: 'Other', label: 'Outros' },
]

type MapMode = 'markers' | 'heatmap'

export function MapPage() {
  const navigate = useNavigate()
  const [allSpecies, setAllSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [mapMode, setMapMode] = useState<MapMode>('markers')
  const [satelliteLayer, setSatelliteLayer] = useState<SatelliteLayerKey>('none')
  const [showSatMenu, setShowSatMenu] = useState(false)
  const [createPoint, setCreatePoint] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    speciesService.getAll({ pageSize: 500 })
      .then((result) => {
        const list = Array.isArray(result) ? result : (result.data ?? [])
        setAllSpecies(list)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeCategory === 'All'
    ? allSpecies
    : allSpecies.filter((s) => s.category === activeCategory)

  const activeSat = satelliteLayer !== 'none' ? GIBS_LAYERS[satelliteLayer] : null
  const wmtsDate = getGibsDate(2)
  const wmsDate = getGibsDate(7)

  function renderSatelliteLayer() {
    if (!activeSat) return null
    if (activeSat.protocol === 'tile') {
      return (
        <TileLayer
          key={`${satelliteLayer}-tile`}
          url={activeSat.url ?? ''}
          attribution={activeSat.attribution ?? activeSat.source ?? activeSat.label}
          opacity={1}
          maxNativeZoom={19}
        />
      )
    }

    if (activeSat.protocol === 'wmts') {
      return (
        <TileLayer
          key={`${satelliteLayer}-${wmtsDate}`}
          url={`${GIBS_WMTS_BASE}/${activeSat.layer}/default/${wmtsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.${activeSat.ext}`}
          attribution={`NASA GIBS · ${activeSat.label}`}
          opacity={satelliteLayer === 'truecolor' ? 1 : 0.9}
          maxNativeZoom={9}
          tileSize={256}
        />
      )
    }
    // WMS — more reliable for scientific products with data gaps
    return (
      <WMSTileLayer
        key={`${satelliteLayer}-${wmsDate}`}
        url={`${GIBS_WMS}?TIME=${wmsDate}`}
        layers={activeSat.layer}
        format="image/png"
        transparent={true}
        version="1.1.1"
        opacity={0.9}
        attribution={`NASA GIBS · ${activeSat.label}`}
      />
    )
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto flex h-full min-h-0 flex-col gap-3 overflow-hidden sm:gap-4">
      {/* Header */}
      <div className="flex flex-shrink-0 flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <p className="eyebrow mb-1">Monitoramento</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy leading-tight">Mapa de Espécies</h1>
            <p className="hidden sm:block text-sm text-siapesq-muted mt-1">Visualização geográfica das espécies monitoradas</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap overflow-visible pb-1 sm:pb-0">
            {/* Modo do mapa */}
            <div className="flex flex-shrink-0 items-center bg-white border border-siapesq-border rounded-full p-1 gap-1 shadow-card">
              <button
                onClick={() => setMapMode('markers')}
                className={`min-h-9 px-3 sm:px-4 rounded-full text-xs font-bold transition-all ${
                  mapMode === 'markers' ? 'bg-navy text-white' : 'text-siapesq-muted hover:text-navy'
                }`}
              >
                Marcadores
              </button>
              <button
                onClick={() => setMapMode('heatmap')}
                className={`min-h-9 px-3 sm:px-4 rounded-full text-xs font-bold transition-all ${
                  mapMode === 'heatmap' ? 'bg-navy text-white' : 'text-siapesq-muted hover:text-navy'
                }`}
              >
                Mapa de Calor
              </button>
            </div>

            {/* Satélite NASA GIBS */}
            <div className="relative flex-shrink-0 overflow-visible">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setShowSatMenu((v) => !v)
                }}
                className={`flex min-h-10 flex-shrink-0 items-center gap-2 px-3 sm:px-4 rounded-full text-xs font-bold border transition-all shadow-card focus:outline-none focus:ring-2 focus:ring-teal/30 ${
                  satelliteLayer !== 'none'
                    ? 'bg-teal text-white border-teal'
                    : 'bg-white text-siapesq-muted border-siapesq-border hover:border-navy hover:text-navy'
                }`}
              >
                <Layers size={13} />
                <span className="hidden sm:inline">{satelliteLayer !== 'none' ? GIBS_LAYERS[satelliteLayer].label : 'Satélite NASA'}</span>
                <span className="sm:hidden">NASA</span>
              </button>

              {showSatMenu && (
                <div
                  className="absolute right-0 top-full mt-2 z-[3000] bg-white border border-siapesq-border rounded-xl shadow-card-hover py-1 min-w-[260px]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-siapesq-muted uppercase tracking-wide">
                    Camadas de satélite
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSatelliteLayer('none'); setShowSatMenu(false) }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                      satelliteLayer === 'none' ? 'text-navy bg-siapesq-surface/60' : 'text-siapesq-muted hover:text-navy hover:bg-siapesq-surface/40'
                    }`}
                  >
                    Sem sobreposição
                  </button>
                  <div className="h-px bg-siapesq-border my-1" />
                  {(Object.entries(GIBS_LAYERS) as [Exclude<SatelliteLayerKey, 'none'>, GibsLayerDef][]).map(([key, info]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setSatelliteLayer(key); setShowSatMenu(false) }}
                      className={`w-full text-left px-4 py-2.5 transition-colors ${
                        satelliteLayer === key ? 'bg-teal/10' : 'hover:bg-siapesq-surface/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold ${satelliteLayer === key ? 'text-teal' : 'text-siapesq-dark'}`}>
                          {info.label}
                        </p>
                        <span className="text-[9px] text-siapesq-muted bg-siapesq-surface px-1.5 py-0.5 rounded-full border border-siapesq-border">
                          {info.coverage}
                        </span>
                      </div>
                      <p className="text-[10px] text-siapesq-muted mt-0.5">{info.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtro de categoria — linha separada no mobile */}
        {mapMode === 'markers' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={`min-h-10 px-3 sm:px-4 rounded-full text-xs font-bold border transition-all whitespace-nowrap flex-shrink-0 ${
                  activeCategory === value
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-siapesq-muted border-siapesq-border hover:border-navy hover:text-navy'
                }`}
              >
                {label}
                {value !== 'All' && (
                  <span className="ml-1 opacity-60">
                    ({allSpecies.filter((s) => s.category === value).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div
        className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-siapesq-border bg-white shadow-card"
        onClick={() => showSatMenu && setShowSatMenu(false)}
      >
        {loading ? (
          <PageSpinner />
        ) : (
          <MapContainer
            center={[-14.235, -51.925]}
            zoom={4}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            {/* Base OSM — hidden when true-color satellite replaces it */}
            {satelliteLayer !== 'truecolor' && (
              <TileLayer attribution={BASE_TILE_ATTRIBUTION} url={BASE_TILE_URL} />
            )}

            {/* NASA GIBS overlay */}
            {renderSatelliteLayer()}
            <MapResizeFix />
            <MapCreateEvents onPick={(lat, lng) => setCreatePoint({ lat, lng })} />

            {mapMode === 'markers' && (
              <>
                <FitBounds species={filtered} />
                {filtered
                  .filter((s) => s.latitude !== 0 || s.longitude !== 0)
                  .map((s) => (
                    <Marker key={s.id} position={[s.latitude, s.longitude]} icon={createIcon(s.category)}>
                      <Popup>
                        <div className="text-sm min-w-[180px]">
                          <p className="font-bold text-navy text-base mb-0.5">{s.commonName}</p>
                          <p className="text-gray-500 italic text-xs mb-2">{s.scientificName}</p>
                          <div className="flex flex-col gap-1 text-xs text-gray-600">
                            <span><strong>Categoria:</strong> {categoryLabels[s.category]}</span>
                            {s.location && <span><strong>Local:</strong> {s.location}</span>}
                            {s.status && <span><strong>Status:</strong> {s.status}</span>}
                          </div>
                          <Link to={`/species/${s.id}`} className="mt-2 inline-block text-xs text-teal font-semibold hover:underline">
                            Ver detalhes →
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </>
            )}

            {mapMode === 'heatmap' && <HeatmapLayer species={allSpecies} />}
          </MapContainer>
        )}

        {/* Legenda — marcadores */}
        {!loading && mapMode === 'markers' && (
          <div className="hidden">
            <p className="text-xs font-bold text-navy mb-2">Legenda</p>
            <div className="grid grid-cols-2 sm:flex sm:flex-col gap-x-3 gap-y-1.5">
              {Object.entries(markerColors).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs text-siapesq-dark">{categoryLabels[cat as SpeciesCategory]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legenda — heatmap */}
        {!loading && mapMode === 'heatmap' && (
          <div className="hidden">
            <p className="text-xs font-bold text-navy mb-2">Densidade</p>
            <div className="w-32 h-3 rounded-full" style={{ background: HEATMAP_LEGEND }} />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-siapesq-muted">Baixa</span>
              <span className="text-[10px] text-siapesq-muted">Alta</span>
            </div>
          </div>
        )}

        {/* Legenda — satélite */}
        {!loading && activeSat && (
          <div className="hidden">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-navy">{activeSat.label}</p>
              <span className="text-[9px] text-siapesq-muted bg-siapesq-surface px-1.5 py-0.5 rounded-full border border-siapesq-border">
                {activeSat.coverage}
              </span>
            </div>
            <p className="text-[10px] text-siapesq-muted mb-2 leading-tight">{activeSat.description}</p>
            {activeSat.legendGradient && (
              <>
                <div className="w-full h-3 rounded-full" style={{ background: activeSat.legendGradient }} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-siapesq-muted">{activeSat.legendLeft}</span>
                  <span className="text-[10px] text-siapesq-muted">{activeSat.legendRight}</span>
                </div>
              </>
            )}
            <p className="text-[9px] text-siapesq-muted/60 mt-2">
              {activeSat.source ?? 'NASA GIBS'}{activeSat.protocol === 'tile' ? '' : ` · ${activeSat.protocol === 'wms' ? wmsDate : wmtsDate}`}
            </p>
          </div>
        )}

        {!loading && (
          <MapInfoPanel
            mode={mapMode}
            activeSat={activeSat}
            date={activeSat?.protocol === 'tile' ? '' : activeSat?.protocol === 'wms' ? wmsDate : wmtsDate}
          />
        )}

        {!loading && createPoint && (
          <div
            className="absolute left-3 right-3 top-3 z-[1200] sm:left-auto sm:right-4 sm:top-4 sm:w-[320px] rounded-2xl border border-siapesq-border bg-white/95 p-4 shadow-card-hover backdrop-blur"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
                  <MapPin size={19} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-navy">Adicionar especie aqui?</p>
                  <p className="mt-1 text-xs font-mono text-siapesq-muted">
                    {createPoint.lat.toFixed(6)}, {createPoint.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreatePoint(null)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-siapesq-muted hover:bg-siapesq-surface hover:text-navy"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreatePoint(null)}
                className="min-h-10 rounded-full px-4 text-sm font-bold text-siapesq-muted hover:bg-siapesq-surface hover:text-navy"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => navigate(`/species/new?lat=${createPoint.lat.toFixed(6)}&lng=${createPoint.lng.toFixed(6)}`)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-navy px-4 text-sm font-bold text-white shadow-sm hover:bg-navy-mid"
              >
                <PlusCircle size={15} />
                Adicionar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
