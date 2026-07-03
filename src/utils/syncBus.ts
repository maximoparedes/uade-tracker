type SyncListener = (e: SyncEvent) => void

export type SyncEvent =
  | { type: 'materia-to-carrera'; carreraSubjectId: string; estado: 'aprobada' | 'cursando' }
  | { type: 'carrera-to-materia'; carreraSubjectId: string; estado: 'aprobada' | 'cursando' | 'pendiente' }

const listeners = new Set<SyncListener>()

export const syncBus = {
  emit(e: SyncEvent) { listeners.forEach(l => l(e)) },
  on(l: SyncListener): () => void {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}
