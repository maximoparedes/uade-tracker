import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { COLORS } from '../../utils/colors'
import { formatDate, isPast } from '../../utils/dates'
import { Modal } from '../ui/Modal'
import { EvaluacionForm } from '../evaluacion/EvaluacionForm'
import type { Evaluacion, Materia } from '../../types'

interface Item { ev: Evaluacion; mat: Materia }

export function ParcialCarousel() {
  const { activeEvaluaciones, activeMaterias } = useAppContext()
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState<'right' | 'left'>('right')
  const [editing, setEditing] = useState<Item | null>(null)

  const items: Item[] = activeMaterias.flatMap(mat =>
    activeEvaluaciones
      .filter(e => e.materiaId === mat.id && (e.tipo === 'parcial_1' || e.tipo === 'parcial_2'))
      .sort((a, b) => a.tipo.localeCompare(b.tipo))
      .map(ev => ({ ev, mat }))
  )

  if (!items.length) return null

  const current = items[idx]
  const c = COLORS[current.mat.color]
  const hasFecha = !!current.ev.fecha
  const past = hasFecha ? isPast(current.ev.fecha!) : false
  const approved = current.ev.estado === 'aprobado' || current.ev.estado === 'promocionado'

  function go(direction: 'left' | 'right') {
    setDir(direction)
    setIdx(i =>
      direction === 'right'
        ? (i + 1) % items.length
        : (i - 1 + items.length) % items.length
    )
  }

  function jumpTo(i: number) {
    setDir(i > idx ? 'right' : 'left')
    setIdx(i)
  }

  return (
    <>
      <div className="rounded-2xl border border-white/6 bg-white/[0.03] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/5">
          <span className="text-xs text-slate-400 font-display">Parciales</span>
          <span className="text-xs text-slate-500 font-display">{idx + 1} de {items.length}</span>
        </div>

        {/* Main card */}
        <div className="px-4 py-4 flex items-center gap-2">
          <button
            onClick={() => go('left')}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/8 text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            key={idx}
            className={`flex-1 min-w-0 cursor-pointer select-none ${dir === 'right' ? 'slide-right' : 'slide-left'}`}
            onClick={() => setEditing(current)}
          >
            {/* Materia */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
              <span className={`font-display text-xs font-medium ${c.text} truncate`}>
                {current.mat.nombre}
              </span>
            </div>

            {/* Parcial name */}
            <p className="font-display text-white font-semibold text-base leading-tight mb-1">
              {current.ev.nombre}
            </p>

            {/* Date status */}
            {approved ? (
              <p className="text-sm text-green-400 font-display">
                ✓ {current.ev.nota !== undefined ? `Nota: ${current.ev.nota}` : 'Aprobado'}
              </p>
            ) : hasFecha ? (
              <p className={`text-sm font-display ${past ? 'text-slate-500' : 'text-slate-300'}`}>
                {past ? 'Se tomó el ' : ''}{formatDate(current.ev.fecha!)}
                {current.ev.nota !== undefined && (
                  <span className="ml-2 font-semibold text-white">{current.ev.nota}</span>
                )}
              </p>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-400">
                <CalendarPlus size={13} />
                <p className="text-sm font-display">Sin fecha — tocá para cargar</p>
              </div>
            )}
          </div>

          <button
            onClick={() => go('right')}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/8 text-slate-400 hover:text-white transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dot navigation */}
        <div className="pb-3.5 flex justify-center gap-1.5">
          {items.map((item, i) => {
            const dotC = COLORS[item.mat.color]
            const isDone = item.ev.estado === 'aprobado' || item.ev.estado === 'promocionado'
            return (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === idx
                    ? `${dotC.dot} w-5`
                    : isDone
                    ? 'bg-green-400/40 w-1.5'
                    : item.ev.fecha
                    ? 'bg-slate-500 w-1.5'
                    : 'bg-amber-400/40 w-1.5'
                }`}
                title={`${item.mat.nombre} — ${item.ev.nombre}`}
              />
            )
          })}
        </div>
      </div>

      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `${editing.ev.nombre} — ${editing.mat.nombre}` : ''}
        size="md"
      >
        {editing && (
          <EvaluacionForm evaluacion={editing.ev} onDone={() => setEditing(null)} />
        )}
      </Modal>
    </>
  )
}
