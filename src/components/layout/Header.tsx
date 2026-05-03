import { useState, useRef, useEffect } from 'react'
import { Search, LogOut, Moon, Sun, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useTheme } from '../../contexts/ThemeContext'

interface HeaderProps {
  onMenuToggle: () => void
}

function decodeToken(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function WaveHamburger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-xl hover:bg-siapesq-surface dark:hover:bg-slate-700 transition-colors group"
      aria-label="Abrir menu"
    >
      <svg width="24" height="18" viewBox="0 0 24 18" className="text-navy dark:text-slate-200">
        <path
          d="M0,3 C4,1 8,5 12,3 C16,1 20,5 24,3"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className="group-hover:animate-wave-line"
        />
        <path
          d="M0,9 C4,7 8,11 12,9 C16,7 20,11 24,9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className="group-hover:animate-wave-line-delay"
        />
        <path
          d="M0,15 C4,13 8,17 12,15 C16,13 20,17 24,15"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className="group-hover:animate-wave-line"
        />
      </svg>
    </button>
  )
}

const pageNames: Record<string, string> = {
  '/': 'Painel',
  '/species': 'Espécies',
  '/species/new': 'Nova Espécie',
  '/map': 'Mapa',
  '/settings': 'Configurações',
  '/profile': 'Perfil',
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const token = authService.getToken()
  const payload = token ? decodeToken(token) : null
  const displayName = localStorage.getItem('siapesq_display_name') ?? payload?.name ?? 'Usuário'
  const avatar = localStorage.getItem('siapesq_avatar')
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const currentPage = pageNames[location.pathname] ?? (location.pathname.startsWith('/species/') ? 'Detalhes' : '')

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    authService.logout()
    navigate('/login')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/species?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="relative z-[3000] h-16 bg-white/95 dark:bg-slate-800 border-b border-siapesq-border dark:border-slate-700 flex items-center px-4 sm:px-6 gap-3 sm:gap-6 flex-shrink-0 transition-colors backdrop-blur">
      <WaveHamburger onClick={onMenuToggle} />

      {currentPage && (
        <span className="text-base font-extrabold text-navy dark:text-slate-200 truncate">
          {currentPage}
        </span>
      )}

      <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-siapesq-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar espécie..."
            className="pl-9 pr-4 py-1.5 rounded-full border border-siapesq-border text-sm text-siapesq-dark placeholder:text-siapesq-muted focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 bg-siapesq-surface w-48 transition-all focus:w-64 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
          />
        </form>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          className="h-10 w-10 rounded-full hover:bg-siapesq-surface text-siapesq-muted hover:text-navy transition-colors dark:hover:bg-slate-700 dark:hover:text-slate-200 flex items-center justify-center"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-10 h-10 rounded-full bg-navy-mid flex items-center justify-center text-white text-sm font-bold select-none hover:opacity-80 transition-opacity overflow-hidden shadow-sm"
          >
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-[3100] w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-siapesq-border dark:border-slate-700 py-1">
              <button
                onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-siapesq-dark dark:text-slate-200 hover:bg-siapesq-surface dark:hover:bg-slate-700 transition-colors"
              >
                <User size={14} />
                Meu Perfil
              </button>
              <div className="h-px bg-siapesq-border dark:bg-slate-700 mx-2 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
