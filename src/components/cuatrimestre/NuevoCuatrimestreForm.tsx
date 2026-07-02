import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { FormField, Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props { onDone: () => void }

export function NuevoCuatrimestreForm({ onDone }: Props) {
  const { addCuatrimestre } = useAppContext()
  const [año, setAño] = useState(new Date().getFullYear())
  const [numero, setNumero] = useState<1 | 2>(1)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const isQ1 = numero === 1
    addCuatrimestre({
      nombre: `${numero === 1 ? '1er' : '2do'} Cuatrimestre ${año}`,
      año,
      numero,
      fechaInicio: isQ1 ? `${año}-03-01` : `${año}-08-01`,
      fechaFin: isQ1 ? `${año}-07-31` : `${año}-12-31`,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Año">
        <Input
          type="number"
          value={año}
          onChange={e => setAño(Number(e.target.value))}
          min={2024} max={2040}
          required
        />
      </FormField>
      <FormField label="Cuatrimestre">
        <Select value={numero} onChange={e => setNumero(Number(e.target.value) as 1 | 2)}>
          <option value={1}>1er Cuatrimestre (Mar–Jul)</option>
          <option value={2}>2do Cuatrimestre (Ago–Dic)</option>
        </Select>
      </FormField>
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" className="flex-1">Crear cuatrimestre</Button>
      </div>
    </form>
  )
}
