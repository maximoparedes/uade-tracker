import { useState, useCallback } from 'react'
import { CARRERA_SUBJECTS } from '../data/carreraData'

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
  // Pre-seed subjects that are in the current semester as 'cursando'
  const cursandoIds = new Set(['c-077', 'c-208', 'c-089', 'c-219', 'c-054', 'c-2056', 'c-214'])
  const initial: CarreraStates = {}
  for (const s of CARRERA_SUBJECTS) {
    initial[s.id] = { estado: cursandoIds.has(s.id) ? 'cursando' : 'pendiente' }
  }
  return initial
}

function save(states: CarreraStates) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(states)) } catch {}
}

export function useCarreraData() {
  const [states, setStates] = useState<CarreraStates>(load)

  const setSubjectState = useCallback((id: string, estado: EstadoCarrera, nota?: number) => {
    setStates(prev => {
      const next = { ...prev, [id]: { estado, nota: estado === 'aprobada' ? nota : undefined } }
      save(next)
      return next
    })
  }, [])

  const getState = useCallback((id: string): CarreraSubjectState =>
    states[id] ?? { estado: 'pendiente' }, [states])

  const stats = {
    total: CARRERA_SUBJECTS.length,
    aprobadas: Object.values(states).filter(s => s.estado === 'aprobada').length,
    cursando: Object.values(states).filter(s => s.estado === 'cursando').length,
    byAño: [1, 2, 3, 4, 5].map(año => {
      const subs = CARRERA_SUBJECTS.filter(s => s.año === año)
      return {
        año: año as 1|2|3|4|5,
        total: subs.length,
        aprobadas: subs.filter(s => (states[s.id]?.estado ?? 'pendiente') === 'aprobada').length,
        cursando: subs.filter(s => (states[s.id]?.estado ?? 'pendiente') === 'cursando').length,
      }
    }),
  }

  // Analista en Informática = years 1-3 all approved
  const analistaAprobadas = [1,2,3].flatMap(y => CARRERA_SUBJECTS.filter(s => s.año === y))
    .filter(s => (states[s.id]?.estado ?? 'pendiente') === 'aprobada').length
  const analistaTotal = CARRERA_SUBJECTS.filter(s => s.año <= 3).length
  const analistaCompleto = analistaAprobadas === analistaTotal

  return { states, getState, setSubjectState, stats, analistaCompleto, analistaAprobadas, analistaTotal }
}
