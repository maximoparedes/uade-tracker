import { useAppContext } from '../context/AppContext'
import { ConflictAlert } from '../components/conflict/ConflictAlert'
import { Countdown } from '../components/countdown/Countdown'
import { COLORS } from '../utils/colors'
import type { EstadoMateria } from '../types'

const ESTADO_COLOR: Record<EstadoMateria, string> = {
  cursando: 'bg-cyan-400', rindiendo: 'bg-amber-400',
  promocionada: 'bg-purple-400', aprobada: 'bg-green-400', desaprobada: 'bg-red-400',
}

export function Dashboard() {
  const { activeMaterias, activeEvaluaciones, getMateriaState, activeCuatrimestre } = useAppContext()

  const aprobadas = activeMaterias.filter(m => {
    const s = getMateriaState(m.id)
    return s.estado === 'aprobada' || s.estado === 'promocionada'
  }).length

  const progress = activeMaterias.length ? (aprobadas / activeMaterias.length) * 100 : 0

  const pendingDates = activeEvaluaciones.filter(e => e.estado === 'pendiente_fecha')
  const materiasPendingDate = new Set(pendingDates.map(e => e.materiaId))

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-white text-2xl tracking-tight">
          {activeCuatrimestre?.nombre ?? 'Cuatrimestre'}
        </h1>
        <p className="font-mono text-xs text-slate-500 mt-0.5">
          Ingeniería en Informática · UADE
        </p>
      </div>

      {/* CONFLICT ALERT — first thing visible */}
      <ConflictAlert />

      {/* Countdown */}
      <Countdown />

      {/* Progress */}
      <div className="rounded-xl border border-navy-700 bg-navy-900/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-sm text-slate-300">Progreso del cuatrimestre</span>
          <span className="font-mono text-sm text-white font-bold">{aprobadas}/{activeMaterias.length}</span>
        </div>
        <div className="h-2 rounded-full bg-navy-700 overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {activeMaterias.map(mat => {
            const s = getMateriaState(mat.id)
            const c = COLORS[mat.color]
            return (
              <div key={mat.id} className={`flex items-center gap-2 ${c.bg} rounded-lg px-2 py-1.5 border ${c.border}/30`}>
                <div className={`w-1.5 h-1.5 rounded-full ${ESTADO_COLOR[s.estado]}`} />
                <span className={`font-display text-xs ${c.text} truncate`}>{mat.nombre.split(' ').slice(0, 2).join(' ')}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending dates warning */}
      {materiasPendingDate.size > 0 && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
          <p className="font-display text-sm text-amber-400 font-medium mb-2">
            {materiasPendingDate.size} {materiasPendingDate.size === 1 ? 'materia sin' : 'materias sin'} fechas de parcial cargadas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeMaterias
              .filter(m => materiasPendingDate.has(m.id))
              .map(mat => (
                <span key={mat.id} className="font-mono text-xs text-slate-300 bg-navy-800 px-2 py-0.5 rounded">
                  {mat.nombre.split(' ').slice(0, 2).join(' ')}
                </span>
              ))
            }
          </div>
        </div>
      )}

      {/* Quick exam list */}
      <div className="rounded-xl border border-navy-700 bg-navy-900/80 p-4">
        <p className="font-display text-sm text-slate-400 mb-3 uppercase tracking-wider text-xs">Finales y entregas</p>
        <div className="space-y-1.5">
          {activeEvaluaciones
            .filter(e => e.fecha && (e.tipo === 'final' || e.tipo === 'trabajo_final'))
            .sort((a, b) => a.fecha!.localeCompare(b.fecha!))
            .map(ev => {
              const mat = activeMaterias.find(m => m.id === ev.materiaId)
              if (!mat) return null
              const c = COLORS[mat.color]
              return (
                <div key={ev.id} className="flex items-center gap-3">
                  <div className={`w-1 h-4 rounded-full ${c.dot} shrink-0`} />
                  <span className="font-mono text-xs text-slate-400 w-20 shrink-0">{ev.fecha}</span>
                  <span className="font-display text-sm text-slate-200 flex-1 truncate">{mat.nombre}</span>
                  <span className="font-mono text-xs text-slate-500">{ev.nombre}</span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
