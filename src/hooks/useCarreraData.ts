import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { CARRERA_SUBJECTS } from '../data/carreraData'
import { syncBus } from '../utils/syncBus'

export type EstadoCarrera = 'pendiente' | 'cursando' | 'aprobada'

export interface CarreraSubjectState {
  estado: EstadoCarrera
  nota?: number
}

type CarreraStates = Record<string, CarreraSubjectState>

const SUBJECT_MAP = new Map(CARRERA_SUBJECTS.map(s => [s.id, s]))

export function useCarreraData(uid: string) {
  const [states, setStates] = useState<CarreraStates>({})
  const [loaded, setLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isInitialLoad = useRef(true)

  const carreraRef = doc(db, 'users', uid, 'storage', 'carreraData')

  // Load from Firestore on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const snap = await getDoc(carreraRef)
        if (cancelled) return
        if (snap.exists()) {
          setStates(snap.data()?.states ?? {})
        }
        // If no doc, start empty — defaults to pendiente for all
      } catch (err) {
        console.error('Error loading carrera data:', err)
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }
    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // Save to Firestore on change (debounced 1s)
  useEffect(() => {
    if (!loaded) return
    if (isInitialLoad.current) { isInitialLoad.current = false; return }
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      setDoc(carreraRef, { states }).catch(console.error)
    }, 1000)
    return () => clearTimeout(saveTimerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states, loaded])

  // Listen for cuatrimestre → carrera sync events
  useEffect(() => {
    return syncBus.on(event => {
      if (event.type !== 'materia-to-carrera') return
      const { carreraSubjectId, estado } = event
      setStates(prev => {
        const current = prev[carreraSubjectId]
        if (current?.estado === estado) return prev
        return { ...prev, [carreraSubjectId]: { ...current, estado } }
      })
    })
  }, [])

  const setSubjectState = useCallback((id: string, estado: EstadoCarrera, nota?: number) => {
    const clampedNota = nota !== undefined ? Math.min(10, Math.max(1, nota)) : undefined
    setStates(prev => {
      const current = prev[id]
      if (current?.estado === estado && current?.nota === clampedNota) return prev
      return {
        ...prev,
        [id]: { estado, nota: estado === 'aprobada' ? clampedNota : undefined },
      }
    })
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

  const stats = useMemo(() => {
    const stateValues = Object.values(states)
    const notasValues = stateValues
      .filter(s => s.estado === 'aprobada' && s.nota !== undefined)
      .map(s => s.nota!)
    const promedio = notasValues.length
      ? parseFloat((notasValues.reduce((a, b) => a + b, 0) / notasValues.length).toFixed(2))
      : null
    return {
      total: CARRERA_SUBJECTS.length,
      aprobadas: stateValues.filter(s => s.estado === 'aprobada').length,
      cursando: stateValues.filter(s => s.estado === 'cursando').length,
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
  }, [states])

  const { analistaAprobadas, analistaTotal, analistaCompleto } = useMemo(() => {
    const analistaSubjects = CARRERA_SUBJECTS.filter(s => s.año <= 3)
    const aprobadas = analistaSubjects.filter(s => (states[s.id]?.estado ?? 'pendiente') === 'aprobada').length
    return {
      analistaAprobadas: aprobadas,
      analistaTotal: analistaSubjects.length,
      analistaCompleto: aprobadas === analistaSubjects.length,
    }
  }, [states])

  return {
    states, getState, setSubjectState, isUnlocked, getMissingCorrelativas,
    stats, analistaCompleto, analistaAprobadas, analistaTotal,
  }
}
