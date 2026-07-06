import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { COLORS } from '../../utils/colors'
import { formatDate } from '../../utils/dates'
import type { Materia, Evaluacion } from '../../types'

const DAY_HEADERS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const TIPO_LABEL: Record<string, string> = {
  parcial_1: 'Parcial 1', parcial_2: 'Parcial 2',
  recuperatorio: 'Recuperatorio', final_adelantado: 'F. Adelantado',
  final: 'Final', trabajo_final: 'T. Final',
}

function buildGrid(year: number, month: number): Array<number | null> {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7
  const grid: Array<number | null> = Array(startPad).fill(null)
  for (let d = 1; d <= lastDay.getDate(); d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

function ds(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

interface DayEvent { evaluacion: Evaluacion; materia: Materia }

export function MonthlyCalendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const { activeEvaluaciones, activeMaterias, conflicts } = useAppContext()

  const conflictDates = new Set(conflicts.map(c => c.fecha))

  const eventsByDate = new Map<string, DayEvent[]>()
  for (const ev of activeEvaluaciones) {
    if (!ev.fecha) continue
    if (!eventsByDate.has(ev.fecha)) eventsByDate.set(ev.fecha, [])
    const mat = activeMaterias.find(m => m.id === ev.materiaId)
    if (mat) eventsByDate.get(ev.fecha)!.push({ evaluacion: ev, materia: mat })
  }

  const todayStr = ds(today.getFullYear(), today.getMonth(), today.getDate())
  const grid = buildGrid(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
    setSelected(null)
  }

  const selectedEvents = selected ? (eventsByDate.get(selected) ?? []) : []

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-navy-700 transition-colors">
          <ChevronLeft size={17} />
        </button>
        <span className="font-display font-semibold text-white tracking-tight">
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={nextMonth} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-navy-700 transition-colors">
          <ChevronRight size={17} />
        </button>
      </div>

      {/* Day header row */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center font-mono text-[10px] text-slate-500 py-1 uppercase">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-navy-800 rounded-lg overflow-hidden border border-navy-700">
        {grid.map((day, i) => {
          if (!day) return <div key={i} className="bg-navy-900/60 h-14 sm:h-16" />

          const dateStr = ds(year, month, day)
          const events = eventsByDate.get(dateStr) ?? []
          const isToday = dateStr === todayStr
          const isConflict = conflictDates.has(dateStr)
          const isSelected = dateStr === selected
          const hasParcial = events.some(e => e.evaluacion.tipo === 'parcial_1' || e.evaluacion.tipo === 'parcial_2')
          const hasFinal = events.some(e => e.evaluacion.tipo === 'final' || e.evaluacion.tipo === 'trabajo_final')

          return (
            <div
              key={i}
              onClick={() => events.length && setSelected(isSelected ? null : dateStr)}
              className={`relative bg-navy-900 h-14 sm:h-16 p-1.5 flex flex-col transition-colors ${
                events.length ? 'cursor-pointer hover:bg-navy-800' : ''
              } ${isSelected ? 'bg-navy-700/80' : ''} ${isConflict ? 'bg-amber-400/5' : ''}`}
            >
              {/* Day number */}
              <span className={`font-mono text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full ${
                isToday
                  ? 'bg-cyan-400 text-navy-950 font-bold'
                  : 'text-slate-300'
              }`}>
                {day}
              </span>

              {/* Event dots */}
              {events.length > 0 && (
                <div className="flex flex-wrap gap-px mt-1">
                  {events.slice(0, 4).map(({ materia, evaluacion }, idx) => (
                    <div
                      key={idx}
                      className={`rounded-full flex-shrink-0 ${
                        isConflict ? 'bg-amber-400' : COLORS[materia.color].dot
                      } ${hasFinal && !hasParcial ? 'w-2 h-2' : 'w-1.5 h-1.5'}`}
                      title={`${materia.nombre} — ${evaluacion.nombre}`}
                    />
                  ))}
                  {events.length > 4 && (
                    <span className="font-mono text-[7px] text-slate-500 leading-none">+{events.length - 4}</span>
                  )}
                </div>
              )}

              {/* Conflict corner */}
              {isConflict && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-transparent border-r-amber-400" />
              )}
            </div>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selected && selectedEvents.length > 0 && (
        <div className="mt-3 rounded-lg border border-navy-700 bg-navy-800/80 p-3 fade-in">
          <p className="font-mono text-xs text-slate-400 mb-2">{formatDate(selected)}</p>
          <div className="space-y-1.5">
            {selectedEvents.map(({ evaluacion, materia }) => {
              const c = COLORS[materia.color]
              const isConflict = conflictDates.has(selected)
              return (
                <div key={evaluacion.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isConflict ? 'bg-amber-400' : c.dot}`} />
                  <span className={`font-display text-sm ${c.text} font-medium`}>{materia.nombre}</span>
                  <span className="font-mono text-xs text-slate-400 ml-auto">
                    {TIPO_LABEL[evaluacion.tipo] ?? evaluacion.nombre}
                  </span>
                  {evaluacion.nota !== undefined && (
                    <span className="font-mono text-xs text-white font-bold">{evaluacion.nota}</span>
                  )}
                </div>
              )
            })}
          </div>
          {conflictDates.has(selected) && (
            <p className="mt-2 text-xs font-display text-amber-400 font-medium">
              ⚡ Múltiples evaluaciones este día — verificar con la facultad
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" /> Virtual
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" /> Presencial
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Conflicto
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Final/Entrega
        </span>
      </div>
    </div>
  )
}
