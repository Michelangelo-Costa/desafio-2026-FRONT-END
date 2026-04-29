import type { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <main className={`flex-1 overflow-y-auto overflow-x-hidden bg-siapesq-surface p-6 ${className}`}>
      {children}
    </main>
  )
}
