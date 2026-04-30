import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { Layers } from 'lucide-react'
import L from 'leaflet'
import 'leaflet.heat'
import { speciesService } from '../services/speciesService'
import type { Species, SpeciesCategory } from '../types/species'
import { categoryLabels } from '../utils/categoryColors'
import { PageSpinner } from '../components/ui/Spinner'

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
      .map((s) => [s.latitude, s.longitude, s.abundance ?? 1] as [number, number, number])
    if (points.length === 0) return
    const maxVal = Math.max(...points.map((p) => p[2]!))
    const heat = (L as any).heatLayer(points, {
      radius: 50,
      blur: 35,
      maxZoom: 12,
      minOpacity: 0.6,
      max: maxVal * 0.3,
      gradient: {
        0.0: '#000080',
        0.2: '#0000FF',
        0.35: '#00FFFF',
        0.5: '#00FF00',
        0.65: '#FFFF00',
        0.8: '#FF8000',
        1.0: '#FF0000',
      },
    })
    heat.addTo(map)
    return () => { map.removeLayer(heat) }
  }, [map, species])
  return null
}

// ─── NASA GIBS ────────────────────────────────────────────────────────────────

type SatelliteLayerKey = 'none' | 'truecolor' | 'sst' | 'chlorophyll' | 'ndvi' | 'landtemp'

interface GibsLayerDef {
  label: string
  description: string
  coverage: string
  protocol: 'wmts' | 'wms'
  layer: string
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
    description: 'Imagem de satélite MODIS/Terra',
    coverage: 'Global',
    protocol: 'wmts',
    layer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    ext: 'jpg',
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
    description: 'Concentração de clorofila-a (MODIS/Aqua)',
    coverage: 'Oceano',
    protocol: 'wms',
    layer: 'MODIS_Aqua_Chlorophyll_A',
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
  const [allSpecies, setAllSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [mapMode, setMapMode] = useState<MapMode>('markers')
  const [satelliteLayer, setSatelliteLayer] = useState<SatelliteLayerKey>('none')
  const [showSatMenu, setShowSatMenu] = useState(false)

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
    <div className="w-full flex flex-col gap-4" style={{ height: 'calc(100vh - 3.5rem - 2.5rem)' }}>
      {/* Header */}
      <div className="flex items-start justify-between flex-shrink-0 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-navy">Mapa de Espécies</h1>
          <p className="text-sm text-siapesq-muted mt-0.5">Visualização geográfica das espécies monitoradas</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Modo do mapa */}
          <div className="flex items-center bg-white border border-siapesq-border rounded-xl p-1 gap-1">
            <button
              onClick={() => setMapMode('markers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mapMode === 'markers' ? 'bg-navy text-white' : 'text-siapesq-muted hover:text-navy'
              }`}
            >
              Marcadores
            </button>
            <button
              onClick={() => setMapMode('heatmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mapMode === 'heatmap' ? 'bg-navy text-white' : 'text-siapesq-muted hover:text-navy'
              }`}
            >
              Mapa de Calor
            </button>
          </div>

          {/* Satélite NASA GIBS */}
          <div className="relative">
            <button
              onClick={() => setShowSatMenu((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                satelliteLayer !== 'none'
                  ? 'bg-teal text-white border-teal'
                  : 'bg-white text-siapesq-muted border-siapesq-border hover:border-navy hover:text-navy'
              }`}
            >
              <Layers size={13} />
              {satelliteLayer !== 'none' ? GIBS_LAYERS[satelliteLayer].label : 'Satélite NASA'}
            </button>

            {showSatMenu && (
              <div className="absolute right-0 top-full mt-1 z-[2000] bg-white border border-siapesq-border rounded-xl shadow-card-hover py-1 min-w-[220px]">
                <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-siapesq-muted uppercase tracking-wide">
                  NASA GIBS · Dados de satélite
                </p>
                <button
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

          {/* Filtro de categoria (só no modo marcadores) */}
          {mapMode === 'markers' && categoryFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
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
      </div>

      {/* Mapa */}
      <div
        className="flex-1 bg-white rounded-xl shadow-card border border-siapesq-border overflow-hidden relative min-h-0"
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
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {/* NASA GIBS overlay */}
            {renderSatelliteLayer()}

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
          <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-xl shadow-card border border-siapesq-border px-4 py-3">
            <p className="text-xs font-bold text-navy mb-2">Legenda</p>
            <div className="flex flex-col gap-1.5">
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
          <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-xl shadow-card border border-siapesq-border px-4 py-3">
            <p className="text-xs font-bold text-navy mb-2">Densidade</p>
            <div className="w-32 h-3 rounded-full" style={{ background: 'linear-gradient(to right, #000080, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF8000, #FF0000)' }} />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-siapesq-muted">Baixa</span>
              <span className="text-[10px] text-siapesq-muted">Alta</span>
            </div>
          </div>
        )}

        {/* Legenda — satélite */}
        {!loading && activeSat && (
          <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-xl shadow-card border border-siapesq-border px-4 py-3 max-w-[200px]">
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
              NASA GIBS · {activeSat.protocol === 'wms' ? wmsDate : wmtsDate}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
