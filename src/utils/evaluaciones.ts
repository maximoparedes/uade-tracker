import type { Evaluacion, RegimenMateria, TipoEvaluacion } from '../types'

function makeId(): string {
  return Math.random().toString(36).slice(2, 9)
}

interface EvalTemplate { tipo: TipoEvaluacion; nombre: string }

const TEMPLATES: Record<RegimenMateria, EvalTemplate[]> = {
  examen_final: [
    { tipo: 'parcial_1', nombre: 'Parcial 1' },
    { tipo: 'parcial_2', nombre: 'Parcial 2' },
    { tipo: 'final', nombre: 'Examen Final' },
  ],
  trabajo_final: [
    { tipo: 'parcial_1', nombre: 'Parcial 1' },
    { tipo: 'parcial_2', nombre: 'Parcial 2' },
    { tipo: 'trabajo_final', nombre: 'Trabajo Final' },
  ],
  promocion: [
    { tipo: 'parcial_1', nombre: 'Parcial 1' },
    { tipo: 'parcial_2', nombre: 'Parcial 2' },
  ],
}

export function generateEvaluaciones(materiaId: string, regimen: RegimenMateria): Evaluacion[] {
  return TEMPLATES[regimen].map(t => ({
    id: `e-${makeId()}`,
    materiaId,
    tipo: t.tipo,
    nombre: t.nombre,
    estado: 'pendiente_fecha' as const,
  }))
}
