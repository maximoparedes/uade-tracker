import { useAppContext } from '../../context/AppContext'
import { COLORS } from '../../utils/colors'
import type { DiaSemana } from '../../types'

const JS_DAY: Record<number, DiaSemana | null> = {
  0: null, 1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie', 6: 'sab',
}
const DAY_LABEL: Record<DiaSemana, string> = {
  lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado',
}

export function HorarioHoy() {
  const { activeMaterias } = useAppContext()

  // Memoize to avoid recalculating on every render
  const { today, tomorrow } = (() => {
    const jsDay = new Date().getDay()
    return { today: JS_DAY[jsDay], tomorrow: JS_DAY[(jsDay + 1) % 7] }
  })()

  function getClases(dia: DiaSemana | null) {
    if (!dia) return []
    return activeMaterias
      .flatMap(m => m.horarios
        .filter(h => h.dia === dia)
        .map(h => ({ mat: m, horario: h }))
      )
      .sort((a, b) => a.horario.inicio.localeCompare(b.horario.inicio))
  }

  // Also check intensivas active today
  function getIntensivasActivas(dia: DiaSemana | null) {
    const todayStr = new Date().toISOString().slice(0, 10)
    return activeMaterias.filter(m =>
      m.periodoIntensivo &&
      todayStr >= m.periodoIntensivo.desde &&
      todayStr <= m.periodoIntensivo.hasta &&
      dia !== null
    )
  }

  const clasesHoy = getClases(today)
  const intensivasHoy = getIntensivasActivas(today)
  const clasesManana = getClases(tomorrow)

  const hayHoy = clasesHoy.length > 0 || intensivasHoy.length > 0

  return (
    <div className="rounded-2xl border border-white/6 bg-white/[0.025] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-display">Clases</span>
        <span className="text-xs text-slate-600 font-display">
          {today ? DAY_LABEL[today] : 'Domingo'}
        </span>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Hoy */}
        {hayHoy ? (
          <div className="space-y-2">
            {clasesHoy.map(({ mat, horario }) => {
              const c = COLORS[mat.color]
              return (
                <div key={`${mat.id}-${horario.inicio}`} className="flex items-center gap-3">
                  <div className={`w-1 self-stretch rounded-full ${c.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm text-white truncate">{mat.nombre}</p>
                    <p className="text-xs text-slate-500 font-display">{horario.inicio} – {horario.fin}</p>
                  </div>
                  <span className={`text-xs font-display px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                    {mat.tipo === 'virtual' ? 'Online' : mat.aula ?? ''}
                  </span>
                </div>
              )
            })}
            {intensivasHoy.map((mat) => {
              const c = COLORS[mat.color]
              return (
                <div key={`int-${mat.id}`} className="flex items-center gap-3">
                  <div className={`w-1 self-stretch rounded-full ${c.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm text-white truncate">{mat.nombre}</p>
                    <p className="text-xs text-slate-500 font-display">
                      {mat.periodoIntensivo!.inicio} – {mat.periodoIntensivo!.fin} · Intensiva
                    </p>
                  </div>
                  <span className={`text-xs font-display px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                    {mat.aula ?? 'Intensiva'}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500 font-display">Sin clases hoy</p>
        )}

        {/* Mañana — solo si hay algo */}
        {clasesManana.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-600 font-display uppercase tracking-wider mb-2">
              Mañana — {tomorrow ? DAY_LABEL[tomorrow] : ''}
            </p>
            <div className="space-y-2">
              {clasesManana.map(({ mat, horario }) => {
                const c = COLORS[mat.color]
                return (
                  <div key={`${mat.id}-${horario.inicio}`} className="flex items-center gap-3 opacity-60">
                    <div className={`w-1 self-stretch rounded-full ${c.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-slate-300 truncate">{mat.nombre}</p>
                      <p className="text-xs text-slate-500 font-display">{horario.inicio} – {horario.fin}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
