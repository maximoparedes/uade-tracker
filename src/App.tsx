import { useState } from 'react'
import { AppContext } from './context/AppContext'
import { useAppData } from './hooks/useAppData'
import { AppShell } from './components/layout/AppShell'
import { type ViewType } from './components/layout/NavBar'
import { Dashboard } from './views/Dashboard'
import { Calendario } from './views/Calendario'
import { TimelinePage } from './views/Timeline'
import { Materias } from './views/Materias'

export default function App() {
  const appData = useAppData()
  const [activeView, setActiveView] = useState<ViewType>('dashboard')

  return (
    <AppContext.Provider value={appData}>
      <AppShell activeView={activeView} onNavigate={setActiveView}>
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'calendario' && <Calendario />}
        {activeView === 'timeline' && <TimelinePage />}
        {activeView === 'materias' && <Materias />}
      </AppShell>
    </AppContext.Provider>
  )
}
