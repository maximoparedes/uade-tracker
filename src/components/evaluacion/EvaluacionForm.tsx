import { useState } from 'react'
import type { Evaluacion, EstadoEvaluacion, TipoEvaluacion } from '../../types'
import { useAppContext } from '../../context/AppContext'
import { FormField, Input, Select, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { Trash2 } from 'lucide-react'

const ESTADO_LABELS: Record<EstadoEvaluacion, string> = {
  pendiente_fecha: 'Pendiente (sin fecha)',
  programado: 'Programado',
  aprobado: 'Aprobado',
  desaprobado: 'Desaprobado',
  ausente: 'Ausente',
  promocionado: 'Promocionado',
}

const TIPO_LABELS: Record<TipoEvaluacion, string> = {
  parcial_1: 'Parcial 1',
  parcial_2: 'Parcial 2',
  recuperatorio: 'Recuperatorio',
  final_adelantado: 'Final Adelantado',
  final: 'Examen Final',
  trabajo_final: 'Trabajo Final',
}

interface Props {
  evaluacion: Evaluacion
  onDone: () => void
}

export function EvaluacionForm({ evaluacion, onDone }: Props) {
  const { updateEvaluacion, deleteEvaluacion } = useAppContext()
  const [form, setForm] = useState({
    nombre: evaluacion.nombre,
    tipo: evaluacion.tipo,
    fecha: evaluacion.fecha ?? '',
    hora: evaluacion.hora ?? '',
    lugar: evaluacion.lugar ?? '',
    nota: evaluacion.nota !== undefined ? String(evaluacion.nota) : '',
    estado: evaluacion.estado,
    observaciones: evaluacion.observaciones ?? '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nota = form.nota !== '' ? parseFloat(form.nota) : undefined
    const estado: EstadoEvaluacion = form.fecha ? (form.estado === 'pendiente_fecha' ? 'programado' : form.estado) : 'pendiente_fecha'
    updateEvaluacion(evaluacion.id, {
      nombre: form.nombre,
      tipo: form.tipo as TipoEvaluacion,
      fecha: form.fecha || undefined,
      hora: form.hora || undefined,
      lugar: form.lugar || undefined,
      nota: !isNaN(nota!) ? nota : undefined,
      estado,
      observaciones: form.observaciones || undefined,
    })
    onDone()
  }

  function handleDelete() {
    if (!confirm('¿Eliminar esta evaluación?')) return
    deleteEvaluacion(evaluacion.id)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Tipo">
          <Select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            {Object.entries(TIPO_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Nombre">
          <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Fecha">
          <Input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
        </FormField>
        <FormField label="Hora (opcional)">
          <Input type="time" value={form.hora} onChange={e => set('hora', e.target.value)} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Lugar / Aula">
          <Input value={form.lugar} onChange={e => set('lugar', e.target.value)} placeholder="Ej: Aula 301" />
        </FormField>
        <FormField label="Nota (0–10)">
          <Input
            type="number" min={0} max={10} step={0.5}
            value={form.nota} onChange={e => set('nota', e.target.value)}
            placeholder="—"
          />
        </FormField>
      </div>

      <FormField label="Estado">
        <Select value={form.estado} onChange={e => set('estado', e.target.value)}>
          {Object.entries(ESTADO_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Observaciones">
        <Textarea
          value={form.observaciones}
          onChange={e => set('observaciones', e.target.value)}
          rows={2}
          placeholder="Notas sobre esta evaluación..."
        />
      </FormField>

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" variant="primary" className="flex-1">Guardar</Button>
        <Button type="button" variant="ghost" onClick={onDone}>Cancelar</Button>
        <Button type="button" variant="danger" onClick={handleDelete}>
          <Trash2 size={14} />
        </Button>
      </div>
    </form>
  )
}
