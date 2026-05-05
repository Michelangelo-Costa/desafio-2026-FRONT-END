import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle, Lock, Mail } from 'lucide-react'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authService'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.login(email, password)
      setSuccess(true)
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-1 text-2xl font-bold text-navy">Bem-vindo de volta</h1>
      <p className="mb-8 text-sm text-siapesq-muted">Faca login para acessar o sistema</p>

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

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-siapesq-dark">Senha</label>
            <Link to="/forgot-password" className="text-xs text-teal transition-colors hover:text-teal-light">
              Esqueceu sua senha?
            </Link>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-siapesq-muted" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo de 8 caracteres"
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
            <span>Login realizado com sucesso! Redirecionando...</span>
          </div>
        )}

        <Button type="submit" loading={loading} disabled={success} className="mt-2 w-full justify-center" size="lg">
          Entrar <ArrowRight size={16} />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-siapesq-muted">
        Ainda nao tem conta?{' '}
        <Link to="/register" className="font-bold text-teal hover:text-teal-light">
          Criar cadastro
        </Link>
      </p>
    </AuthLayout>
  )
}
