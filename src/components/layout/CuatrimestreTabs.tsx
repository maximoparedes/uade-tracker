import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { Modal } from '../ui/Modal'
import { NuevoCuatrimestreForm } from '../cuatrimestre/NuevoCuatrimestreForm'

export function CuatrimestreTabs() {
  const { cuatrimestres, activeCuatrimestreId, setActiveCuatrimestre, deleteCuatrimestre } = useAppContext()
  const [showForm, setShowForm] = useState(false)

  function handleDelete(id: string) {
    if (cuatrimestres.length <= 1) return
    if (!confirm('¿Eliminar este cuatrimestre y todas sus materias?')) return
    deleteCuatrimestre(id)
  }

  return (
    <>
      <div className="flex items-center gap-1 px-3 pt-3 pb-0 overflow-x-auto scrollbar-hide">
        {cuatrimestres.map(c => (
          <div
            key={c.id}
            className={`group flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-t-lg border text-xs font-mono cursor-pointer transition-all ${
              c.id === activeCuatrimestreId
                ? 'bg-navy-900 border-cyan-400/30 border-b-navy-900 text-cyan-400'
                : 'bg-navy-950 border-navy-700 text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveCuatrimestre(c.id)}
          >
            <span>{c.nombre}</span>
            {cuatrimestres.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); handleDelete(c.id) }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-1"
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setShowForm(true)}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-t-lg border border-navy-700 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/30 text-xs font-mono transition-colors"
        >
          <Plus size={12} />
          Nuevo
        </button>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nuevo Cuatrimestre" size="sm">
        <NuevoCuatrimestreForm onDone={() => setShowForm(false)} />
      </Modal>
    </>
  )
}
