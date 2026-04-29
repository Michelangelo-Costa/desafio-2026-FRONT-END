import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, PawPrint, PlusCircle, Map, Settings, User } from 'lucide-react'

function SidebarLink({
  to,
  label,
  icon: Icon,
  exact,
  isActive,
}: {
  to: string
  label: string
  icon: React.ElementType
  exact?: boolean
  isActive?: boolean
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

export function Sidebar() {
  const location = useLocation()
  const path = location.pathname

  const especiesAtivo = path.startsWith('/species') && path !== '/species/new'
  const adicionarAtivo = path === '/species/new'

  return (
    <aside className="w-[218px] min-h-screen bg-navy flex flex-col flex-shrink-0">
      <div className="px-6 py-5 border-b border-white/10">
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
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <SidebarLink to="/" label="Painel" icon={LayoutDashboard} exact />

        <NavLink
          to="/species"
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
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            adicionarAtivo
              ? 'bg-teal/20 text-white border-l-2 border-teal pl-[14px]'
              : 'text-white/60 hover:text-white hover:bg-white/8'
          }`}
        >
          <PlusCircle size={18} className={adicionarAtivo ? 'text-teal' : ''} />
          Adicionar Espécie
        </NavLink>

        <SidebarLink to="/map" label="Mapa" icon={Map} />
        <SidebarLink to="/settings" label="Configurações" icon={Settings} />
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <SidebarLink to="/profile" label="Perfil" icon={User} />
      </div>
    </aside>
  )
}
