import { useState, useEffect, useMemo, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { AppStorage, AppContextType, Cuatrimestre, Materia, Evaluacion, MateriaState } from '../types'
import { db } from '../firebase'
import { CARRERA_SUBJECTS } from '../data/carreraData'
import { detectConflicts } from '../utils/conflicts'
import { generateEvaluaciones } from '../utils/evaluaciones'
import { todayStr } from '../utils/dates'
import { syncBus } from '../utils/syncBus'

function nanoid(): string {
  return Math.random().toString(36).slice(2, 11)
}

// Firestore rejects undefined values — strip them recursively before saving
function stripUndefined(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripUndefined)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    )
  }
  return obj
}

const NOMBRE_TO_CARRERA_ID: Record<string, string> = Object.fromEntries(
  CARRERA_SUBJECTS.map(s => [s.nombre, s.id])
)

function migrateData(data: AppStorage): AppStorage {
  let d = { ...data }
  if ((d.version ?? 1) < 2) {
    const migratedMaterias = d.materias.map(m => ({
      ...m,
      carreraSubjectId: m.carreraSubjectId ?? NOMBRE_TO_CARRERA_ID[m.nombre],
    }))
    const virtualIds = new Set(migratedMaterias.filter(m => m.tipo === 'virtual').map(m => m.id))
    d = {
      ...d,
      materias: migratedMaterias,
      evaluaciones: d.evaluaciones.filter(
        e => !(e.tipo === 'parcial_2' && virtualIds.has(e.materiaId))
      ),
      version: 2,
    }
  }
  return d
}

function emptyStorage(cuatrimestre: Cuatrimestre): AppStorage {
  return {
    cuatrimestres: [cuatrimestre],
    materias: [],
    evaluaciones: [],
    materiaStates: [],
    activeCuatrimestreId: cuatrimestre.id,
    version: 2,
  }
}

export type AppDataExtended = AppContextType & {
  dataLoading: boolean
  needsOnboarding: boolean
  initializeUser: (nombre: string, cuatrimestre: Cuatrimestre) => Promise<void>
}

