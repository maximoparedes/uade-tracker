import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const base = 'w-full bg-navy-800 border border-navy-600 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors font-mono'

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
      <label className="block text-xs font-display text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}
