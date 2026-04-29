import { useState, useRef, useEffect } from 'react'
import { Search, LogOut, Moon, Sun, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useTheme } from '../../contexts/ThemeContext'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

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
    <header className="h-14 bg-white dark:bg-slate-800 border-b border-siapesq-border dark:border-slate-700 flex items-center px-6 gap-6 flex-shrink-0 transition-colors">
      <nav className="flex items-center gap-6 text-sm font-medium text-siapesq-muted">
        <a href="#" className="hover:text-navy transition-colors">MONITORAMENTO</a>
        <a href="#" className="hover:text-navy transition-colors">RELATÓRIOS</a>
        <a href="#" className="hover:text-navy transition-colors">ARQUIVO</a>
      </nav>

      <div className="flex-1 flex justify-end items-center gap-3">
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
          className="p-1.5 rounded-full hover:bg-siapesq-surface text-siapesq-muted hover:text-navy transition-colors dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 rounded-full bg-navy-mid flex items-center justify-center text-white text-xs font-bold select-none hover:opacity-80 transition-opacity"
          >
            U
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-siapesq-border dark:border-slate-700 py-1 z-50">
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
