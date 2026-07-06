import { useState } from 'react'
import { GraduationCap, ChevronRight } from 'lucide-react'
import type { User } from 'firebase/auth'
import type { Cuatrimestre } from '../types'

const now = new Date()
const year = now.getFullYear()
const isFirstHalf = now.getMonth() < 6

function buildCuatrimestre(numero: 1 | 2, yr: number): Cuatrimestre {
  return {
    id: `c${numero}-${yr}`,
    nombre: `${numero === 1 ? '1er' : '2do'} Cuatrimestre ${yr}`,
    año: yr,
    numero,
    fechaInicio: numero === 1 ? `${yr}-03-01` : `${yr}-08-03`,
    fechaFin: numero === 1 ? `${yr}-07-31` : `${yr}-12-31`,
  }
}

const CUATRIMESTRE_OPTIONS: Cuatrimestre[] = [
  buildCuatrimestre(1, year - 1),
  buildCuatrimestre(2, year - 1),
  buildCuatrimestre(1, year),
  buildCuatrimestre(2, year),
  buildCuatrimestre(1, year + 1),
]

const DEFAULT_CUATRI_ID = isFirstHalf ? `c1-${year}` : `c2-${year}`

interface Props {
  user: User
  onComplete: (nombre: string, cuatrimestre: Cuatrimestre) => Promise<void>
}

export function Onboarding({ user, onComplete }: Props) {
  const defaultNombre = user.displayName ?? ''
  const [nombre, setNombre] = useState(defaultNombre)
  const [cuatriId, setCuatriId] = useState(DEFAULT_CUATRI_ID)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) { setError('Ingresá tu nombre.'); return }
    const cuatri = CUATRIMESTRE_OPTIONS.find(c => c.id === cuatriId)
    if (!cuatri) return
    setLoading(true)
    setError('')
    try {
      await onComplete(nombre.trim(), cuatri)
    } catch {
      setError('Ocurrió un error. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh app-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto">
            <GraduationCap size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-xl tracking-tight">
              {user.displayName ? `Hola, ${user.displayName.split(' ')[0]}` : 'Bienvenido'}
            </h1>
            <p className="text-slate-400 font-display text-sm mt-1">
              Contanos un poco sobre tu cursada
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 space-y-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-display">Tu nombre</label>
            <input
              type="text"
              placeholder="Ej: Máximo"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 font-display"
            />
          </div>

          {/* Carrera */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-display">Carrera</label>
            <div className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-slate-300 font-display flex items-center justify-between">
              <span>Ingeniería en Informática</span>
              <span className="text-xs text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">Plan 1621</span>
            </div>
            <p className="text-[10px] text-slate-600 font-display">Más carreras próximamente</p>
          </div>

          {/* Cuatrimestre */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-display">Cuatrimestre actual</label>
            <select
              value={cuatriId}
              onChange={e => setCuatriId(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 font-display appearance-none cursor-pointer"
            >
              {CUATRIMESTRE_OPTIONS.map(c => (
                <option key={c.id} value={c.id} className="bg-[#16161f] text-white">
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-display">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#0e0e16] font-display font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Configurando...' : <>Comenzar <ChevronRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
