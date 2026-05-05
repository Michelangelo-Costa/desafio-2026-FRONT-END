import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle, Lock, Mail, User } from 'lucide-react'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authService'

const inputClass = 'w-full rounded-xl border border-siapesq-border py-2.5 pl-9 pr-4 text-sm placeholder:text-siapesq-muted transition-all focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20'

export function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas nao conferem')
      return
    }

    setLoading(true)
    try {
      await authService.register({ name, email, password })
      setSuccess(true)
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-1 text-2xl font-bold text-navy">Criar cadastro</h1>
      <p className="mb-8 text-sm text-siapesq-muted">Comece a registrar e analisar observacoes de campo.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field icon={<User size={15} />} label="Nome">
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" required className={inputClass} />
        </Field>

        <Field icon={<Mail size={15} />} label="E-mail">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@instituicao.org" required className={inputClass} />
        </Field>

        <Field icon={<Lock size={15} />} label="Senha">
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimo de 8 caracteres" required className={inputClass} />
        </Field>

        <Field icon={<Lock size={15} />} label="Confirmar senha">
          <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repita a senha" required className={inputClass} />
        </Field>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600 animate-[fadeIn_0.2s_ease-out]">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-600 animate-[fadeIn_0.2s_ease-out]">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>Conta criada com sucesso! Redirecionando...</span>
          </div>
        )}

        <Button type="submit" loading={loading} disabled={success} className="mt-2 w-full justify-center" size="lg">
          Criar conta <ArrowRight size={16} />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-siapesq-muted">
        Ja tem cadastro?{' '}
        <Link to="/login" className="font-bold text-teal hover:text-teal-light">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-siapesq-dark">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-siapesq-muted">{icon}</span>
        {children}
      </div>
    </div>
  )
}
