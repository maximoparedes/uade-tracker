import { useState, useRef, useEffect, useMemo } from 'react'
import { CheckCircle2, Circle, BookOpen, Award, Lock, Search, X } from 'lucide-react'
import { CARRERA_SUBJECTS, AÑOS_LABEL } from '../data/carreraData'
import { useCarreraData } from '../hooks/useCarreraData'
import type { EstadoCarrera, CarreraSubjectState } from '../hooks/useCarreraData'
import type { CarreraSubject } from '../data/carreraData'

const ESTADO_CFG: Record<EstadoCarrera, { label: string; dot: string; text: string; ring: string; btn: string }> = {
  pendiente: { label: 'Pendiente', dot: 'bg-slate-600',  text: 'text-slate-500', ring: 'border-white/6',       btn: 'bg-slate-600 text-white' },
  cursando:  { label: 'Cursando',  dot: 'bg-cyan-400',   text: 'text-cyan-400',  ring: 'border-cyan-400/30',   btn: 'bg-cyan-400 text-[#0e0e16]' },
  aprobada:  { label: 'Aprobada',  dot: 'bg-green-400',  text: 'text-green-400', ring: 'border-green-400/30',  btn: 'bg-green-400 text-[#0e0e16]' },
}

interface SubjectCardProps {
  subject: CarreraSubject
  state: CarreraSubjectState
  unlocked: boolean
  missing: string[]
  highlighted?: boolean
  onSetState: (estado: EstadoCarrera, nota?: number) => void
}

