import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, PawPrint, PlusCircle, Map, Settings, User, X } from 'lucide-react'

function SidebarLink({
  to,
  label,
  icon: Icon,
  exact,
  isActive,
  onClick,
}: {
  to: string
  label: string
  icon: React.ElementType
  exact?: boolean
  isActive?: boolean
  onClick?: () => void
}) {
  const activeClass = 'bg-teal/20 text-white border-l-2 border-teal pl-[14px]'
  const inactiveClass = 'text-white/60 hover:text-white hover:bg-white/8'

  if (isActive !== undefined) {
    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive ? activeClass : inactiveClass}`}>
        <Icon size={18} className={isActive ? 'text-teal' : ''} />
        {label}
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive ? activeClass : inactiveClass}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={isActive ? 'text-teal' : ''} />
          {label}
        </>
      )}
    </NavLink>
  )
}

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const path = location.pathname

  const especiesAtivo = path.startsWith('/species') && path !== '/species/new'
  const adicionarAtivo = path === '/species/new'

  const sidebarContent = (
    <>
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal to-siapesq-green flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M17 8C8 10 5.9 16.17 3.82 21c5-3 8.5-3.5 13-5 1.5-4-1.5-8-1-12z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">SIAPESQ</p>
              <p className="text-white/50 text-xs">Gestor de Espécies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <SidebarLink to="/" label="Painel" icon={LayoutDashboard} exact onClick={onClose} />

        <NavLink
          to="/species"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            especiesAtivo
              ? 'bg-teal/20 text-white border-l-2 border-teal pl-[14px]'
              : 'text-white/60 hover:text-white hover:bg-white/8'
          }`}
        >
          <PawPrint size={18} className={especiesAtivo ? 'text-teal' : ''} />
          Espécies
        </NavLink>

        <NavLink
          to="/species/new"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            adicionarAtivo
              ? 'bg-teal/20 text-white border-l-2 border-teal pl-[14px]'
              : 'text-white/60 hover:text-white hover:bg-white/8'
          }`}
        >
          <PlusCircle size={18} className={adicionarAtivo ? 'text-teal' : ''} />
          Adicionar Espécie
        </NavLink>

        <SidebarLink to="/map" label="Mapa" icon={Map} onClick={onClose} />
        <SidebarLink to="/settings" label="Configurações" icon={Settings} onClick={onClose} />
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <SidebarLink to="/profile" label="Perfil" icon={User} onClick={onClose} />
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[218px] min-h-screen bg-navy flex-col flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 9999 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />

        {/* Drawer */}
        <aside
          className={`absolute top-0 left-0 h-full w-[270px] bg-navy flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}

          {/* Wave decoration at bottom */}
          <div className="relative h-16 overflow-hidden flex-shrink-0">
            <svg
              viewBox="0 0 270 64"
              preserveAspectRatio="none"
              className="absolute bottom-0 left-0 w-full h-full"
            >
              <path
                d="M0,32 C30,16 60,48 90,32 C120,16 150,48 180,32 C210,16 240,48 270,32 L270,64 L0,64 Z"
                fill="rgba(0,180,166,0.15)"
                className="animate-wave"
              />
              <path
                d="M0,40 C35,24 65,56 100,40 C135,24 165,56 200,40 C235,24 260,52 270,44 L270,64 L0,64 Z"
                fill="rgba(0,180,166,0.08)"
                className="animate-wave-slow"
              />
            </svg>
          </div>
        </aside>

        {/* Wave edge decoration on right side of drawer */}
        <svg
          className={`absolute top-0 left-[270px] h-full w-6 transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-[294px]'
          }`}
          viewBox="0 0 24 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C8,8 4,16 8,25 C12,34 4,42 8,50 C12,58 4,66 8,75 C12,84 4,92 0,100 L0,0 Z"
            fill="#0D2B5E"
          />
        </svg>
      </div>
    </>
  )
}