export function useAppData(uid: string): AppDataExtended {
  const [data, setData] = useState<AppStorage | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const isInitialLoad = useRef(true)
  const appDocRef = useRef(doc(db, 'users', uid, 'storage', 'appData'))

  const appRef = appDocRef.current
  const profileRef = doc(db, 'users', uid)

  // Load from Firestore on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [profileSnap, appSnap] = await Promise.all([
          getDoc(profileRef),
          getDoc(appRef),
        ])
        if (cancelled) return

        if (!profileSnap.exists() || !profileSnap.data()?.onboardingCompleto) {
          setNeedsOnboarding(true)
          setDataLoading(false)
          return
        }

        if (appSnap.exists()) {
          setData(migrateData(appSnap.data() as AppStorage))
        } else {
          // Profile exists but no app data — shouldn't happen, but handle gracefully
          setNeedsOnboarding(true)
        }
      } catch (err) {
        console.error('Error loading data:', err)
        // On any Firestore error, fall back to onboarding so user isn't stuck
        if (!cancelled) setNeedsOnboarding(true)
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // Save to Firestore immediately on every data change
  useEffect(() => {
    if (!data || dataLoading) return
    if (isInitialLoad.current) { isInitialLoad.current = false; return }
    try {
      setDoc(appDocRef.current, stripUndefined(data) as AppStorage)
        .then(() => console.log('[Firestore] saved ok'))
        .catch(err => console.error('[Firestore] save FAILED:', err?.code, err?.message))
    } catch (err: unknown) {
      console.error('[Firestore] save FAILED (sync):', err)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // Listen for carrera → cuatrimestre sync events
  useEffect(() => {
    return syncBus.on(event => {
      if (event.type !== 'carrera-to-materia') return
      const { carreraSubjectId, estado } = event
      setData(d => {
        if (!d) return d
        const materia = d.materias.find(m => m.carreraSubjectId === carreraSubjectId)
        if (!materia) return d
        const estadoMateria: MateriaState['estado'] =
          estado === 'aprobada' ? 'aprobada' :
          estado === 'cursando' ? 'cursando' : 'rindiendo'
        const current = d.materiaStates.find(s => s.materiaId === materia.id)
        if (current?.estado === estadoMateria) return d
        return {
          ...d,
          materiaStates: current
            ? d.materiaStates.map(s => s.materiaId === materia.id ? { ...s, estado: estadoMateria } : s)
            : [...d.materiaStates, { materiaId: materia.id, estado: estadoMateria, notas: '' }],
        }
      })
    })
  }, [])

  async function initializeUser(nombre: string, cuatrimestre: Cuatrimestre) {
    const initialData = emptyStorage(cuatrimestre)
    await Promise.all([
      setDoc(profileRef, {
        nombre,
        carrera: 'informatica',
        onboardingCompleto: true,
        email: '',
        createdAt: new Date().toISOString(),
      }),
      setDoc(appRef, initialData),
    ])
    setData(initialData)
    isInitialLoad.current = false
    setNeedsOnboarding(false)
  }

  // Derived state — safe defaults when data is null (during loading)
  const safeData: AppStorage = data ?? {
    cuatrimestres: [], materias: [], evaluaciones: [],
    materiaStates: [], activeCuatrimestreId: '', version: 2,
  }

  const activeCuatrimestre = safeData.cuatrimestres.find(c => c.id === safeData.activeCuatrimestreId)

  const activeMaterias = useMemo(
    () => safeData.materias
      .filter(m => m.cuatrimestreId === safeData.activeCuatrimestreId)
      .sort((a, b) => a.orden - b.orden),
    [safeData.materias, safeData.activeCuatrimestreId]
  )

  const activeEvaluaciones = useMemo(
    () => safeData.evaluaciones.filter(e => activeMaterias.some(m => m.id === e.materiaId)),
    [safeData.evaluaciones, activeMaterias]
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

  function update(fn: (d: AppStorage) => AppStorage) {
    setData(d => d ? fn(d) : d)
  }

  function setActiveCuatrimestre(id: string) {
    update(d => ({ ...d, activeCuatrimestreId: id }))
  }

  function addCuatrimestre(c: Omit<Cuatrimestre, 'id'>) {
    const id = nanoid()
    update(d => ({
      ...d,
      cuatrimestres: [...d.cuatrimestres, { ...c, id }],
      activeCuatrimestreId: id,
    }))
  }

  function deleteCuatrimestre(id: string) {
    update(d => {
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
    update(d => ({
      ...d,
      materias: [...d.materias, { ...m, id }],
      evaluaciones: [...d.evaluaciones, ...evs],
      materiaStates: [...d.materiaStates, { materiaId: id, estado: 'cursando', notas: '' }],
    }))
    return id
  }

  function updateMateria(id: string, updates: Partial<Materia>) {
    update(d => {
      const materia = d.materias.find(m => m.id === id)
      if (!materia) return d
      let evaluaciones = d.evaluaciones
      if (updates.tipo !== undefined && updates.tipo !== materia.tipo) {
        if (updates.tipo === 'virtual') {
          evaluaciones = evaluaciones.filter(e => !(e.materiaId === id && e.tipo === 'parcial_2'))
        } else if (materia.tipo === 'virtual') {
          const hasP2 = evaluaciones.some(e => e.materiaId === id && e.tipo === 'parcial_2')
          if (!hasP2) {
            evaluaciones = [...evaluaciones, {
              id: `e-${nanoid()}`, materiaId: id, tipo: 'parcial_2' as const,
              nombre: 'Parcial 2', estado: 'pendiente_fecha' as const,
            }]
          }
        }
      }
      return {
        ...d,
        materias: d.materias.map(m => m.id === id ? { ...m, ...updates } : m),
        evaluaciones,
      }
    })
  }

  function deleteMateria(id: string) {
    update(d => ({
      ...d,
      materias: d.materias.filter(m => m.id !== id),
      evaluaciones: d.evaluaciones.filter(e => e.materiaId !== id),
      materiaStates: d.materiaStates.filter(s => s.materiaId !== id),
    }))
  }

  function addEvaluacion(e: Omit<Evaluacion, 'id'>) {
    update(d => ({ ...d, evaluaciones: [...d.evaluaciones, { ...e, id: nanoid() }] }))
  }

  function updateEvaluacion(id: string, updates: Partial<Evaluacion>) {
    update(d => {
      const ev = d.evaluaciones.find(e => e.id === id)
      let evaluaciones = d.evaluaciones.map(e => e.id === id ? { ...e, ...updates } : e)
      // Auto-create ONE recuperatorio when any parcial is failed/absent
      if (ev && (updates.estado === 'desaprobado' || updates.estado === 'ausente')) {
        if (ev.tipo === 'parcial_1' || ev.tipo === 'parcial_2') {
          const hasRec = evaluaciones.some(e => e.materiaId === ev.materiaId && e.tipo === 'recuperatorio')
          if (!hasRec) {
            evaluaciones = [...evaluaciones, {
              id: `e-${nanoid()}`, materiaId: ev.materiaId, tipo: 'recuperatorio' as const,
              nombre: 'Recuperatorio', estado: 'pendiente_fecha' as const,
            }]
          }
        }
      }
      return { ...d, evaluaciones }
    })
  }

  function deleteEvaluacion(id: string) {
    update(d => ({ ...d, evaluaciones: d.evaluaciones.filter(e => e.id !== id) }))
  }

  function getMateriaState(materiaId: string): MateriaState {
    return safeData.materiaStates.find(s => s.materiaId === materiaId) ?? {
      materiaId, estado: 'cursando', notas: '',
    }
  }

  function updateMateriaState(materiaId: string, updates: Partial<MateriaState>) {
    update(d => {
      const current = d.materiaStates.find(s => s.materiaId === materiaId)
      if (current) {
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

    if (!updates.estado) return
    const current = safeData.materiaStates.find(s => s.materiaId === materiaId)
    if (current?.estado === updates.estado) return
    const materia = safeData.materias.find(m => m.id === materiaId)
    if (!materia?.carreraSubjectId) return

    if (updates.estado === 'aprobada' || updates.estado === 'promocionada') {
      syncBus.emit({ type: 'materia-to-carrera', carreraSubjectId: materia.carreraSubjectId, estado: 'aprobada' })
    } else if (updates.estado === 'cursando' || updates.estado === 'rindiendo') {
      syncBus.emit({ type: 'materia-to-carrera', carreraSubjectId: materia.carreraSubjectId, estado: 'cursando' })
    } else {
      syncBus.emit({ type: 'carrera-to-materia', carreraSubjectId: materia.carreraSubjectId, estado: 'pendiente' })
    }
  }

  return {
    cuatrimestres: safeData.cuatrimestres,
    materias: safeData.materias,
    evaluaciones: safeData.evaluaciones,
    materiaStates: safeData.materiaStates,
    activeCuatrimestreId: safeData.activeCuatrimestreId,
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
    dataLoading,
    needsOnboarding,
    initializeUser,
  }
}
