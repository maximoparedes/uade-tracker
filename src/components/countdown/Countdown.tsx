import { Clock } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { daysUntil, formatDate, isToday } from '../../utils/dates'
import { COLORS } from '../../utils/colors'

export function Countdown() {
  const { nextEvento } = useAppContext()
  if (!nextEvento) return null

  const { materia, evaluacion } = nextEvento
  const days = evaluacion.fecha ? daysUntil(evaluacion.fecha) : null
  const today = evaluacion.fecha ? isToday(evaluacion.fecha) : false
  const colors = COLORS[materia.color]

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 relative overflow-hidden`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <Clock size={16} className={`${colors.text} mb-1`} />
          <p className="text-xs font-display text-slate-400 uppercase tracking-wider">Próxima fecha</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-display font-semibold ${colors.text}`}>{materia.nombre}</p>
          <p className="text-sm text-slate-300">{evaluacion.nombre}</p>
          {evaluacion.fecha && (
            <p className="font-mono text-xs text-slate-400 mt-0.5">{formatDate(evaluacion.fecha)}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          {today ? (
            <span className="font-display font-bold text-amber-400 text-2xl">¡HOY!</span>
          ) : days !== null ? (
            <>
              <span className={`font-mono font-bold text-3xl ${days <= 7 ? 'text-amber-400' : days <= 14 ? 'text-yellow-400' : colors.text}`}>
                {days}
              </span>
              <span className="font-mono text-xs text-slate-400 block">días</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
