import { LayoutDashboard, Calendar, GitCommitHorizontal, BookOpen } from 'lucide-react'

export type ViewType = 'dashboard' | 'calendario' | 'timeline' | 'materias'

const ITEMS = [
  { id: 'dashboard' as ViewType, label: 'Inicio', icon: LayoutDashboard },
  { id: 'calendario' as ViewType, label: 'Calendario', icon: Calendar },
  { id: 'timeline' as ViewType, label: 'Línea de tiempo', icon: GitCommitHorizontal },
  { id: 'materias' as ViewType, label: 'Materias', icon: BookOpen },
]

interface NavBarProps {
  active: ViewType
  onNavigate: (v: ViewType) => void
}

export function NavBar({ active, onNavigate }: NavBarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col gap-1 w-52 shrink-0 pt-6 px-3 sidebar-bg">
        <div className="px-3 pb-5 mb-2 border-b border-white/5">
          <p className="font-display font-bold text-white text-lg tracking-tight leading-none">UADE</p>
          <p className="font-display text-slate-400 text-xs mt-0.5">Tracker de cursada</p>
        </div>
        {ITEMS.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display transition-all text-left ${
                isActive
                  ? 'bg-white/8 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-cyan-400' : ''} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0e0e16]/90 backdrop-blur-xl border-t border-white/6 flex safe-area-pb">
        {ITEMS.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          const shortLabel = item.label.split(' ')[0]
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-display transition-colors ${
                isActive ? 'text-white' : 'text-slate-500'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-cyan-400' : ''} />
              <span>{shortLabel}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
