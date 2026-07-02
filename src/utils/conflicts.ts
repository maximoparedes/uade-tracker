import type { Evaluacion, Materia, Conflicto } from '../types'

export function detectConflicts(evaluaciones: Evaluacion[], materias: Materia[]): Conflicto[] {
  const byDate = new Map<string, Array<{ evaluacion: Evaluacion; materia: Materia }>>()

  for (const ev of evaluaciones) {
    if (!ev.fecha) continue
    if (!byDate.has(ev.fecha)) byDate.set(ev.fecha, [])
    const mat = materias.find(m => m.id === ev.materiaId)
    if (mat) byDate.get(ev.fecha)!.push({ evaluacion: ev, materia: mat })
  }

  const conflicts: Conflicto[] = []
  for (const [fecha, items] of byDate) {
    if (items.length > 1) {
      conflicts.push({ fecha, items })
    }
  }

  return conflicts.sort((a, b) => a.fecha.localeCompare(b.fecha))
}
