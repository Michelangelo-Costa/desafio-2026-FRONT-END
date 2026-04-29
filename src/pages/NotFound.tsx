import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Home } from 'lucide-react'

export function NotFound() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center bg-siapesq-surface">
      <p className="text-8xl font-bold text-navy/10 mb-4 select-none">404</p>
      <h1 className="text-2xl font-bold text-navy mb-2">Página não encontrada</h1>
      <p className="text-sm text-siapesq-muted mb-8">A página que você está procurando não existe.</p>
      <Link to="/">
        <Button>
          <Home size={15} />
          Voltar ao Painel
        </Button>
      </Link>
    </div>
  )
}
