import { useState, useEffect, useMemo } from 'react'
import type { AppStorage, AppContextType, Cuatrimestre, Materia, Evaluacion, MateriaState } from '../types'
import { SEED_DATA } from '../data/seed'
import { detectConflicts } from '../utils/conflicts'
import { generateEvaluaciones } from '../utils/evaluaciones'
import { todayStr } from '../utils/dates'
import { syncBus } from '../utils/syncBus'

const STORAGE_KEY = 'uade-tracker-v1'

function nanoid(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function useAppData(): AppContextType {
  const [data, setData] = useState<AppStorage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved) as AppStorage
    } catch { /* ignore */ }
    return SEED_DATA
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  // Listen for carrera → cuatrimestre sync events
  useEffect(() => {
    return syncBus.on(event => {
      if (event.type !== 'carrera-to-materia') return
      const { carreraSubjectId, estado } = event
      setData(d => {
        const materia = d.materias.find(m => m.carreraSubjectId === carreraSubjectId)
        if (!materia) return d
        const estadoMateria: MateriaState['estado'] =
          estado === 'aprobada' ? 'aprobada' :
          estado === 'cursando' ? 'cursando' : 'rindiendo'
        const exists = d.materiaStates.some(s => s.materiaId === materia.id)
        const current = d.materiaStates.find(s => s.materiaId === materia.id)
        if (current?.estado === estadoMateria) return d // already in sync
        return {
          ...d,
          materiaStates: exists
            ? d.materiaStates.map(s => s.materiaId === materia.id ? { ...s, estado: estadoMateria } : s)
            : [...d.materiaStates, { materiaId: materia.id, estado: estadoMateria, notas: '' }],
        }
      })
    })
  }, [])

  const activeCuatrimestre = data.cuatrimestres.find(c => c.id === data.activeCuatrimestreId)

  const activeMaterias = useMemo(
    () => data.materias
      .filter(m => m.cuatrimestreId === data.activeCuatrimestreId)
      .sort((a, b) => a.orden - b.orden),
    [data.materias, data.activeCuatrimestreId]
  )

  const activeEvaluaciones = useMemo(
    () => data.evaluaciones.filter(e => activeMaterias.some(m => m.id === e.materiaId)),
    [data.evaluaciones, activeMaterias]
  )

  const conflicts = useMemo(
    () => detectConflicts(activeEvaluaciones, activeMaterias),
    [activeEvaluaciones, activeMaterias]
  )

  const nextEvento = useMemo(() => {
    const today = todayStr()
    const upcoming = activeEvaluaciones
      .filter(e => e.fecha && e.fecha >= today && e.estado !== 'aprobado' && e.estado !== 'promocionado')
      .sort((a, b) => a.fecha!.localeCompare(b.fecha!))
    if (!upcoming.length) return null
    const ev = upcoming[0]
    const mat = activeMaterias.find(m => m.id === ev.materiaId)
    if (!mat) return null
    return { materia: mat, evaluacion: ev }
  }, [activeEvaluaciones, activeMaterias])

  function setActiveCuatrimestre(id: string) {
    setData(d => ({ ...d, activeCuatrimestreId: id }))
  }

  function addCuatrimestre(c: Omit<Cuatrimestre, 'id'>) {
    const id = nanoid()
    setData(d => ({
      ...d,
      cuatrimestres: [...d.cuatrimestres, { ...c, id }],
      activeCuatrimestreId: id,
    }))
  }

  function deleteCuatrimestre(id: string) {
    setData(d => {
      const remaining = d.cuatrimestres.filter(c => c.id !== id)
      const mIds = d.materias.filter(m => m.cuatrimestreId === id).map(m => m.id)
      return {
        ...d,
        cuatrimestres: remaining,
        materias: d.materias.filter(m => m.cuatrimestreId !== id),
        evaluaciones: d.evaluaciones.filter(e => !mIds.includes(e.materiaId)),
        materiaStates: d.materiaStates.filter(s => !mIds.includes(s.materiaId)),
        activeCuatrimestreId: remaining.length ? remaining[remaining.length - 1].id : '',
      }
    })
  }

  function addMateria(m: Omit<Materia, 'id'>): string {
    const id = nanoid()
    const evs = generateEvaluaciones(id, m.regimen, m.tipo)
    setData(d => ({
      ...d,
      materias: [...d.materias, { ...m, id }],
      evaluaciones: [...d.evaluaciones, ...evs],
      materiaStates: [...d.materiaStates, { materiaId: id, estado: 'cursando', notas: '' }],
    }))
    return id
  }

  function updateMateria(id: string, updates: Partial<Materia>) {
    setData(d => ({
      ...d,
      materias: d.materias.map(m => m.id === id ? { ...m, ...updates } : m),
    }))
  }

  function deleteMateria(id: string) {
    setData(d => ({
      ...d,
      materias: d.materias.filter(m => m.id !== id),
      evaluaciones: d.evaluaciones.filter(e => e.materiaId !== id),
      materiaStates: d.materiaStates.filter(s => s.materiaId !== id),
    }))
  }

  function addEvaluacion(e: Omit<Evaluacion, 'id'>) {
    setData(d => ({ ...d, evaluaciones: [...d.evaluaciones, { ...e, id: nanoid() }] }))
  }

  function updateEvaluacion(id: string, updates: Partial<Evaluacion>) {
    setData(d => ({
      ...d,
      evaluaciones: d.evaluaciones.map(e => e.id === id ? { ...e, ...updates } : e),
    }))
  }

  function deleteEvaluacion(id: string) {
    setData(d => ({ ...d, evaluaciones: d.evaluaciones.filter(e => e.id !== id) }))
  }

  function getMateriaState(materiaId: string): MateriaState {
    return data.materiaStates.find(s => s.materiaId === materiaId) ?? {
      materiaId, estado: 'cursando', notas: '',
    }
  }

  function updateMateriaState(materiaId: string, updates: Partial<MateriaState>) {
    setData(d => {
      const exists = d.materiaStates.some(s => s.materiaId === materiaId)
      if (exists) {
        return {
          ...d,
          materiaStates: d.materiaStates.map(s =>
            s.materiaId === materiaId ? { ...s, ...updates } : s
          ),
        }
      }
      return {
        ...d,
        materiaStates: [...d.materiaStates, { materiaId, estado: 'cursando', notas: '', ...updates }],
      }
    })
    // Sync to carrera map
    if (updates.estado === 'aprobada' || updates.estado === 'promocionada') {
      const materia = data.materias.find(m => m.id === materiaId)
      if (materia?.carreraSubjectId) {
        syncBus.emit({ type: 'materia-to-carrera', carreraSubjectId: materia.carreraSubjectId, estado: 'aprobada' })
      }
    } else if (updates.estado === 'cursando' || updates.estado === 'rindiendo') {
      const materia = data.materias.find(m => m.id === materiaId)
      if (materia?.carreraSubjectId) {
        syncBus.emit({ type: 'materia-to-carrera', carreraSubjectId: materia.carreraSubjectId, estado: 'cursando' })
      }
    }
  }

  return {
    cuatrimestres: data.cuatrimestres,
    materias: data.materias,
    evaluaciones: data.evaluaciones,
    materiaStates: data.materiaStates,
    activeCuatrimestreId: data.activeCuatrimestreId,
    activeCuatrimestre,
    activeMaterias,
    activeEvaluaciones,
    conflicts,
    nextEvento,
    setActiveCuatrimestre,
    addCuatrimestre,
    deleteCuatrimestre,
    addMateria,
    updateMateria,
    deleteMateria,
    addEvaluacion,
    updateEvaluacion,
    deleteEvaluacion,
    getMateriaState,
    updateMateriaState,
  }
}
