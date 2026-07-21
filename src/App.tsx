import { useState } from 'react'
import type { User } from 'firebase/auth'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { AppContext } from './context/AppContext'
import { useAppData } from './hooks/useAppData'
import { AppShell } from './components/layout/AppShell'
import { SettingsModal } from './components/layout/SettingsModal'
import { type ViewType } from './components/layout/NavBar'
import { Login } from './views/Login'
import { Onboarding } from './views/Onboarding'
import { Dashboard } from './views/Dashboard'
import { Calendario } from './views/Calendario'
import { TimelinePage } from './views/Timeline'
import { Materias } from './views/Materias'
import { Carrera } from './views/Carrera'
import type { Cuatrimestre } from './types'

function SplashScreen() {
  return (
    <div className="min-h-svh app-bg flex items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto animate-pulse">
          <span className="font-display font-bold text-cyan-400 text-lg">U</span>
        </div>
        <p className="text-slate-600 font-display text-sm">Cargando...</p>
      </div>
    </div>
  )
}

function AuthenticatedApp({ user }: { user: User }) {
  const appData = useAppData(user.uid)
  const { logout } = useAuthContext()
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [showSettings, setShowSettings] = useState(false)

  if (appData.dataLoading) return <SplashScreen />

  if (appData.needsOnboarding) {
    const handleComplete = async (nombre: string, cuatrimestre: Cuatrimestre) => {
      await appData.initializeUser(nombre, cuatrimestre)
    }
    return <Onboarding user={user} onComplete={handleComplete} />
  }

  return (
    <AppContext.Provider value={appData}>
      <AppShell
        activeView={activeView}
        onNavigate={setActiveView}
        onSettings={() => setShowSettings(true)}
        onLogout={logout}
        user={user}
        saveStatus={appData.saveStatus}
      >
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

function AppRouter() {
  const { user, authLoading } = useAuthContext()

  if (authLoading) return <SplashScreen />
  if (!user) return <Login />
  return <AuthenticatedApp user={user} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
