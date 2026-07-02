import { useAppContext } from '../context/AppContext'
import { SemesterTimeline } from '../components/timeline/SemesterTimeline'
import { COLORS } from '../utils/colors'
import { formatDate, isPast } from '../utils/dates'

export function TimelinePage() {
  const { activeEvaluaciones, activeMaterias, conflicts } = useAppContext()

  const conflictDates = new Set(conflicts.map(c => c.fecha))

  const events = activeEvaluaciones
    .filter(e => e.fecha)
    .sort((a, b) => a.fecha!.localeCompare(b.fecha!))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-white text-xl tracking-tight">Línea de tiempo</h1>
        <p className="font-mono text-xs text-slate-500 mt-0.5">Agosto → Diciembre 2026</p>
      </div>

      <div className="rounded-xl border border-navy-700 bg-navy-900/80 p-5">
        <SemesterTimeline />
      </div>

      {/* Chronological list */}
      <div className="rounded-xl border border-navy-700 bg-navy-900/80 p-4">
        <p className="font-display text-xs text-slate-400 uppercase tracking-wider mb-3">Todas las fechas</p>
        <div className="space-y-1">
          {events.map(ev => {
            const mat = activeMaterias.find(m => m.id === ev.materiaId)
            if (!mat) return null
            const c = COLORS[mat.color]
            const past = isPast(ev.fecha!)
            const isConflict = conflictDates.has(ev.fecha!)
            const isImportant = ev.tipo === 'final' || ev.tipo === 'trabajo_final'

            return (
              <div
                key={ev.id}
                className={`flex items-center gap-3 py-1.5 px-2 rounded-lg ${past ? 'opacity-40' : ''} ${isConflict ? 'bg-amber-400/5' : ''}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isConflict ? 'bg-amber-400' : past ? 'bg-slate-600' : c.dot}`} />
                <span className="font-mono text-xs text-slate-400 w-24 shrink-0">{formatDate(ev.fecha!)}</span>
                <div className="flex-1 min-w-0">
                  <span className={`font-display text-sm ${past ? 'text-slate-500' : 'text-slate-200'} ${isImportant ? 'font-semibold' : ''}`}>
                    {mat.nombre}
                  </span>
                  <span className={`ml-2 font-mono text-xs ${c.text}`}>{ev.nombre}</span>
                </div>
                {isConflict && (
                  <span className="font-mono text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">⚡ conflicto</span>
                )}
              </div>
            )
          })}
        </div>

        {events.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            No hay fechas cargadas todavía. Editá las evaluaciones en la vista de Materias.
          </p>
        )}
      </div>
    </div>
  )
}