function SubjectCard({ subject, state, unlocked, missing, highlighted, onSetState }: SubjectCardProps) {
  const [open, setOpen] = useState(false)
  const [notaInput, setNotaInput] = useState(state.nota !== undefined ? String(state.nota) : '')
  const cfg = ESTADO_CFG[state.estado]

  // Bug 4 fix: sync nota input when state changes externally (e.g. via cuatrimestre sync)
  useEffect(() => {
    setNotaInput(state.nota !== undefined ? String(state.nota) : '')
  }, [state.nota])

  function selectEstado(e: EstadoCarrera) {
    if (e === 'aprobada') {
      const n = parseFloat(notaInput)
      onSetState('aprobada', isNaN(n) ? undefined : n)
    } else {
      onSetState(e)
      setOpen(false)
    }
  }

  function handleNotaChange(val: string) {
    setNotaInput(val)
    const n = parseFloat(val)
    // Bug 5 fix: clamp to valid range before saving
    if (!isNaN(n)) {
      const clamped = Math.min(10, Math.max(1, n))
      onSetState('aprobada', clamped)
    }
  }

  return (
    <div
      className={`rounded-2xl border bg-white/[0.025] transition-all cursor-pointer select-none ${
        highlighted ? 'border-green-400/50 shadow-[0_0_12px_rgba(74,222,128,0.2)]' :
        open ? 'border-white/12' : cfg.ring
      } ${!unlocked && state.estado === 'pendiente' ? 'opacity-60' : ''}`}
      onClick={() => setOpen(o => !o)}
    >
      <div className="px-3 pt-3 pb-2.5">
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <span className="text-[10px] font-mono text-slate-600 leading-none mt-0.5">
            {subject.codigo}
          </span>
          {!unlocked && state.estado === 'pendiente' ? (
            <Lock size={11} className="text-slate-600 shrink-0 mt-0.5" />
          ) : (
            <div className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${cfg.dot}`} />
          )}
        </div>
        <p className="font-display text-sm text-slate-200 leading-snug">{subject.nombre}</p>
        {state.estado === 'aprobada' && state.nota !== undefined && (
          <p className="text-xs font-display font-bold text-green-400 mt-1">{state.nota}</p>
        )}
        {state.estado === 'cursando' && (
          <p className="text-[11px] font-display text-cyan-400 mt-1">Cursando</p>
        )}
      </div>

      {open && (
        <div
          className="border-t border-white/6 px-3 py-2.5"
          onClick={e => e.stopPropagation()}
        >
          {!unlocked && missing.length > 0 && (
            <p className="text-[10px] text-amber-400/80 font-display mb-2 leading-snug">
              Requiere: {missing.join(', ')}
            </p>
          )}
          <div className="flex gap-1.5 mb-2">
            {(['pendiente', 'cursando', 'aprobada'] as EstadoCarrera[]).map(e => (
              <button
                key={e}
                onClick={() => selectEstado(e)}
                className={`flex-1 text-[11px] font-display py-1.5 rounded-lg transition-all ${
                  state.estado === e
                    ? cfg.btn + ' font-semibold'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {ESTADO_CFG[e].label}
              </button>
            ))}
          </div>
          {state.estado === 'aprobada' && (
            <input
              type="number"
              min={1} max={10} step={0.25}
              placeholder="Nota (ej: 8)"
              value={notaInput}
              onChange={e => handleNotaChange(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-green-400/30 font-display"
              onClick={e => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  )
}

function RingProgress({ value, total, size = 64 }: { value: number; total: number; size?: number }) {
  const pct = total ? value / total : 0
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#34d399" strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }} />
    </svg>
  )
}

export function Carrera() {
  const {
    states, getState, setSubjectState, isUnlocked, getMissingCorrelativas,
    stats, analistaCompleto, analistaAprobadas, analistaTotal,
  } = useCarreraData()
  const [focusAño, setFocusAño] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [newlyUnlocked, setNewlyUnlocked] = useState<Set<string>>(new Set())
  const prevStates = useRef<typeof states>({})
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Detect newly unlocked subjects when states change
  useEffect(() => {
    const justUnlocked = new Set<string>()
    for (const sub of CARRERA_SUBJECTS) {
      const wasLocked = sub.correlativas.some(
        cId => (prevStates.current[cId]?.estado ?? 'pendiente') !== 'aprobada'
      )
      const nowUnlocked = isUnlocked(sub.id)
      const currentEstado = states[sub.id]?.estado ?? 'pendiente'
      if (wasLocked && nowUnlocked && currentEstado === 'pendiente') {
        justUnlocked.add(sub.id)
      }
    }
    if (justUnlocked.size > 0) {
      setNewlyUnlocked(justUnlocked)
      const t = setTimeout(() => setNewlyUnlocked(new Set()), 2500)
      return () => clearTimeout(t)
    }
    prevStates.current = states
  }, [states, isUnlocked])

  const searchResults = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return CARRERA_SUBJECTS.filter(s =>
      s.nombre.toLowerCase().includes(q) || s.codigo.toLowerCase().includes(q)
    )
  }, [search])

  function jumpToAño(año: number) {
    setFocusAño(año)
    setSearch('')
    sectionRefs.current[año - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const pct = stats.total ? Math.round((stats.aprobadas / stats.total) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* Hero */}
      <div className="rounded-2xl border border-white/6 bg-white/[0.025] p-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <RingProgress value={stats.aprobadas} total={stats.total} />
            <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-green-400">
              {pct}%
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white text-base leading-tight">Ingeniería en Informática</p>
            <p className="text-xs text-slate-400 font-display mb-2">Plan 1621 · UADE</p>
            <div className="flex flex-wrap gap-3 text-xs font-display">
              <span><span className="text-green-400 font-semibold">{stats.aprobadas}</span> <span className="text-slate-500">aprobadas</span></span>
              <span><span className="text-cyan-400 font-semibold">{stats.cursando}</span> <span className="text-slate-500">cursando</span></span>
              <span><span className="text-slate-400 font-semibold">{stats.total - stats.aprobadas - stats.cursando}</span> <span className="text-slate-500">pendientes</span></span>
              {stats.promedio !== null && (
                <span>
                  <span className="text-amber-400 font-semibold">
                    {stats.promedio}
                  </span>{' '}
                  <span className="text-slate-500">promedio</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Analista badge */}
        <div className={`mt-3 flex items-center gap-2.5 rounded-xl px-3 py-2 border ${
          analistaCompleto ? 'bg-amber-400/10 border-amber-400/25' : 'bg-white/3 border-white/6'
        }`}>
          <Award size={14} className={analistaCompleto ? 'text-amber-400' : 'text-slate-600'} />
          <div>
            <p className={`text-xs font-display font-medium ${analistaCompleto ? 'text-amber-400' : 'text-slate-500'}`}>
              Analista en Informática {analistaCompleto ? '· Completado ✓' : `· ${analistaAprobadas}/${analistaTotal}`}
            </p>
            {!analistaCompleto && (
              <p className="text-[10px] text-slate-600 font-display">Se obtiene al completar materias de 1er a 3er año</p>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar materia o código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/16 font-display"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search results */}
      {searchResults && (
        <div className="space-y-1">
          {searchResults.length === 0 ? (
            <p className="text-sm text-slate-500 font-display px-1">Sin resultados.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {searchResults.map(sub => (
                <SubjectCard
                  key={sub.id}
                  subject={sub}
                  state={getState(sub.id)}
                  unlocked={isUnlocked(sub.id)}
                  missing={getMissingCorrelativas(sub.id)}
                  highlighted={newlyUnlocked.has(sub.id)}
                  onSetState={(estado, nota) => setSubjectState(sub.id, estado, nota)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Year pills */}
      {!searchResults && (
        <>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {([1,2,3,4,5] as const).map(año => {
            const y = stats.byAño[año-1]
            return (
              <button
                key={año}
                onClick={() => jumpToAño(año)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display transition-all ${
                  focusAño === año ? 'bg-white/12 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/8 hover:text-slate-200'
                }`}
              >
                <span>{AÑOS_LABEL[año]}</span>
                {y.aprobadas > 0 && (
                  <span className="text-green-400 font-semibold ml-0.5">{y.aprobadas}/{y.total}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Roadmap */}
        <div className="relative">
          <div className="absolute left-[19px] top-5 bottom-5 w-px bg-white/5 hidden sm:block" />
          <div className="space-y-10">
            {([1,2,3,4,5] as const).map((año, i) => {
              const y = stats.byAño[i]
              const subjects = CARRERA_SUBJECTS.filter(s => s.año === año)
              const yearPct = y.total ? Math.round((y.aprobadas / y.total) * 100) : 0
              const complete = y.aprobadas === y.total
              const active = y.cursando > 0

              return (
                <div key={año} ref={el => { sectionRefs.current[i] = el }} className="scroll-mt-4">
                  {/* Year header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`hidden sm:flex w-10 h-10 shrink-0 rounded-full items-center justify-center border-2 z-10 transition-all ${
                      complete ? 'bg-green-400/15 border-green-400/50' :
                      active   ? 'bg-cyan-400/10 border-cyan-400/30' :
                                 'bg-white/3 border-white/10'
                    }`}>
                      {complete ? <CheckCircle2 size={16} className="text-green-400" /> :
                       active   ? <BookOpen size={16} className="text-cyan-400" /> :
                                  <Circle size={16} className="text-slate-600" />}
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display font-semibold text-white text-sm">{AÑOS_LABEL[año]}</p>
                        <p className="text-xs text-slate-500 font-display">
                          {y.aprobadas}/{y.total} aprobadas{y.cursando > 0 && ` · ${y.cursando} cursando`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 h-1.5 rounded-full bg-white/6 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${yearPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-display text-slate-500 w-7 text-right">{yearPct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Analista milestone */}
                  {año === 3 && (
                    <div className={`mb-3 sm:ml-14 flex items-center gap-2 rounded-xl px-3 py-2 border text-xs font-display ${
                      analistaCompleto
                        ? 'bg-amber-400/10 border-amber-400/25 text-amber-400'
                        : 'bg-white/3 border-white/6 text-slate-500'
                    }`}>
                      <Award size={12} />
                      <span>Analista en Informática — {analistaCompleto ? 'Completado ✓' : `faltan ${analistaTotal - analistaAprobadas} materias`}</span>
                    </div>
                  )}

                  {/* Subject grid */}
                  <div className="sm:ml-14 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {subjects.map(sub => (
                      <SubjectCard
                        key={sub.id}
                        subject={sub}
                        state={getState(sub.id)}
                        unlocked={isUnlocked(sub.id)}
                        missing={getMissingCorrelativas(sub.id)}
                        highlighted={newlyUnlocked.has(sub.id)}
                        onSetState={(estado, nota) => setSubjectState(sub.id, estado, nota)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        </>
      )}
    </div>
  )
}
