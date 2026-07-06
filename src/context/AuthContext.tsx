import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

interface AuthContextType {
  user: User | null
  authLoading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u)
      setAuthLoading(false)
    })
  }, [])

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signUpWithEmail(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
