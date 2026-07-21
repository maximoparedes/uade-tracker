import { type ReactNode } from 'react'
import { NavBar, type ViewType } from './NavBar'
import { CuatrimestreTabs } from './CuatrimestreTabs'
import type { User } from 'firebase/auth'
import type { SaveStatus } from '../../hooks/useAppData'

interface AppShellProps {
  activeView: ViewType
  onNavigate: (v: ViewType) => void
  onSettings: () => void
  onLogout: () => void
  user: User
  saveStatus: SaveStatus
  children: ReactNode
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  return (
    <div className={`fixed top-3 right-3 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all ${
      status === 'saving' ? 'bg-navy-800 border border-navy-600 text-slate-400' :
      status === 'saved'  ? 'bg-green-400/10 border border-green-400/20 text-green-400' :
                            'bg-red-400/10 border border-red-400/30 text-red-400'
    }`}>
      {status === 'saving' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />}
      {status === 'saved'  && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
      {status === 'error'  && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
      {status === 'saving' ? 'Guardando...' : status === 'saved' ? 'Guardado' : 'Error al guardar'}
    </div>
  )
}

export function AppShell({ activeView, onNavigate, onSettings, onLogout, user, saveStatus, children }: AppShellProps) {
  const showTabs = activeView !== 'carrera'
  return (
    <div className="app-bg min-h-svh flex flex-col md:flex-row">
      <SaveIndicator status={saveStatus} />
      <NavBar
        active={activeView}
        onNavigate={onNavigate}
        onSettings={onSettings}
        onLogout={onLogout}
        user={user}
      />
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {showTabs && <CuatrimestreTabs />}
        <div className={`flex-1 px-3 md:px-6 ${showTabs ? 'pt-4' : 'pt-5'}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
