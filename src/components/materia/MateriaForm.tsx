import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Materia, TipoMateria, RegimenMateria, DiaSemana, ColorKey, Horario } from '../../types'
import { useAppContext } from '../../context/AppContext'
import { FormField, Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { COLOR_PALETTE, COLORS } from '../../utils/colors'

const DIAS: DiaSemana[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab']
const DIA_LABELS: Record<DiaSemana, string> = {
  lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado',
}

interface Props {
  cuatrimestreId: string
  materia?: Materia
  onDone: () => void
}

export function MateriaForm({ cuatrimestreId, materia, onDone }: Props) {
  const { addMateria, updateMateria, deleteMateria, activeMaterias } = useAppContext()

  const [form, setForm] = useState({
    nombre: materia?.nombre ?? '',
    tipo: materia?.tipo ?? ('presencial' as TipoMateria),
    regimen: materia?.regimen ?? ('examen_final' as RegimenMateria),
    curso: materia?.curso ?? '',
    aula: materia?.aula ?? '',
    color: materia?.color ?? ('blue' as ColorKey),
    horarios: materia?.horarios ?? [{ dia: 'lun' as DiaSemana, inicio: '08:00', fin: '12:00' }],
    periodoDesde: materia?.periodoIntensivo?.desde ?? '',
    periodoHasta: materia?.periodoIntensivo?.hasta ?? '',
    periodoInicio: materia?.periodoIntensivo?.inicio ?? '07:00',
    periodoFin: materia?.periodoIntensivo?.fin ?? '17:30',
  })

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function addHorario() {
    set('horarios', [...form.horarios, { dia: 'lun' as DiaSemana, inicio: '08:00', fin: '12:00' }])
  }

  function removeHorario(i: number) {
    set('horarios', form.horarios.filter((_, idx) => idx !== i))
  }

  function updateHorario(i: number, field: keyof Horario, value: string) {
    const updated = form.horarios.map((h, idx) => idx === i ? { ...h, [field]: value } : h)
    set('horarios', updated)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: Omit<Materia, 'id'> = {
      cuatrimestreId,
      nombre: form.nombre,
      tipo: form.tipo,
      regimen: form.regimen,
      curso: form.curso,
      aula: form.aula || undefined,
      color: form.color,
      horarios: form.tipo === 'intensiva' ? [] : form.horarios,
      periodoIntensivo: form.tipo === 'intensiva' && form.periodoDesde ? {
        desde: form.periodoDesde, hasta: form.periodoHasta,
        inicio: form.periodoInicio, fin: form.periodoFin,
      } : undefined,
      orden: materia?.orden ?? (activeMaterias.length + 1),
    }

    if (materia) {
      updateMateria(materia.id, payload)
    } else {
      addMateria(payload)
    }
    onDone()
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${materia?.nombre}" y todas sus evaluaciones?`)) return
    deleteMateria(materia!.id)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Nombre de la materia">
        <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} required placeholder="Ej: Análisis Matemático I" />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Tipo">
          <Select value={form.tipo} onChange={e => set('tipo', e.target.value as TipoMateria)}>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="intensiva">Intensiva</option>
          </Select>
        </FormField>
        <FormField label="Régimen">
          <Select value={form.regimen} onChange={e => set('regimen', e.target.value as RegimenMateria)}>
            <option value="examen_final">Examen Final</option>
            <option value="trabajo_final">Trabajo Final</option>
            <option value="promocion">Promoción</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Código de curso">
          <Input value={form.curso} onChange={e => set('curso', e.target.value)} placeholder="Ej: 587214" />
        </FormField>
        <FormField label="Aula / Sede">
          <Input value={form.aula} onChange={e => set('aula', e.target.value)} placeholder="Ej: Aula 301, Monserrat" />
        </FormField>
      </div>

      {/* Color */}
      <FormField label="Color">
        <div className="flex gap-2 flex-wrap">
          {COLOR_PALETTE.map(key => (
            <button
              key={key}
              type="button"
              onClick={() => set('color', key)}
              className={`w-6 h-6 rounded-full ${COLORS[key].dot} ring-2 ring-offset-2 ring-offset-navy-900 transition-all ${
                form.color === key ? 'ring-white scale-110' : 'ring-transparent'
              }`}
            />
          ))}
        </div>
      </FormField>

      {/* Horarios regulares */}
      {form.tipo !== 'intensiva' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-display text-slate-400 uppercase tracking-wider">Horarios</label>
            <Button type="button" size="sm" variant="ghost" onClick={addHorario}>
              <Plus size={12} /> Agregar
            </Button>
          </div>
          <div className="space-y-2">
            {form.horarios.map((h, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Select value={h.dia} onChange={e => updateHorario(i, 'dia', e.target.value as DiaSemana)} className="flex-1">
                  {DIAS.map(d => <option key={d} value={d}>{DIA_LABELS[d]}</option>)}
                </Select>
                <Input type="time" value={h.inicio} onChange={e => updateHorario(i, 'inicio', e.target.value)} className="w-28" />
                <span className="text-slate-500 text-xs">→</span>
                <Input type="time" value={h.fin} onChange={e => updateHorario(i, 'fin', e.target.value)} className="w-28" />
                {form.horarios.length > 1 && (
                  <button type="button" onClick={() => removeHorario(i)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Periodo intensivo */}
      {form.tipo === 'intensiva' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Fecha inicio">
              <Input type="date" value={form.periodoDesde} onChange={e => set('periodoDesde', e.target.value)} />
            </FormField>
            <FormField label="Fecha fin">
              <Input type="date" value={form.periodoHasta} onChange={e => set('periodoHasta', e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Hora inicio">
              <Input type="time" value={form.periodoInicio} onChange={e => set('periodoInicio', e.target.value)} />
            </FormField>
            <FormField label="Hora fin">
              <Input type="time" value={form.periodoFin} onChange={e => set('periodoFin', e.target.value)} />
            </FormField>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" className="flex-1">
          {materia ? 'Guardar cambios' : 'Agregar materia'}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>Cancelar</Button>
        {materia && (
          <Button type="button" variant="danger" onClick={handleDelete}>
            <Trash2 size={14} />
          </Button>
        )}
      </div>
    </form>
  )
}
