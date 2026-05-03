import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { speciesService } from '../services/speciesService'
import type { Species } from '../types/species'

const DRAFT_KEY = 'siapesq_species_create_draft'

const schema = z.object({
  commonName: z.string().min(2, 'O nome comum deve ter pelo menos 2 caracteres'),
  scientificName: z.string().min(3, 'O nome científico deve ter pelo menos 3 caracteres'),
  category: z.enum(['Bird', 'Fish', 'Plant', 'Mammal', 'Reptile', 'Other'], {
    required_error: 'Selecione uma categoria',
  }),
  otherCategory: z.string().optional(),
  latitude: z.coerce
    .number({ invalid_type_error: 'Deve ser um número' })
    .min(-90, 'O valor deve estar entre -90 e 90 graus.')
    .max(90, 'O valor deve estar entre -90 e 90 graus.'),
  longitude: z.coerce
    .number({ invalid_type_error: 'Deve ser um número' })
    .min(-180, 'O valor deve estar entre -180 e 180 graus.')
    .max(180, 'O valor deve estar entre -180 e 180 graus.'),
  location: z.string().min(2, 'A localização é obrigatória'),
  observationDate: z.string().min(1, 'A data de observação é obrigatória'),
  notes: z.string().optional(),
  abundance: z.coerce.number().min(1).max(10).default(1),
  status: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.enum(['Active', 'Inactive', 'Endangered', 'Extinct']).optional()
  ),
}).superRefine((data, ctx) => {
  if (data.category === 'Other' && !data.otherCategory?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['otherCategory'],
      message: 'Informe qual categoria deseja usar',
    })
  }
})

export type SpeciesFormInput = z.input<typeof schema>
export type SpeciesFormData = z.output<typeof schema>

function getDefaultValues(editSpecies?: Species): Partial<SpeciesFormInput> {
  if (editSpecies) {
    return {
      commonName: editSpecies.commonName,
      scientificName: editSpecies.scientificName,
      category: editSpecies.category,
      otherCategory: extractOtherCategory(editSpecies.notes),
      latitude: editSpecies.latitude,
      longitude: editSpecies.longitude,
      location: editSpecies.location,
      observationDate: editSpecies.observationDate?.slice(0, 10) ?? '',
      notes: editSpecies.notes ?? '',
      abundance: editSpecies.abundance ?? 1,
      status: editSpecies.status,
    }
  }

  try {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) return sanitizeDefaultValues(JSON.parse(draft) as Partial<SpeciesFormInput>)
  } catch {
    localStorage.removeItem(DRAFT_KEY)
  }

  return {
    commonName: '',
    scientificName: '',
    location: '',
    observationDate: '',
    notes: '',
    abundance: 1,
  }
}

function sanitizeDefaultValues(values: Partial<SpeciesFormInput>) {
  const next = { ...values }
  const lat = Number(next.latitude)
  const lng = Number(next.longitude)

  if (Number.isFinite(lat) && Number.isFinite(lng) && lat === 0 && lng === 0) {
    delete next.latitude
    delete next.longitude
  }

  return next
}

function toApiPayload(data: SpeciesFormData): Omit<Species, 'id' | 'uniqueIdentifier'> {
  const payload: Omit<Species, 'id' | 'uniqueIdentifier'> = {
    commonName: data.commonName.trim(),
    scientificName: data.scientificName.trim(),
    category: data.category,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    location: data.location.trim(),
    observationDate: new Date(`${data.observationDate}T00:00:00`).toISOString(),
    abundance: Number(data.abundance ?? 1),
  }

  const notes = stripOtherCategory(data.notes)
  const otherCategory = data.category === 'Other' ? data.otherCategory?.trim() : ''
  const noteParts = [
    otherCategory ? `Categoria personalizada: ${otherCategory}` : '',
    notes,
  ].filter(Boolean)
  if (noteParts.length > 0) payload.notes = noteParts.join('\n\n')
  if (data.status) payload.status = data.status

  return payload
}

export function extractOtherCategory(notes?: string) {
  return notes?.match(/^Categoria personalizada:\s*(.+)$/m)?.[1]?.trim() ?? ''
}

export function stripOtherCategory(notes?: string) {
  return notes
    ?.replace(/^Categoria personalizada:\s*.+\r?\n?/m, '')
    .trim()
}

export function useSpeciesForm(onSuccess?: () => void, editSpecies?: Species) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm<SpeciesFormInput, unknown, SpeciesFormData>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(editSpecies),
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = toApiPayload(data)
      if (editSpecies) {
        await speciesService.update(editSpecies.id, payload)
      } else {
        await speciesService.create(payload)
        localStorage.removeItem(DRAFT_KEY)
      }
      setSubmitSuccess(true)
      if (!editSpecies) {
        form.reset()
        localStorage.removeItem(DRAFT_KEY)
      }
      onSuccess?.()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Falha ao salvar a espécie')
    } finally {
      setSubmitting(false)
    }
  })

  useEffect(() => {
    if (editSpecies) return

    const subscription = form.watch((value) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(value))
    })

    return () => subscription.unsubscribe()
  }, [editSpecies, form])

  return { form, onSubmit, submitting, submitError, submitSuccess }
}
