import { useAppContext } from '../../context/AppContext'
import { COLORS } from '../../utils/colors'
import { formatDateShort, dateToPercent, isPast } from '../../utils/dates'
import type { Materia, Evaluacion } from '../../types'

interface EventMarkerProps {
  evaluacion: Evaluacion
  materia: Materia
  percent: number
  isConflict: boolean
  index: number
  total: number
}

function EventMarker({ evaluacion, materia, percent, isConflict, index, total }: EventMarkerProps) {
  const c = COLORS[materia.color]
  const past = evaluacion.fecha ? isPast(evaluacion.fecha) : false
  const offset = total > 1 ? (index - (total - 1) / 2) * 18 : 0

  const isImportant = evaluacion.tipo === 'final' || evaluacion.tipo === 'trabajo_final'

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${percent}%`, transform: `translateX(-50%) translateX(${offset}px)`, top: 0 }}
    >
      {/* Top label (alternating) */}
      {index % 2 === 0 && (
        <div className="mb-1 text-center" style={{ minWidth: 48 }}>
          <p className={`font-display text-[9px] leading-tight truncate max-w-[64px] ${past ? 'text-slate-600' : c.text}`}>
            {materia.nombre.split(' ')[0]}
          </p>
          <p className="font-mono text-[8px] text-slate-500">
            {evaluacion.fecha ? formatDateShort(evaluacion.fecha) : '—'}
          </p>
        </div>
      )}

      {/* Marker dot */}
      <div className={`relative flex items-center justify-center ${isImportant ? 'w-4 h-4' : 'w-2.5 h-2.5'} my-0.5`}>
        {isConflict && (
          <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
        )}
        <div className={`rounded-full ${isImportant ? 'w-4 h-4' : 'w-2.5 h-2.5'} ${
          isConflict
            ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
            : past
            ? 'bg-slate-700'
            : `${c.dot} ${isImportant ? 'shadow-[0_0_6px_currentColor]' : ''}`
        }`} />
      </div>

      {/* Bottom label (alternating) */}
      {index % 2 === 1 && (
        <div className="mt-1 text-center" style={{ minWidth: 48 }}>
          <p className={`font-display text-[9px] leading-tight truncate max-w-[64px] ${past ? 'text-slate-600' : c.text}`}>
            {materia.nombre.split(' ')[0]}
          </p>
          <p className="font-mono text-[8px] text-slate-500">
            {evaluacion.fecha ? formatDateShort(evaluacion.fecha) : '—'}
          </p>
        </div>
      )}
    </div>
  )
}

export function SemesterTimeline() {
  const { activeCuatrimestre, activeEvaluaciones, activeMaterias, conflicts } = useAppContext()

  if (!activeCuatrimestre) return null

  const start = activeCuatrimestre.fechaInicio
  const end = activeCuatrimestre.fechaFin

  const withDates = activeEvaluaciones.filter(e => e.fecha)
  const conflictDates = new Set(conflicts.map(c => c.fecha))

  // Group by date for stacking
  const byDate = new Map<string, Evaluacion[]>()
  for (const ev of withDates) {
    if (!byDate.has(ev.fecha!)) byDate.set(ev.fecha!, [])
    byDate.get(ev.fecha!)!.push(ev)
  }

  // Month ticks
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  const months: Array<{ label: string; percent: number }> = []
  const cur = new Date(startDate)
  cur.setDate(1)
  while (cur <= endDate) {
    const pct = ((cur.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100
    months.push({
      label: cur.toLocaleString('es-AR', { month: 'short' }).toUpperCase(),
      percent: Math.max(0, Math.min(100, pct)),
    })
    cur.setMonth(cur.getMonth() + 1)
  }

  // Intensiva period
  const intensiva = activeMaterias.find(m => m.tipo === 'intensiva' && m.periodoIntensivo)
  const intStart = intensiva?.periodoIntensivo ? dateToPercent(intensiva.periodoIntensivo.desde, start, end) : null
  const intEnd = intensiva?.periodoIntensivo ? dateToPercent(intensiva.periodoIntensivo.hasta, start, end) : null
  const intColors = intensiva ? COLORS[intensiva.color] : null

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[700px] relative">
        {/* Month labels */}
        <div className="relative h-6 mb-2">
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute text-[10px] font-mono text-slate-500 uppercase"
              style={{ left: `${m.percent}%`, transform: 'translateX(-50%)' }}
            >
              {m.label}
            </div>
          ))}
        </div>

        {/* Track area */}
        <div className="relative" style={{ height: 120 }}>
          {/* Intensiva bar */}
          {intStart !== null && intEnd !== null && intColors && (
            <div
              className={`absolute top-[55px] h-2 rounded-full ${intColors.dot} opacity-40`}
              style={{ left: `${intStart}%`, width: `${intEnd - intStart}%` }}
            />
          )}

          {/* Center track line */}
          <div className="absolute inset-x-0 top-[58px] h-px bg-navy-700" />

          {/* Month ticks */}
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute w-px bg-navy-700"
              style={{ left: `${m.percent}%`, top: 50, height: 16 }}
            />
          ))}

          {/* Today marker */}
          {(() => {
            const todayPct = dateToPercent(
              new Date().toISOString().slice(0, 10),
              start, end
            )
            if (todayPct < 0 || todayPct > 100) return null
            return (
              <div
                className="absolute w-px bg-cyan-400/50"
                style={{ left: `${todayPct}%`, top: 40, height: 36 }}
              >
                <div className="absolute -top-4 -translate-x-1/2 font-mono text-[8px] text-cyan-400 whitespace-nowrap">HOY</div>
              </div>
            )
          })()}

          {/* Event markers */}
          {Array.from(byDate.entries()).map(([date, evs]) => {
            const pct = dateToPercent(date, start, end)
            const isConflict = conflictDates.has(date)
            return evs.map((ev, idx) => {
              const mat = activeMaterias.find(m => m.id === ev.materiaId)
              if (!mat) return null
              return (
                <EventMarker
                  key={ev.id}
                  evaluacion={ev}
                  materia={mat}
                  percent={pct}
                  isConflict={isConflict}
                  index={idx}
                  total={evs.length}
                />
              )
            })
          })}
        </div>

        {/* Conflict legend */}
        {conflicts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {conflicts.map(c => (
              <div key={c.fecha} className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-400/10 border border-amber-400/20">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-mono text-[10px] text-amber-400">{formatDateShort(c.fecha)}</span>
                <span className="font-mono text-[10px] text-slate-400">{c.items.length} eventos</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
