import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const base = 'w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/20 transition-colors font-display'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={base} {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${base} resize-none font-display`} {...props} />
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}
export function Select({ children, ...props }: SelectProps) {
  return (
    <select className={`${base} cursor-pointer`} {...props}>
      {children}
    </select>
  )
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-display text-slate-400">{label}</label>
      {children}
    </div>
  )
}
