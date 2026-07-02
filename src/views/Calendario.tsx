import { useState } from 'react'
import { WeeklyCalendar } from '../components/calendar/WeeklyCalendar'
import { MonthlyCalendar } from '../components/calendar/MonthlyCalendar'

type CalView = 'semanal' | 'mensual'

export function Calendario() {
  const [view, setView] = useState<CalView>('mensual')

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-xl tracking-tight">Calendario</h1>
          <p className="font-mono text-xs text-slate-500 mt-0.5">
            {view === 'semanal' ? 'Hacé clic en una clase para ver el detalle' : 'Hacé clic en un día con eventos para ver el detalle'}
          </p>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-1 bg-navy-800 rounded-lg p-1 border border-navy-700">
          {(['mensual', 'semanal'] as CalView[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-display transition-colors capitalize ${
                view === v
                  ? 'bg-navy-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-navy-700 bg-navy-900/80 p-4 overflow-hidden">
        {view === 'mensual' && <MonthlyCalendar />}
        {view === 'semanal' && <WeeklyCalendar />}
      </div>
    </div>
  )
}
