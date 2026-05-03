import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { ArrowLeft, CheckCircle, Crosshair, MapPin, Save, Shield, X } from 'lucide-react'
import { useSpeciesForm } from '../hooks/useSpeciesForm'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { categoryLabels } from '../utils/categoryColors'
import type { SpeciesCategory } from '../types/species'

const BASE_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const BASE_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const BRAZIL_CENTER = { lat: -14.235, lng: -51.925 }

const CATEGORIES: SpeciesCategory[] = ['Bird', 'Fish', 'Plant', 'Mammal', 'Reptile', 'Other']

const STATUS_OPTIONS = [
  { value: '', label: 'Sem status definido' },
  { value: 'Active', label: 'Ativa' },
  { value: 'Inactive', label: 'Inativa' },
  { value: 'Endangered', label: 'Em perigo' },
  { value: 'Extinct', label: 'Extinta' },
] as const

export function SpeciesCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [locating, setLocating] = useState(false)
  const [resolvingLocation, setResolvingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [dismissedCoordinateWarning, setDismissedCoordinateWarning] = useState(false)
  const [lastAutoLocation, setLastAutoLocation] = useState('')
  const { form, onSubmit, submitting, submitError, submitSuccess } = useSpeciesForm(() => {
    setTimeout(() => navigate('/species'), 1500)
  })

  const { register, watch, setValue, getValues, formState: { errors, touchedFields } } = form
  const abundance = watch('abundance') ?? 1
  const selectedCategory = watch('category')
  const latitude = Number(watch('latitude'))
  const longitude = Number(watch('longitude'))
  const hasValidCoordinates = isUsableCoordinate(latitude, longitude)

  const selectedPoint = useMemo(() => {
    if (hasValidCoordinates) return { lat: latitude, lng: longitude }
    return null
  }, [hasValidCoordinates, latitude, longitude])
  const coordinateWarning = getCoordinateWarning(selectedPoint)

  useEffect(() => {
    const lat = Number(searchParams.get('lat'))
    const lng = Number(searchParams.get('lng'))
    if (!isUsableCoordinate(lat, lng)) return

    updateCoordinates(lat, lng)
  }, [searchParams, setValue])

  function updateCoordinates(lat: number, lng: number) {
    setDismissedCoordinateWarning(false)
    setValue('latitude', Number(lat.toFixed(6)), { shouldDirty: true, shouldValidate: true })
    setValue('longitude', Number(lng.toFixed(6)), { shouldDirty: true, shouldValidate: true })
    fillLocationName(lat, lng)
  }

  async function fillLocationName(lat: number, lng: number) {
    const currentLocation = String(getValues('location') ?? '').trim()
    if (currentLocation && currentLocation !== lastAutoLocation) return

    setResolvingLocation(true)
    try {
      const placeName = await reverseGeocode(lat, lng)
      if (!placeName) return

      const latestLocation = String(getValues('location') ?? '').trim()
      if (!latestLocation || latestLocation === lastAutoLocation) {
        setValue('location', placeName, { shouldDirty: true, shouldValidate: true })
        setLastAutoLocation(placeName)
      }
    } finally {
      setResolvingLocation(false)
    }
  }

  function useCurrentLocation() {
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Este navegador nao oferece suporte a localizacao atual.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateCoordinates(position.coords.latitude, position.coords.longitude)
        setLocating(false)
      },
      () => {
        setLocationError('Nao consegui acessar sua localizacao agora. Voce pode marcar o ponto diretamente no mapa abaixo.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-siapesq-green/10 flex items-center justify-center mb-5">
          <CheckCircle size={40} className="text-siapesq-green" />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">Especie salva com sucesso!</h2>
        <p className="text-sm text-siapesq-muted">Redirecionando para a lista de especies...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="h-11 w-11 rounded-full hover:bg-white text-siapesq-muted hover:text-navy transition-colors flex items-center justify-center"
          aria-label="Voltar"
        >
          <ArrowLeft size={21} />
        </button>
        <div>
          <p className="eyebrow mb-1">Registro de campo</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy leading-tight">Adicionar especie</h1>
        </div>
      </div>

      <form onSubmit={onSubmit} className="app-card overflow-hidden">
        <div className="bg-gradient-to-r from-navy via-navy-mid to-teal px-5 py-4 sm:px-7 text-white">
          <p className="text-sm font-bold">Dados cientificos e geograficos</p>
          <p className="text-xs text-white/70 mt-1">Preencha os dados essenciais para alimentar o painel, os mapas e as exportacoes.</p>
        </div>

        <div className="p-4 sm:p-7">
          <SectionTitle title="Identificacao" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-7">
            <Input
              label="Nome comum"
              placeholder="ex: Onca-pintada"
              error={errors.commonName?.message}
              {...register('commonName')}
            />
            <Input
              label="Nome cientifico"
              placeholder="ex: Panthera onca"
              error={errors.scientificName?.message}
              valid={!errors.scientificName && !!touchedFields.scientificName}
              {...register('scientificName')}
            />
          </div>

          <SectionTitle title="Classificacao" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-7">
            <SelectField label="Categoria" error={errors.category?.message}>
              <select {...register('category')} className={selectClass(errors.category?.message)}>
                <option value="">Selecionar categoria...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{categoryLabels[c]}</option>
                ))}
              </select>
            </SelectField>

            <SelectField
              label={(
                <span className="flex items-center gap-1.5">
                  <Shield size={14} className="text-teal" />
                  Status de conservacao
                </span>
              )}
            >
              <select {...register('status')} className={selectClass()}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </SelectField>

            <Input
              label="Data de observacao"
              type="date"
              error={errors.observationDate?.message}
              {...register('observationDate')}
            />
          </div>
          {selectedCategory === 'Other' && (
            <div className="mb-7">
              <Input
                label="Nome da categoria"
                placeholder="ex: Anfibio, Inseto, Fungo..."
                error={errors.otherCategory?.message}
                {...register('otherCategory')}
              />
            </div>
          )}

          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle title="Localizacao" icon={<MapPin size={15} className="text-teal" />} compact />
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 text-sm font-bold text-teal transition-colors hover:bg-teal hover:text-white disabled:opacity-60"
            >
              <Crosshair size={15} />
              {locating ? 'Localizando...' : 'Usar minha localizacao'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-7">
            <Input label="Latitude" placeholder="ex: -15.7801" error={errors.latitude?.message} {...register('latitude')} />
            <Input label="Longitude" placeholder="ex: -47.9292" error={errors.longitude?.message} {...register('longitude')} />
            <Input
              label="Localizacao"
              placeholder={resolvingLocation ? 'Identificando local...' : 'ex: Bacia Amazonica'}
              error={errors.location?.message}
              {...register('location')}
            />
          </div>
          {locationError && (
            <DismissibleWarning onClose={() => setLocationError(null)}>
              {locationError}
            </DismissibleWarning>
          )}
          {coordinateWarning && !dismissedCoordinateWarning && (
            <DismissibleWarning onClose={() => setDismissedCoordinateWarning(true)}>
              {coordinateWarning}
            </DismissibleWarning>
          )}

          <LocationPicker point={selectedPoint} onChange={updateCoordinates} />

          <div className="mb-7 rounded-2xl border border-siapesq-border bg-siapesq-surface/55 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-3">
              <label className="text-sm font-bold text-siapesq-dark">Abundancia na regiao</label>
              <span className="text-sm font-extrabold text-navy">
                {abundance <= 2 ? `${abundance} · Raro` : abundance <= 4 ? `${abundance} · Baixa` : abundance <= 6 ? `${abundance} · Moderada` : abundance <= 8 ? `${abundance} · Alta` : `${abundance} · Muito alta`}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              {...register('abundance')}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #00B4A6 0%, #00B4A6 ${((abundance - 1) / 9) * 100}%, #D6E4F0 ${((abundance - 1) / 9) * 100}%, #D6E4F0 100%)`,
              }}
            />
            <div className="flex justify-between mt-2">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <span key={n} className={`text-[10px] ${n === Number(abundance) ? 'text-teal font-bold' : 'text-siapesq-muted'}`}>{n}</span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="text-sm font-bold text-siapesq-dark block mb-1.5">
              Notas de campo
            </label>
            <textarea
              {...register('notes')}
              rows={5}
              placeholder="Descreva habitat, comportamento observado, marcacoes distintas..."
              className="w-full rounded-xl border border-siapesq-border px-4 py-3 text-base sm:text-sm text-siapesq-dark placeholder:text-siapesq-muted focus:outline-none focus:ring-2 focus:border-teal focus:ring-teal/20 resize-none transition-all"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              {submitError}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-siapesq-border">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              <Save size={15} />
              Salvar especie
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

