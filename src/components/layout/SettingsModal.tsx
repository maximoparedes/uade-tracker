import { useRef, useState } from 'react'
import { Download, Upload, Share2, Check } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { useAppContext } from '../../context/AppContext'
import { useCarreraData } from '../../hooks/useCarreraData'

const CUATRI_KEY = 'uade-tracker-v1'
const CARRERA_KEY = 'uade-carrera-v1'

interface Props { isOpen: boolean; onClose: () => void }

export function SettingsModal({ isOpen, onClose }: Props) {
  const { activeCuatrimestre, activeMaterias, getMateriaState } = useAppContext()
  const { stats } = useCarreraData()
  const fileRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [imported, setImported] = useState(false)
  const [importError, setImportError] = useState('')

  function exportData() {
    const backup = {
      cuatrimestre: localStorage.getItem(CUATRI_KEY),
      carrera: localStorage.getItem(CARRERA_KEY),
      exportedAt: new Date().toISOString(),
      version: 1,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uade-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError('')
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const backup = JSON.parse(ev.target?.result as string)
        if (!backup.cuatrimestre && !backup.carrera) throw new Error('Archivo inválido')
        if (backup.cuatrimestre) localStorage.setItem(CUATRI_KEY, backup.cuatrimestre)
        if (backup.carrera) localStorage.setItem(CARRERA_KEY, backup.carrera)
        setImported(true)
        setTimeout(() => window.location.reload(), 1000)
      } catch {
        setImportError('Archivo inválido o corrupto.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function shareProgress() {
    const cursando = activeMaterias.filter(m => getMateriaState(m.id).estado === 'cursando')
    const pct = stats.total ? Math.round((stats.aprobadas / stats.total) * 100) : 0
    const bar = '▓'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))
    const text = [
      `📚 UADE Tracker`,
      `${activeCuatrimestre?.nombre ?? 'Cursada'} — Ingeniería en Informática`,
      ``,
      `Carrera: ${bar} ${pct}% (${stats.aprobadas}/${stats.total})`,
      stats.promedio ? `Promedio: ${stats.promedio}` : '',
      ``,
      `Cursando: ${cursando.map(m => m.nombre.split(' ').slice(0, 2).join(' ')).join(', ')}`,
    ].filter(Boolean).join('\n')

    try {
      if (navigator.share) {
        await navigator.share({ title: 'UADE Tracker', text })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch { /* user cancelled share */ }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Opciones" size="sm">
      <div className="space-y-3">
        {/* Share */}
        <button
          onClick={shareProgress}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors text-left"
        >
          {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} className="text-cyan-400" />}
          <div>
            <p className="font-display text-sm text-white">{copied ? '¡Copiado!' : 'Compartir progreso'}</p>
            <p className="text-xs text-slate-500 font-display">Compartí tu avance en la carrera</p>
          </div>
        </button>

        {/* Export */}
        <button
          onClick={exportData}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors text-left"
        >
          <Download size={16} className="text-violet-400" />
          <div>
            <p className="font-display text-sm text-white">Exportar datos</p>
            <p className="text-xs text-slate-500 font-display">Guardá un backup en JSON</p>
          </div>
        </button>

        {/* Import */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors text-left"
        >
          {imported
            ? <Check size={16} className="text-green-400" />
            : <Upload size={16} className="text-amber-400" />}
          <div>
            <p className="font-display text-sm text-white">
              {imported ? 'Importado — recargando...' : 'Importar datos'}
            </p>
            <p className="text-xs text-slate-500 font-display">Restaurá desde un backup JSON</p>
          </div>
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importData} />

        {importError && (
          <p className="text-xs text-red-400 font-display px-1">{importError}</p>
        )}

        <p className="text-[10px] text-slate-600 font-display px-1 pb-1">
          Los datos se guardan en este navegador. Exportá regularmente para no perderlos.
        </p>
      </div>
    </Modal>
  )
}
