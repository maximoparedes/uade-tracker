import { useState } from 'react'
import { AppContext } from './context/AppContext'
import { useAppData } from './hooks/useAppData'
import { AppShell } from './components/layout/AppShell'
import { SettingsModal } from './components/layout/SettingsModal'
import { type ViewType } from './components/layout/NavBar'
import { Dashboard } from './views/Dashboard'
import { Calendario } from './views/Calendario'
import { TimelinePage } from './views/Timeline'
import { Materias } from './views/Materias'
import { Carrera } from './views/Carrera'

export default function App() {
  const appData = useAppData()
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [showSettings, setShowSettings] = useState(false)

  return (
    <AppContext.Provider value={appData}>
      <AppShell activeView={activeView} onNavigate={setActiveView} onSettings={() => setShowSettings(true)}>
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'calendario' && <Calendario />}
        {activeView === 'timeline' && <TimelinePage />}
        {activeView === 'materias' && <Materias />}
        {activeView === 'carrera' && <Carrera />}
      </AppShell>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </AppContext.Provider>
  )
}
