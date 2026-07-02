import { type ReactNode } from 'react'

type Variant = 'cyan' | 'amber' | 'green' | 'red' | 'slate' | 'purple'

const VARIANTS: Record<Variant, string> = {
  cyan: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  amber: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  green: 'bg-green-400/10 text-green-400 border-green-400/20',
  red: 'bg-red-400/10 text-red-400 border-red-400/20',
  slate: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
  purple: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
}

interface BadgeProps {
  variant?: Variant
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'slate', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono border ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}
