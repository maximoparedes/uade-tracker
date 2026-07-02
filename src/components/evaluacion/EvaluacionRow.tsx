import { useState } from 'react'
import type { Evaluacion, EstadoEvaluacion } from '../../types'
import { formatDate } from '../../utils/dates'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { EvaluacionForm } from './EvaluacionForm'
import { AlertCircle, Pencil, CheckCircle, XCircle, Clock } from 'lucide-react'

const ESTADO_CONFIG: Record<EstadoEvaluacion, { label: string; variant: 'cyan' | 'amber' | 'green' | 'red' | 'slate' | 'purple'; icon: typeof Clock }> = {
  pendiente_fecha: { label: 'Sin fecha', variant: 'amber', icon: AlertCircle },
  programado: { label: 'Programado', variant: 'cyan', icon: Clock },
  aprobado: { label: 'Aprobado', variant: 'green', icon: CheckCircle },
  desaprobado: { label: 'Desaprobado', variant: 'red', icon: XCircle },
  ausente: { label: 'Ausente', variant: 'slate', icon: XCircle },
  promocionado: { label: 'Promocionado', variant: 'purple', icon: CheckCircle },
}

interface Props {
  evaluacion: Evaluacion
  isConflict?: boolean
}

export function EvaluacionRow({ evaluacion, isConflict }: Props) {
  const [editing, setEditing] = useState(false)
  const config = ESTADO_CONFIG[evaluacion.estado]
  const Icon = config.icon

  return (
    <>
      <div
        className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-navy-800/50 cursor-pointer transition-colors group ${
          isConflict ? 'border border-amber-400/20' : ''
        }`}
        onClick={() => setEditing(true)}
      >
        <div className="w-4 shrink-0">
          <Icon size={13} className={
            evaluacion.estado === 'aprobado' || evaluacion.estado === 'promocionado' ? 'text-green-400' :
            evaluacion.estado === 'desaprobado' ? 'text-red-400' :
            evaluacion.estado === 'pendiente_fecha' ? 'text-amber-400' :
            'text-cyan-400'
          } />
        </div>

        <div className="flex-1 min-w-0">
          <span className="font-display text-sm text-slate-200">{evaluacion.nombre}</span>
          {evaluacion.fecha && (
            <span className="font-mono text-xs text-slate-400 ml-2">{formatDate(evaluacion.fecha)}</span>
          )}
          {evaluacion.hora && (
            <span className="font-mono text-xs text-slate-500 ml-1">{evaluacion.hora}</span>
          )}
          {isConflict && (
            <span className="ml-2 font-mono text-[9px] text-amber-400 bg-amber-400/10 px-1.5 rounded">⚡ conflicto</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {evaluacion.nota !== undefined && (
            <span className="font-mono text-sm font-semibold text-white">{evaluacion.nota}</span>
          )}
          <Badge variant={config.variant}>{config.label}</Badge>
          <Pencil size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title={`Editar — ${evaluacion.nombre}`} size="md">
        <EvaluacionForm evaluacion={evaluacion} onDone={() => setEditing(false)} />
      </Modal>
    </>
  )
}
