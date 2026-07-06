export type DiaSemana = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab'
export type TipoMateria = 'virtual' | 'presencial' | 'intensiva'
export type RegimenMateria = 'examen_final' | 'trabajo_final' | 'promocion'
export type EstadoMateria = 'cursando' | 'rindiendo' | 'promocionada' | 'aprobada' | 'desaprobada'
export type TipoEvaluacion = 'parcial_1' | 'parcial_2' | 'recuperatorio' | 'final_adelantado' | 'final' | 'trabajo_final'
export type EstadoEvaluacion = 'pendiente_fecha' | 'programado' | 'aprobado' | 'desaprobado' | 'ausente' | 'promocionado'
export type ColorKey = 'cyan' | 'sky' | 'blue' | 'violet' | 'purple' | 'green' | 'amber' | 'rose'

export interface Horario {
  dia: DiaSemana
  inicio: string
  fin: string
}

export interface PeriodoIntensivo {
  desde: string
  hasta: string
  inicio: string
  fin: string
}

export interface Cuatrimestre {
  id: string
  nombre: string
  año: number
  numero: 1 | 2
  fechaInicio: string
  fechaFin: string
}

export interface Materia {
  id: string
  cuatrimestreId: string
  nombre: string
  tipo: TipoMateria
  regimen: RegimenMateria
  curso: string
  aula?: string
  color: ColorKey
  horarios: Horario[]
  periodoIntensivo?: PeriodoIntensivo
  orden: number
  carreraSubjectId?: string
}

export interface Evaluacion {
  id: string
  materiaId: string
  tipo: TipoEvaluacion
  nombre: string
  fecha?: string
  hora?: string
  lugar?: string
  nota?: number
  estado: EstadoEvaluacion
  observaciones?: string
}

export interface MateriaState {
  materiaId: string
  estado: EstadoMateria
  notas: string
}

export interface Conflicto {
  fecha: string
  items: Array<{ evaluacion: Evaluacion; materia: Materia }>
}

export interface AppStorage {
  cuatrimestres: Cuatrimestre[]
  materias: Materia[]
  evaluaciones: Evaluacion[]
  materiaStates: MateriaState[]
  activeCuatrimestreId: string
  version: number
}

export interface AppContextType {
  cuatrimestres: Cuatrimestre[]
  materias: Materia[]
  evaluaciones: Evaluacion[]
  materiaStates: MateriaState[]
  activeCuatrimestreId: string
  activeCuatrimestre: Cuatrimestre | undefined
  activeMaterias: Materia[]
  activeEvaluaciones: Evaluacion[]
  conflicts: Conflicto[]
  nextEvento: { materia: Materia; evaluacion: Evaluacion } | null
  setActiveCuatrimestre: (id: string) => void
  addCuatrimestre: (c: Omit<Cuatrimestre, 'id'>) => void
  deleteCuatrimestre: (id: string) => void
  addMateria: (m: Omit<Materia, 'id'>) => string
  updateMateria: (id: string, updates: Partial<Materia>) => void
  deleteMateria: (id: string) => void
  addEvaluacion: (e: Omit<Evaluacion, 'id'>) => void
  updateEvaluacion: (id: string, updates: Partial<Evaluacion>) => void
  deleteEvaluacion: (id: string) => void
  getMateriaState: (materiaId: string) => MateriaState
  updateMateriaState: (materiaId: string, updates: Partial<MateriaState>) => void
}
