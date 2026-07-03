import { type ReactNode } from 'react'
import { NavBar, type ViewType } from './NavBar'
import { CuatrimestreTabs } from './CuatrimestreTabs'

interface AppShellProps {
  activeView: ViewType
  onNavigate: (v: ViewType) => void
  onSettings: () => void
  children: ReactNode
}

export function AppShell({ activeView, onNavigate, onSettings, children }: AppShellProps) {
  const showTabs = activeView !== 'carrera'
  return (
    <div className="app-bg min-h-svh flex flex-col md:flex-row">
      <NavBar active={activeView} onNavigate={onNavigate} onSettings={onSettings} />

      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {showTabs && <CuatrimestreTabs />}
        <div className={`flex-1 px-3 md:px-6 ${showTabs ? 'pt-4' : 'pt-5'}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
