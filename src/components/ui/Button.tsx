import { type ReactNode, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'outline'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-cyan-400 text-navy-950 hover:bg-cyan-300 font-semibold',
  ghost: 'text-slate-400 hover:text-white hover:bg-navy-700',
  danger: 'text-red-400 hover:text-white hover:bg-red-400/20',
  outline: 'border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Button({ variant = 'ghost', size = 'md', children, className = '', ...props }: ButtonProps) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-md transition-colors font-display ${sizes[size]} ${VARIANTS[variant]} disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
