const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MONTHS_FULL_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateShort(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatDateFull(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return `${String(d.getDate()).padStart(2, '0')} de ${MONTHS_FULL_ES[d.getMonth()]} ${d.getFullYear()}`
}

export function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = parseLocalDate(dateStr)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function isToday(dateStr: string): boolean {
  return daysUntil(dateStr) === 0
}

export function isPast(dateStr: string): boolean {
  return daysUntil(dateStr) < 0
}

export function isFuture(dateStr: string): boolean {
  return daysUntil(dateStr) > 0
}

export function monthLabel(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return MONTHS_ES[d.getMonth()]
}

export function monthFull(monthIndex: number): string {
  return MONTHS_FULL_ES[monthIndex]
}

export function dateToPercent(dateStr: string, startStr: string, endStr: string): number {
  const date = parseLocalDate(dateStr).getTime()
  const start = parseLocalDate(startStr).getTime()
  const end = parseLocalDate(endStr).getTime()
  return Math.max(0, Math.min(100, ((date - start) / (end - start)) * 100))
}

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
