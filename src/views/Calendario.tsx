import { WeeklyCalendar } from '../components/calendar/WeeklyCalendar'

export function Calendario() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display font-bold text-white text-xl tracking-tight">Calendario semanal</h1>
        <p className="font-mono text-xs text-slate-500 mt-0.5">Hacé clic en una clase para ver el detalle</p>
      </div>
      <div className="rounded-xl border border-navy-700 bg-navy-900/80 p-4 overflow-hidden">
        <WeeklyCalendar />
      </div>
    </div>
  )
}
