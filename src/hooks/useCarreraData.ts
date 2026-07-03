import { useState, useEffect, useCallback } from 'react'
import { CARRERA_SUBJECTS } from '../data/carreraData'
import { syncBus } from '../utils/syncBus'

export type EstadoCarrera = 'pendiente' | 'cursando' | 'aprobada'

export interface CarreraSubjectState {
  estado: EstadoCarrera
  nota?: number
}

type CarreraStates = Record<string, CarreraSubjectState>

const STORAGE_KEY = 'uade-carrera-v1'

function load(): CarreraStates {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CarreraStates
  } catch {}
  const cursandoIds = new Set(['c-077', 'c-208', 'c-089', 'c-219', 'c-054', 'c-2056', 'c-214'])
  const initial: CarreraStates = {}
  for (const s of CARRERA_SUBJECTS) {
    initial[s.id] = { estado: cursandoIds.has(s.id) ? 'cursando' : 'pendiente' }
  }
  return initial
}

function persist(states: CarreraStates) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(states)) } catch {}
}

// Subject index for O(1) lookup
const SUBJECT_MAP = new Map(CARRERA_SUBJECTS.map(s => [s.id, s]))

export function useCarreraData() {
  const [states, setStates] = useState<CarreraStates>(load)

  // Listen for cuatrimestre → carrera sync events
  useEffect(() => {
    return syncBus.on(event => {
      if (event.type !== 'materia-to-carrera') return
      const { carreraSubjectId, estado } = event
      setStates(prev => {
        const current = prev[carreraSubjectId]
        if (current?.estado === estado) return prev // already in sync
        const next = { ...prev, [carreraSubjectId]: { ...current, estado } }
        persist(next)
        return next
      })
    })
  }, [])

  const setSubjectState = useCallback((id: string, estado: EstadoCarrera, nota?: number) => {
    const clampedNota = nota !== undefined ? Math.min(10, Math.max(1, nota)) : undefined
    setStates(prev => {
      const updated: CarreraSubjectState = { estado, nota: estado === 'aprobada' ? clampedNota : undefined }
      const next = { ...prev, [id]: updated }
      persist(next)
      return next
    })
    // Sync to cuatrimestre tracker
    if (estado === 'aprobada' || estado === 'cursando') {
      syncBus.emit({ type: 'carrera-to-materia', carreraSubjectId: id, estado })
    } else {
      syncBus.emit({ type: 'carrera-to-materia', carreraSubjectId: id, estado: 'pendiente' })
    }
  }, [])

  const getState = useCallback((id: string): CarreraSubjectState =>
    states[id] ?? { estado: 'pendiente' }, [states])

  const isUnlocked = useCallback((id: string): boolean => {
    const subject = SUBJECT_MAP.get(id)
    if (!subject || subject.correlativas.length === 0) return true
    return subject.correlativas.every(cId => states[cId]?.estado === 'aprobada')
  }, [states])

  const getMissingCorrelativas = useCallback((id: string): string[] => {
    const subject = SUBJECT_MAP.get(id)
    if (!subject) return []
    return subject.correlativas
      .filter(cId => states[cId]?.estado !== 'aprobada')
      .map(cId => SUBJECT_MAP.get(cId)?.nombre ?? cId)
  }, [states])

  // Promedio: average of all subjects with nota
  const notasValues = Object.values(states)
    .filter(s => s.estado === 'aprobada' && s.nota !== undefined)
    .map(s => s.nota!)
  const promedio = notasValues.length
    ? parseFloat((notasValues.reduce((sum, n) => sum + n, 0) / notasValues.length).toFixed(2))
    : null

  const stats = {
    total: CARRERA_SUBJECTS.length,
    aprobadas: Object.values(states).filter(s => s.estado === 'aprobada').length,
    cursando: Object.values(states).filter(s => s.estado === 'cursando').length,
    promedio,
    byAño: ([1, 2, 3, 4, 5] as const).map(año => {
      const subs = CARRERA_SUBJECTS.filter(s => s.año === año)
      return {
        año,
        total: subs.length,
        aprobadas: subs.filter(s => (states[s.id]?.estado ?? 'pendiente') === 'aprobada').length,
        cursando: subs.filter(s => (states[s.id]?.estado ?? 'pendiente') === 'cursando').length,
      }
    }),
  }

  const analistaSubjects = CARRERA_SUBJECTS.filter(s => s.año <= 3)
  const analistaAprobadas = analistaSubjects.filter(s => (states[s.id]?.estado ?? 'pendiente') === 'aprobada').length
  const analistaTotal = analistaSubjects.length
  const analistaCompleto = analistaAprobadas === analistaTotal

  return {
    states, getState, setSubjectState, isUnlocked, getMissingCorrelativas,
    stats, analistaCompleto, analistaAprobadas, analistaTotal,
  }
}
