import type { AppStorage, Cuatrimestre, Materia, Evaluacion, MateriaState } from '../types'

const c1: Cuatrimestre = {
  id: 'c2-2026',
  nombre: '2do Cuatrimestre 2026',
  año: 2026,
  numero: 2,
  fechaInicio: '2026-08-03',
  fechaFin: '2026-12-31',
}

const materias: Materia[] = [
  {
    id: 'm1', cuatrimestreId: 'c2-2026', nombre: 'Programación III',
    tipo: 'virtual', regimen: 'examen_final', curso: '587214', aula: 'Online',
    color: 'cyan', horarios: [{ dia: 'lun', inicio: '18:30', fin: '22:30' }], orden: 1,
    carreraSubjectId: 'c-077',
  },
  {
    id: 'm2', cuatrimestreId: 'c2-2026', nombre: 'Paradigma Orientado a Objetos',
    tipo: 'virtual', regimen: 'examen_final', curso: '587404', aula: 'Online',
    color: 'sky', horarios: [{ dia: 'mie', inicio: '14:00', fin: '18:00' }], orden: 2,
    carreraSubjectId: 'c-208',
  },
  {
    id: 'm3', cuatrimestreId: 'c2-2026', nombre: 'Dirección de Proyectos Informáticos',
    tipo: 'presencial', regimen: 'trabajo_final', curso: '578845', aula: 'Aula 942, Monserrat',
    color: 'blue', horarios: [{ dia: 'lun', inicio: '07:45', fin: '11:45' }], orden: 3,
    carreraSubjectId: 'c-089',
  },
  {
    id: 'm4', cuatrimestreId: 'c2-2026', nombre: 'Tecnología y Medio Ambiente',
    tipo: 'presencial', regimen: 'examen_final', curso: '580412', aula: 'Aula 706, Monserrat',
    color: 'violet', horarios: [{ dia: 'mie', inicio: '07:45', fin: '11:45' }], orden: 4,
    carreraSubjectId: 'c-219',
  },
  {
    id: 'm5', cuatrimestreId: 'c2-2026', nombre: 'Cálculo II',
    tipo: 'presencial', regimen: 'examen_final', curso: '577552', aula: 'Aula SUM, Belgrano',
    color: 'purple', horarios: [{ dia: 'mie', inicio: '18:30', fin: '22:00' }], orden: 5,
    carreraSubjectId: 'c-054',
  },
  {
    id: 'm6', cuatrimestreId: 'c2-2026', nombre: 'Derecho Informático',
    tipo: 'presencial', regimen: 'promocion', curso: '580879', aula: 'Aula 643, Monserrat',
    color: 'green', horarios: [{ dia: 'jue', inicio: '08:15', fin: '12:15' }], orden: 6,
    carreraSubjectId: 'c-2056',
  },
  {
    id: 'm7', cuatrimestreId: 'c2-2026', nombre: 'Ingeniería de Software',
    tipo: 'intensiva', regimen: 'examen_final', curso: '588325', aula: 'Aula Pinamar',
    color: 'amber', horarios: [],
    periodoIntensivo: { desde: '2026-10-26', hasta: '2026-10-31', inicio: '07:00', fin: '17:30' },
    orden: 7,
    carreraSubjectId: 'c-214',
  },
]

const evaluaciones: Evaluacion[] = [
  // Programación III (virtual — solo 1 parcial)
  { id: 'e-m1-p1', materiaId: 'm1', tipo: 'parcial_1', nombre: 'Parcial 1', estado: 'pendiente_fecha' },
  { id: 'e-m1-f', materiaId: 'm1', tipo: 'final', nombre: 'Examen Final', fecha: '2026-12-07', estado: 'programado' },

  // Paradigma OO (virtual — solo 1 parcial)
  { id: 'e-m2-p1', materiaId: 'm2', tipo: 'parcial_1', nombre: 'Parcial 1', estado: 'pendiente_fecha' },
  { id: 'e-m2-f', materiaId: 'm2', tipo: 'final', nombre: 'Examen Final', fecha: '2026-12-09', estado: 'programado' },

  // Dirección de Proyectos
  { id: 'e-m3-p1', materiaId: 'm3', tipo: 'parcial_1', nombre: 'Parcial 1', estado: 'pendiente_fecha' },
  { id: 'e-m3-p2', materiaId: 'm3', tipo: 'parcial_2', nombre: 'Parcial 2', estado: 'pendiente_fecha' },
  { id: 'e-m3-tf', materiaId: 'm3', tipo: 'trabajo_final', nombre: 'Trabajo Final', fecha: '2026-12-21', estado: 'programado' },

  // Tecnología y MA
  { id: 'e-m4-p1', materiaId: 'm4', tipo: 'parcial_1', nombre: 'Parcial 1', estado: 'pendiente_fecha' },
  { id: 'e-m4-p2', materiaId: 'm4', tipo: 'parcial_2', nombre: 'Parcial 2', estado: 'pendiente_fecha' },
  { id: 'e-m4-f', materiaId: 'm4', tipo: 'final', nombre: 'Examen Final', fecha: '2026-12-09', estado: 'programado' },

  // Cálculo II
  { id: 'e-m5-p1', materiaId: 'm5', tipo: 'parcial_1', nombre: 'Parcial 1', estado: 'pendiente_fecha' },
  { id: 'e-m5-p2', materiaId: 'm5', tipo: 'parcial_2', nombre: 'Parcial 2', estado: 'pendiente_fecha' },
  { id: 'e-m5-f', materiaId: 'm5', tipo: 'final', nombre: 'Examen Final', fecha: '2026-12-09', estado: 'programado' },

  // Derecho Informático (promoción)
  { id: 'e-m6-p1', materiaId: 'm6', tipo: 'parcial_1', nombre: 'Parcial 1', estado: 'pendiente_fecha' },
  { id: 'e-m6-p2', materiaId: 'm6', tipo: 'parcial_2', nombre: 'Parcial 2', estado: 'pendiente_fecha' },
  { id: 'e-m6-f', materiaId: 'm6', tipo: 'final', nombre: 'Final (solo si no promociona)', fecha: '2026-12-17', estado: 'programado' },

  // Ingeniería de Software (intensiva)
  { id: 'e-m7-p1', materiaId: 'm7', tipo: 'parcial_1', nombre: 'Parcial 1', estado: 'pendiente_fecha' },
  { id: 'e-m7-p2', materiaId: 'm7', tipo: 'parcial_2', nombre: 'Parcial 2', estado: 'pendiente_fecha' },
  { id: 'e-m7-f', materiaId: 'm7', tipo: 'final', nombre: 'Examen Final Intensiva', fecha: '2026-10-31', estado: 'programado' },
]

const materiaStates: MateriaState[] = materias.map(m => ({
  materiaId: m.id,
  estado: 'cursando' as const,
  notas: '',
}))

export const SEED_DATA: AppStorage = {
  cuatrimestres: [c1],
  materias,
  evaluaciones,
  materiaStates,
  activeCuatrimestreId: 'c2-2026',
  version: 2,
}
