import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'
import { useSpeciesForm } from '../hooks/useSpeciesForm'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { categoryLabels } from '../utils/categoryColors'
import type { SpeciesCategory } from '../types/species'

const CATEGORIES: SpeciesCategory[] = ['Bird', 'Fish', 'Plant', 'Mammal', 'Reptile', 'Other']

export function SpeciesCreate() {
  const navigate = useNavigate()
  const { form, onSubmit, submitting, submitError, submitSuccess } = useSpeciesForm(() => {
    setTimeout(() => navigate('/species'), 1500)
  })

  const { register, watch, formState: { errors, touchedFields } } = form
  const abundance = watch('abundance') ?? 1

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-20 h-20 rounded-full bg-siapesq-green/10 flex items-center justify-center mb-5">
          <CheckCircle size={40} className="text-siapesq-green" />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-2">Espécie salva com sucesso!</h2>
        <p className="text-sm text-siapesq-muted">Redirecionando para a lista de espécies...</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-siapesq-border/60 text-siapesq-muted hover:text-navy transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-navy">Adicionar Nova Espécie</h1>
      </div>

      {/* Card do formulário */}
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-card border border-siapesq-border p-8">
        {/* Linha 1: Nome Comum + Nome Científico */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Input
            label="Nome Comum"
            placeholder="ex: Onça-Pintada"
            error={errors.commonName?.message}
            {...register('commonName')}
          />
          <Input
            label="Nome Científico"
            placeholder="ex: Panthera onca"
            error={errors.scientificName?.message}
            valid={!errors.scientificName && !!touchedFields.scientificName}
            {...register('scientificName')}
          />
        </div>

        {/* Linha 2: Categoria + Data */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-siapesq-dark">Categoria</label>
            <select
              {...register('category')}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-siapesq-dark bg-white focus:outline-none focus:ring-2 focus:border-teal focus:ring-teal/20 transition-all appearance-none cursor-pointer ${
                errors.category ? 'border-red-500' : 'border-siapesq-border'
              }`}
            >
              <option value="">Selecionar categoria...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{categoryLabels[c]}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-600">{errors.category.message}</p>
            )}
          </div>
          <Input
            label="Data de Observação"
            type="date"
            error={errors.observationDate?.message}
            {...register('observationDate')}
          />
        </div>

        {/* Linha 3: Latitude + Longitude + Localização */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Input
            label="Latitude"
            placeholder="ex: -15.7801"
            error={errors.latitude?.message}
            {...register('latitude')}
          />
          <Input
            label="Longitude"
            placeholder="ex: -47.9292"
            error={errors.longitude?.message}
            {...register('longitude')}
          />
          <Input
            label="Localização"
            placeholder="ex: Bacia Amazônica"
            error={errors.location?.message}
            {...register('location')}
          />
        </div>

        {/* Abundância */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-siapesq-dark">
              Abundância na Região
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-siapesq-muted">Intensidade no mapa de calor:</span>
              <span className="text-sm font-bold text-navy w-16 text-right">
                {abundance <= 2 ? `${abundance} — Raro` : abundance <= 4 ? `${abundance} — Baixa` : abundance <= 6 ? `${abundance} — Moderada` : abundance <= 8 ? `${abundance} — Alta` : `${abundance} — Muito Alta`}
              </span>
            </div>
          </div>
          <div className="relative">
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
            <div className="flex justify-between mt-1">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <span key={n} className={`text-[10px] ${n === Number(abundance) ? 'text-teal font-bold' : 'text-siapesq-muted'}`}>{n}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Notas de Campo */}
        <div className="mb-8">
          <label className="text-sm font-medium text-siapesq-dark block mb-1">
            Notas de Campo e Descrição
          </label>
          <textarea
            {...register('notes')}
            rows={5}
            placeholder="Descreva o habitat, comportamento observado, marcações distintas..."
            className="w-full rounded-xl border border-siapesq-border px-4 py-3 text-sm text-siapesq-dark placeholder:text-siapesq-muted focus:outline-none focus:ring-2 focus:border-teal focus:ring-teal/20 resize-none transition-all"
          />
        </div>

        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
            {submitError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-siapesq-border">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            <Save size={15} />
            Salvar Espécie
          </Button>
        </div>
      </form>
    </div>
  )
}
