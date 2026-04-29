import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authService'

const funcionalidades = [
  'Monitoramento de espécies em tempo real',
  'Visualização geográfica interativa',
  'Análise e estatísticas por categoria',
]

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Painel esquerdo */}
      <div className="md:w-1/2 w-full bg-navy flex flex-col items-center justify-center px-8 md:px-16 py-12 flex-shrink-0">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-siapesq-green flex items-center justify-center flex-shrink-0">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M17 8C8 10 5.9 16.17 3.82 21c5-3 8.5-3.5 13-5 1.5-4-1.5-8-1-12z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-tight">SIAPESQ</p>
              <p className="text-white/50 text-xs">Sistema de Gestão de Espécies</p>
            </div>
          </div>

          <ul className="flex flex-col gap-5">
            {funcionalidades.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border border-teal flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={14} className="text-teal" />
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Painel direito */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-8 md:px-16 py-12 relative overflow-y-auto">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-navy mb-1">Bem-vindo de volta</h1>
          <p className="text-sm text-siapesq-muted mb-8">Faça login para acessar o sistema</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-siapesq-dark">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-siapesq-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@instituicao.org"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-siapesq-border text-sm placeholder:text-siapesq-muted focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-siapesq-dark">Senha</label>
                <a href="#" className="text-xs text-teal hover:text-teal-light transition-colors">
                  Esqueceu sua senha?
                </a>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-siapesq-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-siapesq-border text-sm placeholder:text-siapesq-muted focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center mt-2" size="lg">
              Entrar <ArrowRight size={16} />
            </Button>
          </form>
        </div>

        <p className="absolute bottom-6 text-xs text-siapesq-muted">© 2026 SIAPESQ</p>
      </div>
    </div>
  )
}
