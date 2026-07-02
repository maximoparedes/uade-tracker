import { useState } from 'react'
import { AlertCircle, Pencil, ChevronRight } from 'lucide-react'
import type { Materia, EstadoMateria } from '../../types'
import { useAppContext } from '../../context/AppContext'
import { COLORS } from '../../utils/colors'
import { formatDateShort, isPast } from '../../utils/dates'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { MateriaDetail } from './MateriaDetail'
import { MateriaForm } from './MateriaForm'

const ESTADO_BADGE: Record<EstadoMateria, 'cyan' | 'amber' | 'green' | 'red' | 'slate' | 'purple'> = {
  cursando: 'cyan',
  rindiendo: 'amber',
  promocionada: 'purple',
  aprobada: 'green',
  desaprobada: 'red',
}

const ESTADO_LABEL: Record<EstadoMateria, string> = {
  cursando: 'Cursando',
  rindiendo: 'Rindiendo',
  promocionada: 'Promocionada',
  aprobada: 'Aprobada',
  desaprobada: 'Desaprobada',
}

const TIPO_ICON: Record<string, string> = {
  virtual: '⬡',
  presencial: '◻',
  intensiva: '◆',
}

interface Props { materia: Materia }

export function MateriaCard({ materia }: Props) {
  const { activeEvaluaciones, getMateriaState, conflicts } = useAppContext()
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const state = getMateriaState(materia.id)
  const evals = activeEvaluaciones.filter(e => e.materiaId === materia.id)
  const pendingDate = evals.filter(e => !e.fecha && e.estado === 'pendiente_fecha')
  const conflictDates = new Set(conflicts.flatMap(c => c.items.filter(i => i.materia.id === materia.id).map(i => i.evaluacion.fecha ?? '')))

  const c = COLORS[materia.color]

  const isFinished = state.estado === 'aprobada' || state.estado === 'promocionada'

  return (
    <>
      <div
        className={`rounded-xl border ${c.border} bg-navy-900/80 overflow-hidden transition-all ${isFinished ? 'opacity-60' : ''}`}
      >
        {/* Top accent strip */}
        <div className={`h-0.5 ${c.dot}`} />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-2 mb-3">
            <span className={`text-xs ${c.text} font-mono mt-0.5`}>{TIPO_ICON[materia.tipo]}</span>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => setShowDetail(true)}
                className="text-left group flex items-center gap-1 w-full"
              >
                <h3 className="font-display font-semibold text-white text-sm leading-tight group-hover:text-cyan-400 transition-colors">
                  {materia.nombre}
                </h3>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
              </button>
              <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                {materia.curso}
                {materia.aula && ` · ${materia.aula}`}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {pendingDate.length > 0 && (
                <span title={`${pendingDate.length} evaluación sin fecha`}>
                  <AlertCircle size={13} className="text-amber-400" />
                </span>
              )}
              <Badge variant={ESTADO_BADGE[state.estado]}>{ESTADO_LABEL[state.estado]}</Badge>
              <button
                onClick={() => setShowEdit(true)}
                className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-navy-700 transition-colors"
              >
                <Pencil size={11} />
              </button>
            </div>
          </div>

          {/* Horarios */}
          {materia.horarios.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {materia.horarios.map((h, i) => (
                <span key={i} className="font-mono text-[10px] text-slate-400 bg-navy-800 px-2 py-0.5 rounded">
                  {h.dia.toUpperCase()} {h.inicio}–{h.fin}
                </span>
              ))}
            </div>
          )}

          {materia.periodoIntensivo && (
            <div className="mb-3">
              <span className="font-mono text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                Intensiva · {materia.periodoIntensivo.desde} → {materia.periodoIntensivo.hasta}
              </span>
            </div>
          )}

          {/* Evaluaciones mini */}
          <div className="space-y-1">
            {evals.map(ev => {
              const isConflict = ev.fecha ? conflictDates.has(ev.fecha) : false
              const past = ev.fecha ? isPast(ev.fecha) : false
              return (
                <div key={ev.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-1 h-1 rounded-full shrink-0 ${
                    ev.estado === 'aprobado' || ev.estado === 'promocionado' ? 'bg-green-400' :
                    ev.estado === 'desaprobado' ? 'bg-red-400' :
                    ev.fecha ? (past ? 'bg-slate-600' : 'bg-cyan-400') :
                    'bg-amber-400'
                  }`} />
                  <span className={`font-display flex-1 ${past && ev.fecha ? 'text-slate-500' : 'text-slate-300'}`}>
                    {ev.nombre}
                  </span>
                  {ev.nota !== undefined && (
                    <span className="font-mono font-bold text-white">{ev.nota}</span>
                  )}
                  {ev.fecha ? (
                    <span className={`font-mono ${isConflict ? 'text-amber-400' : 'text-slate-500'}`}>
                      {isConflict && '⚡ '}{formatDateShort(ev.fecha)}
                    </span>
                  ) : (
                    <span className="font-mono text-amber-400/60">sin fecha</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={materia.nombre} size="lg">
        <MateriaDetail materiaId={materia.id} />
      </Modal>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Editar materia" size="lg">
        <MateriaForm
          cuatrimestreId={materia.cuatrimestreId}
          materia={materia}
          onDone={() => setShowEdit(false)}
        />
      </Modal>
    </>
  )
}
