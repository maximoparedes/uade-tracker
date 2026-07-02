import { LayoutDashboard, Calendar, GitCommitHorizontal, BookOpen } from 'lucide-react'

export type ViewType = 'dashboard' | 'calendario' | 'timeline' | 'materias'

const ITEMS = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendario' as ViewType, label: 'Calendario', icon: Calendar },
  { id: 'timeline' as ViewType, label: 'Timeline', icon: GitCommitHorizontal },
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
      <nav className="hidden md:flex flex-col gap-1 w-52 shrink-0 pt-6 px-3">
        <div className="px-3 pb-4 mb-2 border-b border-navy-700">
          <span className="font-display font-bold text-white text-base tracking-tight">UADE</span>
          <span className="font-mono text-cyan-400 text-xs ml-2">TRACKER</span>
        </div>
        {ITEMS.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display transition-colors text-left ${
                isActive
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-navy-700'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-navy-900/95 backdrop-blur border-t border-navy-700 flex">
        {ITEMS.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-display transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
