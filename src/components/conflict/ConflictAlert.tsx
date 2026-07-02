import { AlertTriangle, Zap } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { formatDateFull } from '../../utils/dates'

export function ConflictAlert() {
  const { conflicts } = useAppContext()
  if (!conflicts.length) return null

  const triple = conflicts.find(c => c.items.length >= 3)
  const others = conflicts.filter(c => c !== triple)

  return (
    <div className="space-y-3 mb-5">
      {triple && (
        <div className="conflict-pulse rounded-xl border-2 border-amber-400 bg-amber-400/5 p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-amber-400" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-amber-400 shrink-0" fill="currentColor" />
              <span className="font-display font-bold text-amber-400 text-sm uppercase tracking-widest">
                Conflicto crítico
              </span>
              <span className="font-mono text-xs text-amber-400/70 ml-auto">
                {formatDateFull(triple.fecha)}
              </span>
            </div>
            <p className="font-display text-white font-semibold text-base mb-2">
              {triple.items.length} exámenes el mismo día — necesitás resolver esto con la facultad
            </p>
            <ul className="space-y-1.5">
              {triple.items.map(({ materia, evaluacion }) => (
                <li key={evaluacion.id} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-white font-display">{materia.nombre}</span>
                  <span className="text-amber-400/60 font-mono text-xs ml-auto">{evaluacion.nombre}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {others.map(conflict => (
        <div
          key={conflict.fecha}
          className="rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 flex items-start gap-3"
        >
          <AlertTriangle size={15} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <span className="font-mono text-xs text-amber-400">{formatDateFull(conflict.fecha)}</span>
            <p className="text-sm text-slate-200 mt-0.5">
              {conflict.items.map(i => i.materia.nombre).join(' · ')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
