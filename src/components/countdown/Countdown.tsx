import { Clock, BookOpen } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { daysUntil, formatDate, isToday, todayStr } from '../../utils/dates'
import { COLORS } from '../../utils/colors'
import type { TipoEvaluacion } from '../../types'

interface CountdownProps {
  label?: string
  tipos?: TipoEvaluacion[]
}

export function Countdown({ label = 'Próxima fecha crítica', tipos }: CountdownProps) {
  const { activeEvaluaciones, activeMaterias } = useAppContext()

  const today = todayStr()
  const next = activeEvaluaciones
    .filter(e => {
      if (!e.fecha || e.fecha < today) return false
      if (e.estado === 'aprobado' || e.estado === 'promocionado') return false
      if (tipos && !tipos.includes(e.tipo)) return false
      return true
    })
    .sort((a, b) => a.fecha!.localeCompare(b.fecha!))[0]

  if (!next) return null

  const materia = activeMaterias.find(m => m.id === next.materiaId)
  if (!materia) return null

  const days = daysUntil(next.fecha!)
  const hoy = isToday(next.fecha!)
  const colors = COLORS[materia.color]
  const isParcial = next.tipo === 'parcial_1' || next.tipo === 'parcial_2'

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          {isParcial
            ? <BookOpen size={16} className={`${colors.text} mb-1`} />
            : <Clock size={16} className={`${colors.text} mb-1`} />
          }
          <p className="text-xs font-display text-slate-400 uppercase tracking-wider leading-tight">{label}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-display font-semibold ${colors.text}`}>{materia.nombre}</p>
          <p className="text-sm text-slate-300">{next.nombre}</p>
          {next.fecha && (
            <p className="font-mono text-xs text-slate-400 mt-0.5">{formatDate(next.fecha)}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          {hoy ? (
            <span className="font-display font-bold text-amber-400 text-2xl">¡HOY!</span>
          ) : (
            <>
              <span className={`font-mono font-bold text-3xl ${days <= 7 ? 'text-amber-400' : days <= 14 ? 'text-yellow-400' : colors.text}`}>
                {days}
              </span>
              <span className="font-mono text-xs text-slate-400 block">días</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
