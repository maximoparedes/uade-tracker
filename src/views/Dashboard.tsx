import { useAppContext } from '../context/AppContext'
import { ConflictAlert } from '../components/conflict/ConflictAlert'
import { Countdown } from '../components/countdown/Countdown'
import { ParcialCarousel } from '../components/materia/ParcialCarousel'
import { COLORS } from '../utils/colors'
import type { EstadoMateria } from '../types'

const ESTADO_COLOR: Record<EstadoMateria, string> = {
  cursando: 'bg-cyan-400', rindiendo: 'bg-amber-400',
  promocionada: 'bg-purple-400', aprobada: 'bg-green-400', desaprobada: 'bg-red-400',
}

const ESTADO_LABEL: Record<EstadoMateria, string> = {
  cursando: 'Cursando', rindiendo: 'Rindiendo', promocionada: 'Promocionada',
  aprobada: 'Aprobada', desaprobada: 'Desaprobada',
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
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-white text-2xl tracking-tight">
          {activeCuatrimestre?.nombre ?? 'Cuatrimestre'}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Ingeniería en Informática · UADE</p>
      </div>

      {/* Conflicts — always first */}
      <ConflictAlert />

      {/* Countdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Countdown label="Próxima fecha" />
        <Countdown label="Próximo parcial" tipos={['parcial_1', 'parcial_2']} />
      </div>

      {/* Parcial carousel */}
      <ParcialCarousel />

      {/* Progress */}
      <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-sm text-slate-300">Progreso del cuatrimestre</span>
          <span className="font-display text-sm text-white font-semibold">{aprobadas}/{activeMaterias.length}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {activeMaterias.map(mat => {
            const s = getMateriaState(mat.id)
            const c = COLORS[mat.color]
            return (
              <div key={mat.id} className={`flex items-center gap-2 ${c.bg} rounded-xl px-3 py-2 border ${c.border} border-opacity-20`}>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ESTADO_COLOR[s.estado]}`} />
                <div className="min-w-0">
                  <p className={`font-display text-xs font-medium ${c.text} truncate leading-tight`}>
                    {mat.nombre.split(' ').slice(0, 2).join(' ')}
                  </p>
                  <p className="text-[10px] text-slate-500">{ESTADO_LABEL[s.estado]}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending dates */}
      {materiasPendingDate.size > 0 && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
          <p className="font-display text-sm text-amber-400 font-medium mb-2">
            {materiasPendingDate.size} {materiasPendingDate.size === 1 ? 'materia sin' : 'materias sin'} fechas de parcial
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeMaterias
              .filter(m => materiasPendingDate.has(m.id))
              .map(mat => (
                <span key={mat.id} className="text-xs text-slate-300 font-display bg-white/5 px-2.5 py-1 rounded-full">
                  {mat.nombre.split(' ').slice(0, 2).join(' ')}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Finals list */}
      <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
        <p className="font-display text-xs text-slate-400 mb-3">Finales y entregas</p>
        <div className="space-y-2">
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
                  <span className={`font-display text-xs text-slate-400 w-20 shrink-0`}>{ev.fecha}</span>
                  <span className="font-display text-sm text-slate-200 flex-1 truncate">{mat.nombre}</span>
                  <span className={`text-xs font-display ${c.text}`}>{ev.nombre}</span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