function SectionTitle({ title, icon, compact = false }: { title: string; icon?: React.ReactNode; compact?: boolean }) {
  return (
    <div className={`${compact ? '' : 'mb-3'} flex flex-1 items-center gap-2`}>
      {icon}
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-navy">{title}</h2>
      <div className="h-px flex-1 bg-siapesq-border" />
    </div>
  )
}

function SelectField({ label, error, children }: { label: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-sm font-semibold ${error ? 'text-red-600' : 'text-siapesq-dark'}`}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function selectClass(error?: string) {
  return `w-full min-h-12 rounded-xl border px-4 py-3 text-base sm:text-sm text-siapesq-dark bg-white focus:outline-none focus:ring-2 focus:border-teal focus:ring-teal/20 transition-all cursor-pointer ${
    error ? 'border-red-500' : 'border-siapesq-border'
  }`
}

function getCoordinateWarning(point: { lat: number; lng: number } | null) {
  if (!point) return null
  if (Math.abs(point.lat) < 1 && Math.abs(point.lng) < 1) {
    return 'A coordenada esta muito perto de 0,0. Confira se o ponto nao foi marcado acidentalmente no oceano.'
  }
  const likelyOutsideBrazil = point.lat < -35 || point.lat > 8 || point.lng < -75 || point.lng > -30
  if (likelyOutsideBrazil) {
    return 'Essa coordenada parece estar fora da area do Brasil. Confira o ponto no mapa antes de salvar.'
  }
  return null
}

function isUsableCoordinate(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)
}

async function reverseGeocode(lat: number, lng: number) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lng),
    zoom: '12',
    addressdetails: '1',
  })

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return ''

    const data = await response.json()
    const address = data?.address ?? {}
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      address.state_district
    const state = address.state
    const country = address.country

    return [city, state, country].filter(Boolean).join(', ') || data?.display_name || ''
  } catch {
    return ''
  }
}

function DismissibleWarning({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
      <p>{children}</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-amber-700 hover:bg-amber-100 hover:text-amber-900"
        aria-label="Fechar aviso"
      >
        <X size={14} />
      </button>
    </div>
  )
}

const pickerIcon = L.divIcon({
  className: '',
  html: `
    <div style="width:30px;height:30px;border-radius:999px;background:#00B4A6;border:3px solid #fff;box-shadow:0 8px 24px rgba(13,43,94,.28);display:flex;align-items:center;justify-content:center;">
      <div style="width:9px;height:9px;border-radius:999px;background:#fff;"></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

function LocationPicker({
  point,
  onChange,
}: {
  point: { lat: number; lng: number } | null
  onChange: (lat: number, lng: number) => void
}) {
  const center: [number, number] = point ? [point.lat, point.lng] : [BRAZIL_CENTER.lat, BRAZIL_CENTER.lng]

  return (
    <div className="mb-7 overflow-hidden rounded-2xl border border-siapesq-border bg-white">
      <div className="flex flex-col gap-1 border-b border-siapesq-border bg-siapesq-surface/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-navy">Selecionar ponto no mapa</p>
          <p className="text-xs text-siapesq-muted">Clique no mapa ou arraste o marcador para ajustar a coordenada.</p>
        </div>
        {point && (
          <p className="text-xs font-mono text-siapesq-muted">
            {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
          </p>
        )}
      </div>
      <div className="h-[280px] sm:h-[340px]">
        <MapContainer center={center} zoom={point ? 12 : 4} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer attribution={BASE_TILE_ATTRIBUTION} url={BASE_TILE_URL} />
          <PickerMapEvents onChange={onChange} />
          <RecenterMap point={point} />
          <MapResizeFix />
          {point && (
            <Marker
              position={[point.lat, point.lng]}
              icon={pickerIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const marker = event.target as L.Marker
                  const next = marker.getLatLng()
                  onChange(next.lat, next.lng)
                },
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}

function PickerMapEvents({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function RecenterMap({ point }: { point: { lat: number; lng: number } | null }) {
  const map = useMap()

  useEffect(() => {
    if (!point) return
    map.setView([point.lat, point.lng], Math.max(map.getZoom(), 12), { animate: true })
  }, [map, point])

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
