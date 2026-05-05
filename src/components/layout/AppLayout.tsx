import { useState } from 'react'
import { Header } from './Header'
import { PageWrapper } from './PageWrapper'
import { ProtectedRoute } from './ProtectedRoute'
import { Sidebar } from './Sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex w-full h-screen overflow-hidden">
        <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header onMenuToggle={() => setMobileMenuOpen((v) => !v)} />
          <PageWrapper>{children}</PageWrapper>
        </div>
      </div>
    </ProtectedRoute>
  )
}
