import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle, Lock } from 'lucide-react'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authService'

export function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Link de recuperacao invalido ou expirado')
      return
    }

    if (password.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas nao conferem')
      return
    }

    setLoading(true)
    try {
      const result = await authService.resetPassword(token, password)
      setSuccess(result.message || 'Senha atualizada com sucesso. Redirecionando para o login...')
      setTimeout(() => navigate('/login'), 1400)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-1 text-2xl font-bold text-navy">Nova senha</h1>
      <p className="mb-8 text-sm text-siapesq-muted">Crie uma nova senha para voltar a acessar o Arca.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordField label="Nova senha" value={password} onChange={setPassword} />
        <PasswordField label="Confirmar nova senha" value={confirmPassword} onChange={setConfirmPassword} />

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
          Atualizar senha <ArrowRight size={16} />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-siapesq-muted">
        Lembrou a senha?{' '}
        <Link to="/login" className="font-bold text-teal hover:text-teal-light">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-siapesq-dark">{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-siapesq-muted" />
        <input
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Minimo de 8 caracteres"
          required
          className="w-full rounded-xl border border-siapesq-border py-2.5 pl-9 pr-4 text-sm placeholder:text-siapesq-muted transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
        />
      </div>
    </div>
  )
}
