import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { MateriaCard } from '../components/materia/MateriaCard'
import { MateriaForm } from '../components/materia/MateriaForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'

export function Materias() {
  const { activeMaterias, activeCuatrimestreId } = useAppContext()
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-white text-xl tracking-tight">Materias</h1>
          <p className="font-mono text-xs text-slate-500 mt-0.5">
            {activeMaterias.length} materias · Hacé clic para ver detalles y editar evaluaciones
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowAdd(true)}>
          <Plus size={14} />
          Agregar
        </Button>
      </div>

      {activeMaterias.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy-600 p-12 text-center">
          <p className="font-display text-slate-400 mb-3">Este cuatrimestre no tiene materias</p>
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Agregar primera materia
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {activeMaterias.map(mat => (
            <MateriaCard key={mat.id} materia={mat} />
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nueva materia" size="lg">
        <MateriaForm cuatrimestreId={activeCuatrimestreId} onDone={() => setShowAdd(false)} />
      </Modal>
    </div>
  )
}
