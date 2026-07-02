export interface CarreraSubject {
  id: string
  codigo: string
  nombre: string
  año: 1 | 2 | 3 | 4 | 5
  esOptativa?: boolean
}

export const CARRERA_SUBJECTS: CarreraSubject[] = [
  // ── 1er Año ──────────────────────────────────────────────────────────────
  { id: 'c-099', codigo: '3.4.099', nombre: 'Fundamentos de Informática I',     año: 1 },
  { id: 'c-164', codigo: '3.4.164', nombre: 'Sistemas de Información I',         año: 1 },
  { id: 'c-002', codigo: '2.1.002', nombre: 'Pensamiento Crítico y Comunicación',año: 1 },
  { id: 'c-043', codigo: '3.4.043', nombre: 'Teoría de Sistemas',                año: 1 },
  { id: 'c-050', codigo: '3.1.050', nombre: 'Elementos de Álgebra y Geometría',  año: 1 },
  { id: 'c-071', codigo: '3.4.071', nombre: 'Programación I',                    año: 1 },
  { id: 'c-121', codigo: '3.3.121', nombre: 'Sistemas de Representación',        año: 1 },
  { id: 'c-178', codigo: '3.2.178', nombre: 'Fundamentos de Química',            año: 1 },
  { id: 'c-072', codigo: '3.4.072', nombre: 'Arquitectura de Computadores',      año: 1 },
  { id: 'c-024', codigo: '3.1.024', nombre: 'Matemática Discreta',               año: 1 },
  { id: 'c-051', codigo: '3.1.051', nombre: 'Álgebra',                           año: 1 },

  // ── 2do Año ──────────────────────────────────────────────────────────────
  { id: 'c-074', codigo: '3.4.074', nombre: 'Programación II',                   año: 2 },
  { id: 'c-207', codigo: '3.4.207', nombre: 'Sistemas de Información II',        año: 2 },
  { id: 'c-075', codigo: '3.4.075', nombre: 'Sistemas Operativos',               año: 2 },
  { id: 'c-052', codigo: '3.1.052', nombre: 'Física I',                          año: 2 },
  { id: 'c-053', codigo: '3.1.053', nombre: 'Cálculo I',                         año: 2 },
  { id: 'c-077', codigo: '3.4.077', nombre: 'Programación III',                  año: 2 },
  { id: 'c-208', codigo: '3.4.208', nombre: 'Paradigma Orientado a Objetos',     año: 2 },
  { id: 'c-078', codigo: '3.4.078', nombre: 'Fundamentos de Telecomunicaciones', año: 2 },
  { id: 'c-209', codigo: '3.4.209', nombre: 'Ingeniería de Datos I',             año: 2 },
  { id: 'c-054', codigo: '3.1.054', nombre: 'Cálculo II',                        año: 2 },

  // ── 3er Año ──────────────────────────────────────────────────────────────
  { id: 'c-210', codigo: '3.4.210', nombre: 'Proceso de Desarrollo de Software', año: 3 },
  { id: 'c-211', codigo: '3.4.211', nombre: 'Seminario de Integración Profesional', año: 3 },
  { id: 'c-212', codigo: '3.4.212', nombre: 'Teleinformática y Redes',           año: 3 },
  { id: 'c-213', codigo: '3.4.213', nombre: 'Ingeniería de Datos II',            año: 3 },
  { id: 'c-049', codigo: '3.1.049', nombre: 'Probabilidad y Estadística',        año: 3 },
  { id: 'c-082', codigo: '3.4.082', nombre: 'Aplicaciones Interactivas',         año: 3 },
  { id: 'c-214', codigo: '3.4.214', nombre: 'Ingeniería de Software',            año: 3 },
  { id: 'c-055', codigo: '3.1.055', nombre: 'Física II',                         año: 3 },
  { id: 'c-215', codigo: '3.4.215', nombre: 'Teoría de la Computación',          año: 3 },
  { id: 'c-056', codigo: '3.1.056', nombre: 'Estadística Avanzada',              año: 3 },

  // ── 4to Año ──────────────────────────────────────────────────────────────
  { id: 'c-216', codigo: '3.4.216', nombre: 'Desarrollo de Aplicaciones I',      año: 4 },
  { id: 'c-089', codigo: '3.4.089', nombre: 'Dirección de Proyectos Informáticos', año: 4 },
  { id: 'c-217', codigo: '3.4.217', nombre: 'Ciencia de Datos',                  año: 4 },
  { id: 'c-092', codigo: '3.4.092', nombre: 'Seguridad e Integridad de la Información', año: 4 },
  { id: 'c-025', codigo: '3.1.025', nombre: 'Modelado y Simulación',             año: 4 },
  { id: 'c-218', codigo: '3.4.218', nombre: 'Desarrollo de Aplicaciones II',     año: 4 },
  { id: 'c-088', codigo: '3.4.088', nombre: 'Evaluación de Proyectos Informáticos', año: 4 },
  { id: 'c-096', codigo: '3.4.096', nombre: 'Inteligencia Artificial',           año: 4 },
  { id: 'c-opt1',codigo: 'OPT',     nombre: 'Optativa (1)',                      año: 4, esOptativa: true },
  { id: 'c-219', codigo: '3.4.219', nombre: 'Tecnología y Medio Ambiente',       año: 4 },

  // ── 5to Año ──────────────────────────────────────────────────────────────
  { id: 'c-094', codigo: '3.4.094', nombre: 'Arquitectura de Aplicaciones',      año: 5 },
  { id: 'c-220', codigo: '3.4.220', nombre: 'Tendencias Tecnológicas',           año: 5 },
  { id: 'c-100', codigo: '3.4.100', nombre: 'Proyecto Final de Ingeniería',      año: 5 },
  { id: 'c-pps', codigo: 'PPS06',   nombre: 'Práctica Profesional Supervisada',  año: 5 },
  { id: 'c-opt2',codigo: 'OPT',     nombre: 'Optativa (2)',                      año: 5, esOptativa: true },
  { id: 'c-098', codigo: '3.4.098', nombre: 'Calidad de Software',               año: 5 },
  { id: 'c-221', codigo: '3.4.221', nombre: 'Negocios Tecnológicos',             año: 5 },
  { id: 'c-135', codigo: '3.4.135', nombre: 'Tecnología e Innovación',           año: 5 },
  { id: 'c-opt3',codigo: 'OPT',     nombre: 'Optativa (3)',                      año: 5, esOptativa: true },
  { id: 'c-2056',codigo: '2.3.056', nombre: 'Derecho Informático',               año: 5 },
]

export const AÑOS_LABEL: Record<1|2|3|4|5, string> = {
  1: '1er Año',
  2: '2do Año',
  3: '3er Año',
  4: '4to Año',
  5: '5to Año',
}
