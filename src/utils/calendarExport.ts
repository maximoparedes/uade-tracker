import type { Evaluacion } from '../types'

function dateToICS(date: string, time?: string): string {
  const d = date.replace(/-/g, '')
  if (!time) return d
  const t = time.replace(':', '') + '00'
  return `${d}T${t}00`
}

function endTimeICS(date: string, time: string): string {
  const [h, m] = time.split(':').map(Number)
  const endH = String((h + 1) % 24).padStart(2, '0')
  const endM = String(m).padStart(2, '0')
  return `${date.replace(/-/g, '')}T${endH}${endM}00`
}

function nextDayICS(date: string): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

export function generateICS(evaluacion: Evaluacion, materiaName: string): string {
  const title = `UADE — ${materiaName} · ${evaluacion.nombre}`
  const isAllDay = !evaluacion.hora

  const dtstart = dateToICS(evaluacion.fecha!, evaluacion.hora)
  const dtend = isAllDay ? nextDayICS(evaluacion.fecha!) : endTimeICS(evaluacion.fecha!, evaluacion.hora!)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UADE Tracker//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    isAllDay ? `DTSTART;VALUE=DATE:${dtstart}` : `DTSTART:${dtstart}`,
    isAllDay ? `DTEND;VALUE=DATE:${dtend}` : `DTEND:${dtend}`,
    evaluacion.lugar ? `LOCATION:${evaluacion.lugar}` : null,
    evaluacion.observaciones ? `DESCRIPTION:${evaluacion.observaciones}` : null,
    `UID:uade-${evaluacion.id}@uade-tracker`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean) as string[]

  return lines.join('\r\n')
}

export function downloadICS(evaluacion: Evaluacion, materiaName: string) {
  const content = generateICS(evaluacion, materiaName)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${materiaName}-${evaluacion.nombre}.ics`
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9\-_.]/g, '')
  a.click()
  URL.revokeObjectURL(url)
}

export function getGoogleCalendarUrl(evaluacion: Evaluacion, materiaName: string): string {
  const title = encodeURIComponent(`UADE — ${materiaName} · ${evaluacion.nombre}`)
  const location = encodeURIComponent(evaluacion.lugar ?? '')
  const details = encodeURIComponent(evaluacion.observaciones ?? '')

  let dates: string
  if (evaluacion.hora) {
    const start = dateToICS(evaluacion.fecha!, evaluacion.hora)
    const end = endTimeICS(evaluacion.fecha!, evaluacion.hora)
    dates = `${start}/${end}`
  } else {
    const d = evaluacion.fecha!.replace(/-/g, '')
    dates = `${d}/${d}`
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&location=${location}&details=${details}`
}
