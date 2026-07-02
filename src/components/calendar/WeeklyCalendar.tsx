import { useState } from 'react'
import { Zap } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { COLORS } from '../../utils/colors'
import type { Materia, Horario, DiaSemana } from '../../types'
import { Modal } from '../ui/Modal'
import { MateriaDetail } from '../materia/MateriaDetail'

const DAYS: DiaSemana[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab']
const DAY_LABELS: Record<DiaSemana, string> = {
  lun: 'LUN', mar: 'MAR', mie: 'MIÉ', jue: 'JUE', vie: 'VIE', sab: 'SÁB',
}
const START_HOUR = 7
const END_HOUR = 23
const HOUR_H = 64

function tp(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h - START_HOUR) * HOUR_H + (m / 60) * HOUR_H
}

function dp(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60 * HOUR_H
}

function ClassBlock({ materia, horario, onClick }: { materia: Materia; horario: Horario; onClick: () => void }) {
  const c = COLORS[materia.color]
  const top = tp(horario.inicio)
  const height = dp(horario.inicio, horario.fin)

  return (
    <div
      className={`absolute inset-x-0.5 rounded-md border-l-2 ${c.blockBorder} ${c.blockBg} px-1.5 cursor-pointer hover:brightness-125 transition-all overflow-hidden`}
      style={{ top, height }}
      onClick={onClick}
    >
      <p className={`font-display text-[10px] font-semibold ${c.text} leading-tight mt-0.5 truncate`}>
        {materia.nombre}
      </p>
      <p className="font-mono text-[9px] text-slate-400 leading-tight">
        {horario.inicio}–{horario.fin}
      </p>
      {materia.tipo === 'virtual' && (
        <span className="font-mono text-[8px] text-slate-500">online</span>
      )}
    </div>
  )
}

export function WeeklyCalendar() {
  const { activeMaterias } = useAppContext()
  const [selected, setSelected] = useState<Materia | null>(null)

  const intensiva = activeMaterias.find(m => m.tipo === 'intensiva' && m.periodoIntensivo)
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  const clasesPerDay: Record<DiaSemana, Array<{ materia: Materia; horario: Horario }>> = {
    lun: [], mar: [], mie: [], jue: [], vie: [], sab: [],
  }
  for (const mat of activeMaterias) {
    if (mat.tipo === 'intensiva') continue
    for (const h of mat.horarios) {
      clasesPerDay[h.dia].push({ materia: mat, horario: h })
    }
  }

  return (
    <>
      {intensiva?.periodoIntensivo && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-400/10 border border-amber-400/20 px-3 py-2">
          <Zap size={14} className="text-amber-400" />
          <span className="font-display text-sm text-amber-400 font-medium">Semana Intensiva</span>
          <span className="font-mono text-xs text-slate-400">
            {intensiva.nombre} · {intensiva.periodoIntensivo.desde} → {intensiva.periodoIntensivo.hasta} · {intensiva.periodoIntensivo.inicio}–{intensiva.periodoIntensivo.fin} · {intensiva.aula}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="flex mb-0.5 ml-10">
            {DAYS.map(d => (
              <div key={d} className="flex-1 text-center font-mono text-[10px] text-slate-500 py-1 uppercase">
                {DAY_LABELS[d]}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex">
            {/* Hour labels */}
            <div className="w-10 shrink-0">
              {hours.map(h => (
                <div key={h} style={{ height: HOUR_H }} className="flex items-start justify-end pr-2">
                  <span className="font-mono text-[9px] text-slate-600 mt-px">{String(h).padStart(2, '0')}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map(day => (
              <div
                key={day}
                className="flex-1 border-l border-navy-700 relative"
                style={{ height: (END_HOUR - START_HOUR) * HOUR_H }}
              >
                {/* Hour lines */}
                {hours.map(h => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-navy-800"
                    style={{ top: (h - START_HOUR) * HOUR_H }}
                  />
                ))}
                {/* Classes */}
                {clasesPerDay[day].map(({ materia, horario }) => (
                  <ClassBlock
                    key={`${materia.id}-${horario.dia}`}
                    materia={materia}
                    horario={horario}
                    onClick={() => setSelected(materia)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.nombre ?? ''}
        size="lg"
      >
        {selected && <MateriaDetail materiaId={selected.id} />}
      </Modal>
    </>
  )
}
