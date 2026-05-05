import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle, Mail, Send } from 'lucide-react'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authService'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await authService.forgotPassword(email)
      setSuccess(result.message || 'Se o email existir, enviaremos um link de recuperacao em alguns minutos.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperacao')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-teal hover:text-teal-light">
        <ArrowLeft size={15} />
        Voltar ao login
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-navy">Recuperar senha</h1>
      <p className="mb-8 text-sm text-siapesq-muted">Informe seu email para receber um link seguro de redefinicao.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-siapesq-dark">E-mail</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-siapesq-muted" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@instituicao.org"
              required
              className="w-full rounded-xl border border-siapesq-border py-2.5 pl-9 pr-4 text-sm placeholder:text-siapesq-muted transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600 animate-[fadeIn_0.2s_ease-out]">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-600 animate-[fadeIn_0.2s_ease-out]">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <Button type="submit" loading={loading} className="mt-2 w-full justify-center" size="lg">
          Enviar link <Send size={16} />
        </Button>
      </form>
    </AuthLayout>
  )
}
