import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

const variants = {
  primary: 'bg-navy text-white hover:bg-navy-mid shadow-sm',
  outline: 'border border-navy text-navy bg-white hover:bg-navy hover:text-white',
  ghost: 'text-siapesq-muted hover:text-navy-mid bg-transparent',
}

const sizes = {
  sm: 'px-4 py-2 text-sm min-h-10',
  md: 'px-5 py-3 text-sm min-h-11',
  lg: 'px-7 py-3.5 text-base min-h-12',
}

export function Button({ variant = 'primary', size = 'md', children, loading, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
