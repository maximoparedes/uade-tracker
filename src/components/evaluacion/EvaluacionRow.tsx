import { useState, useRef, useEffect } from 'react'
import type { Evaluacion, EstadoEvaluacion } from '../../types'
import { formatDate } from '../../utils/dates'
import { downloadICS, getGoogleCalendarUrl } from '../../utils/calendarExport'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { EvaluacionForm } from './EvaluacionForm'
import { AlertCircle, Pencil, CheckCircle, XCircle, Clock, CalendarPlus } from 'lucide-react'

const ESTADO_CONFIG: Record<EstadoEvaluacion, { label: string; variant: 'cyan' | 'amber' | 'green' | 'red' | 'slate' | 'purple'; icon: typeof Clock }> = {
  pendiente_fecha: { label: 'Sin fecha', variant: 'amber', icon: AlertCircle },
  programado: { label: 'Programado', variant: 'cyan', icon: Clock },
  aprobado: { label: 'Aprobado', variant: 'green', icon: CheckCircle },
  desaprobado: { label: 'Desaprobado', variant: 'red', icon: XCircle },
  ausente: { label: 'Ausente', variant: 'slate', icon: XCircle },
  promocionado: { label: 'Promocionado', variant: 'purple', icon: CheckCircle },
}

interface Props {
  evaluacion: Evaluacion
  isConflict?: boolean
  materiaName?: string
}

export function EvaluacionRow({ evaluacion, isConflict, materiaName }: Props) {
  const [editing, setEditing] = useState(false)
  const [showCalMenu, setShowCalMenu] = useState(false)
  const calRef = useRef<HTMLDivElement>(null)
  const config = ESTADO_CONFIG[evaluacion.estado]
  const Icon = config.icon

  useEffect(() => {
    if (!showCalMenu) return
    function onClickOutside(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setShowCalMenu(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [showCalMenu])

  return (
    <>
      <div
        className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-navy-800/50 cursor-pointer transition-colors group ${
          isConflict ? 'border border-amber-400/20' : ''
        }`}
        onClick={() => setEditing(true)}
      >
        <div className="w-4 shrink-0">
          <Icon size={13} className={
            evaluacion.estado === 'aprobado' || evaluacion.estado === 'promocionado' ? 'text-green-400' :
            evaluacion.estado === 'desaprobado' ? 'text-red-400' :
            evaluacion.estado === 'pendiente_fecha' ? 'text-amber-400' :
            'text-cyan-400'
          } />
        </div>

        <div className="flex-1 min-w-0">
          <span className="font-display text-sm text-slate-200">{evaluacion.nombre}</span>
          {evaluacion.fecha && (
            <span className="font-mono text-xs text-slate-400 ml-2">{formatDate(evaluacion.fecha)}</span>
          )}
          {evaluacion.hora && (
            <span className="font-mono text-xs text-slate-500 ml-1">{evaluacion.hora}</span>
          )}
          {isConflict && (
            <span className="ml-2 font-mono text-[9px] text-amber-400 bg-amber-400/10 px-1.5 rounded">⚡ conflicto</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {evaluacion.nota !== undefined && (
            <span className="font-mono text-sm font-semibold text-white">{evaluacion.nota}</span>
          )}
          <Badge variant={config.variant}>{config.label}</Badge>

          {/* Calendar export button — only when date is set */}
          {evaluacion.fecha && materiaName && (
            <div
              ref={calRef}
              className="relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCalMenu(s => !s)}
                className="p-1 rounded text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Agregar al calendario"
              >
                <CalendarPlus size={12} />
              </button>

              {showCalMenu && (
                <div className="absolute right-0 bottom-full mb-1.5 z-30 bg-navy-800 border border-navy-600 rounded-xl shadow-2xl p-1.5 min-w-[170px]">
                  <p className="font-mono text-[9px] text-slate-500 uppercase tracking-wider px-2 pt-1 pb-1.5">
                    Agregar al calendario
                  </p>
                  <button
                    onClick={() => {
                      window.open(getGoogleCalendarUrl(evaluacion, materiaName), '_blank')
                      setShowCalMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-navy-700 transition-colors text-left"
                  >
                    {/* Google Calendar colored G icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="font-display text-xs text-slate-200">Google Calendar</span>
                  </button>
                  <button
                    onClick={() => {
                      downloadICS(evaluacion, materiaName)
                      setShowCalMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-navy-700 transition-colors text-left"
                  >
                    {/* Apple-style calendar icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="18" rx="3" fill="#FF3B30"/>
                      <rect x="2" y="4" width="20" height="6" rx="3" fill="#FF3B30"/>
                      <rect x="2" y="7" width="20" height="3" fill="#FF3B30"/>
                      <rect x="3" y="10" width="18" height="11" rx="2" fill="white"/>
                      <text x="12" y="19" textAnchor="middle" fill="#FF3B30" fontSize="8" fontWeight="bold" fontFamily="system-ui">
                        {new Date().getDate()}
                      </text>
                      <rect x="7" y="2" width="2" height="5" rx="1" fill="#636366"/>
                      <rect x="15" y="2" width="2" height="5" rx="1" fill="#636366"/>
                    </svg>
                    <span className="font-display text-xs text-slate-200">iOS / .ics</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <Pencil size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title={`Editar — ${evaluacion.nombre}`} size="md">
        <EvaluacionForm evaluacion={evaluacion} onDone={() => setEditing(false)} />
      </Modal>
    </>
  )
}
