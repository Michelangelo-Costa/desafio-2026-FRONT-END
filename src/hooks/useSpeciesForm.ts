import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { speciesService } from '../services/speciesService'

const schema = z.object({
  commonName: z.string().min(2, 'O nome comum deve ter pelo menos 2 caracteres'),
  scientificName: z.string().min(3, 'O nome científico deve ter pelo menos 3 caracteres'),
  category: z.enum(['Bird', 'Fish', 'Plant', 'Mammal', 'Reptile', 'Other'], {
    required_error: 'Selecione uma categoria',
  }),
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
})

export type SpeciesFormData = z.infer<typeof schema>

export function useSpeciesForm(onSuccess?: () => void) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm<SpeciesFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      commonName: '',
      scientificName: '',
      location: '',
      observationDate: '',
      notes: '',
      abundance: 1,
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await speciesService.create(data)
      setSubmitSuccess(true)
      form.reset()
      onSuccess?.()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Falha ao salvar a espécie')
    } finally {
      setSubmitting(false)
    }
  })

  return { form, onSubmit, submitting, submitError, submitSuccess }
}
