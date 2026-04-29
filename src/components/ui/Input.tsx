import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  valid?: boolean
}

export function Input({ label, error, icon, valid, className = '', ...props }: InputProps) {
  const borderClass = error
    ? 'border-red-500 focus:ring-red-300'
    : valid
    ? 'border-teal focus:ring-teal/30'
    : 'border-siapesq-border focus:border-teal focus:ring-teal/20'

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`text-sm font-medium ${error ? 'text-red-600' : 'text-siapesq-dark'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-siapesq-muted">
            {icon}
          </span>
        )}
        {valid && !error && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
            </svg>
          </span>
        )}
        {error && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-siapesq-dark placeholder:text-siapesq-muted focus:outline-none focus:ring-2 transition-all ${icon ? 'pl-9' : ''} ${valid || error ? 'pr-10' : ''} ${borderClass} ${className}`}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
