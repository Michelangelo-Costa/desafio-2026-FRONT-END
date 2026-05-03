import type { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <main className={`flex-1 overflow-y-auto overflow-x-hidden bg-siapesq-surface px-3 py-4 sm:p-5 lg:p-6 scroll-smooth ${className}`}>
      {children}
    </main>
  )
}
