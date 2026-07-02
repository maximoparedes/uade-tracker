import { Plus } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { COLORS } from '../../utils/colors'
import { EvaluacionRow } from '../evaluacion/EvaluacionRow'
import { Textarea, FormField, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import type { EstadoMateria } from '../../types'

const ESTADO_OPTIONS: { value: EstadoMateria; label: string }[] = [
  { value: 'cursando', label: 'Cursando' },
  { value: 'rindiendo', label: 'Rindiendo Final' },
  { value: 'promocionada', label: 'Promocionada' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'desaprobada', label: 'Desaprobada' },
]

const TIPO_LABELS = { virtual: 'Virtual', presencial: 'Presencial', intensiva: 'Intensiva' }
const REGIMEN_LABELS = { examen_final: 'Examen Final', trabajo_final: 'Trabajo Final', promocion: 'Promoción' }

interface Props { materiaId: string }

export function MateriaDetail({ materiaId }: Props) {
  const { activeMaterias, activeEvaluaciones, conflicts, getMateriaState, updateMateriaState, addEvaluacion } = useAppContext()
  const materia = activeMaterias.find(m => m.id === materiaId)!
  const state = getMateriaState(materiaId)
  const evaluaciones = activeEvaluaciones
    .filter(e => e.materiaId === materiaId)
    .sort((a, b) => {
      const order = ['parcial_1', 'parcial_2', 'recuperatorio_1', 'recuperatorio_2', 'final', 'trabajo_final']
      return order.indexOf(a.tipo) - order.indexOf(b.tipo)
    })

  const conflictDates = new Set(conflicts.flatMap(c => c.items.map(i => i.evaluacion.fecha ?? '')))
  const c = COLORS[materia.color]

  function addRecuperatorio() {
    const hasR1 = evaluaciones.some(e => e.tipo === 'recuperatorio_1')
    addEvaluacion({
      materiaId,
      tipo: hasR1 ? 'recuperatorio_2' : 'recuperatorio_1',
      nombre: hasR1 ? 'Recuperatorio 2' : 'Recuperatorio 1',
      estado: 'pendiente_fecha',
    })
  }

  return (
    <div className="space-y-5">
      {/* Meta */}
      <div className={`rounded-lg border ${c.border} ${c.bg} p-3`}>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="slate">{TIPO_LABELS[materia.tipo]}</Badge>
          <Badge variant={materia.regimen === 'promocion' ? 'purple' : 'cyan'}>{REGIMEN_LABELS[materia.regimen]}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs font-mono text-slate-400">
          <span>Curso: <span className="text-slate-200">{materia.curso}</span></span>
          {materia.aula && <span>Aula: <span className="text-slate-200">{materia.aula}</span></span>}
          {materia.horarios.map((h, i) => (
            <span key={i} className="col-span-2">
              {h.dia.toUpperCase()} · <span className="text-slate-200">{h.inicio}–{h.fin}</span>
            </span>
          ))}
          {materia.periodoIntensivo && (
            <span className="col-span-2">
              Intensiva · <span className="text-slate-200">{materia.periodoIntensivo.desde} → {materia.periodoIntensivo.hasta}</span>
            </span>
          )}
        </div>
      </div>

      {/* Estado */}
      <FormField label="Estado de la materia">
        <Select
          value={state.estado}
          onChange={e => updateMateriaState(materiaId, { estado: e.target.value as EstadoMateria })}
        >
          {ESTADO_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </FormField>

      {/* Evaluaciones */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-display text-slate-400 uppercase tracking-wider">Evaluaciones</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={addRecuperatorio}>
              <Plus size={12} /> Recuperatorio
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-navy-700 divide-y divide-navy-800">
          {evaluaciones.map(ev => (
            <EvaluacionRow
              key={ev.id}
              evaluacion={ev}
              isConflict={ev.fecha ? conflictDates.has(ev.fecha) : false}
            />
          ))}
          {!evaluaciones.length && (
            <p className="text-sm text-slate-500 text-center py-4">Sin evaluaciones</p>
          )}
        </div>
        {materia.regimen !== 'promocion' && (
          <p className="text-[10px] font-mono text-slate-600 mt-1.5">
            Hacé clic en cada evaluación para agregar fecha, nota y estado
          </p>
        )}
      </div>

      {/* Notas */}
      <FormField label="Mis notas">
        <Textarea
          value={state.notas}
          onChange={e => updateMateriaState(materiaId, { notas: e.target.value })}
          rows={4}
          placeholder="Apuntes, recordatorios, temas a estudiar..."
        />
      </FormField>
    </div>
  )
}
