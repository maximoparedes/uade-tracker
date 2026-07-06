import { useState } from 'react'
import { Mail, Lock, AlertCircle, BookOpen } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'

export function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuthContext()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function friendlyError(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Email o contraseña incorrectos.'
      case 'auth/email-already-in-use': return 'Ya existe una cuenta con ese email.'
      case 'auth/weak-password': return 'La contraseña debe tener al menos 6 caracteres.'
      case 'auth/invalid-email': return 'El email no es válido.'
      case 'auth/popup-closed-by-user': return ''
      default: return 'Ocurrió un error. Intentá de nuevo.'
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? ''
      const msg = friendlyError(code)
      if (msg) setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? ''
      setError(friendlyError(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh app-bg flex flex-col items-center justify-center p-4">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
          <BookOpen size={18} className="text-cyan-400" />
        </div>
        <div>
          <p className="font-display font-bold text-white text-lg leading-none tracking-tight">UADE Tracker</p>
          <p className="font-display text-slate-500 text-xs mt-0.5">Seguimiento de cursada</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/6">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-3 text-sm font-display transition-colors ${
                  mode === m
                    ? 'text-white border-b-2 border-cyan-400 -mb-px'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-display font-medium text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continuar con Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-xs text-slate-600 font-display">o</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 font-display"
                />
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 font-display"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-display">
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0e0e16] font-display font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 font-display mt-4">
          Ingeniería en Informática · UADE · Plan 1621
        </p>
      </div>
    </div>
  )
}
