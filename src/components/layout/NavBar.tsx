import { LayoutDashboard, Calendar, GitCommitHorizontal, BookOpen, Map, Settings, LogOut } from 'lucide-react'
import type { User } from 'firebase/auth'

export type ViewType = 'dashboard' | 'calendario' | 'timeline' | 'materias' | 'carrera'

const ITEMS = [
  { id: 'dashboard' as ViewType, label: 'Inicio',     icon: LayoutDashboard },
  { id: 'calendario' as ViewType, label: 'Calendario', icon: Calendar },
  { id: 'timeline' as ViewType,  label: 'Timeline',   icon: GitCommitHorizontal },
  { id: 'materias' as ViewType,  label: 'Materias',   icon: BookOpen },
  { id: 'carrera' as ViewType,   label: 'Carrera',    icon: Map },
]

interface NavBarProps {
  active: ViewType
  onNavigate: (v: ViewType) => void
  onSettings: () => void
  onLogout: () => void
  user: User
}

function UserAvatar({ user, size = 28 }: { user: User; size?: number }) {
  const initials = (user.displayName ?? user.email ?? 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  if (user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName ?? 'Avatar'}
        width={size} height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-cyan-400/15 border border-cyan-400/20 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="text-cyan-400 font-display font-bold" style={{ fontSize: size * 0.4 }}>
        {initials}
      </span>
    </div>
  )
}

export function NavBar({ active, onNavigate, onSettings, onLogout, user }: NavBarProps) {
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
                  ? 'bg-white/8 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-cyan-400' : ''} />
              {item.label}
            </button>
          )
        })}

        {/* Bottom: settings + user */}
        <div className="mt-auto pb-4 pt-3 border-t border-white/5 space-y-1">
          <button
            onClick={onSettings}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display text-slate-400 hover:text-white hover:bg-white/5 transition-all w-full text-left"
          >
            <Settings size={16} />
            Opciones
          </button>

          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/3">
            <UserAvatar user={user} size={28} />
            <div className="flex-1 min-w-0">
              <p className="font-display text-xs text-white truncate leading-tight">
                {user.displayName?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'Usuario'}
              </p>
              <p className="font-display text-[10px] text-slate-600 truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0e0e16]/90 backdrop-blur-xl border-t border-white/6 flex safe-area-pb">
        {ITEMS.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-display transition-colors ${
                isActive ? 'text-white' : 'text-slate-500'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-cyan-400' : ''} />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          )
        })}
        <button
          onClick={onSettings}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-display text-slate-500"
        >
          <UserAvatar user={user} size={20} />
          <span>Yo</span>
        </button>
      </nav>
    </>
  )
}
