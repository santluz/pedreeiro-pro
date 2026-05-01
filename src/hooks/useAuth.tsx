'use client'
// src/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

interface AuthCtx {
  user: User | null
  loading: boolean
  isAdmin: boolean
  login: (email: string, senha: string) => Promise<string | null>
  cadastrar: (email: string, senha: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => null,
  cadastrar: async () => null,
  logout: async () => {},
})

// E-mail do administrador definido no .env.local
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u)
      setIsAdmin(!!u && u.email === ADMIN_EMAIL)
      setLoading(false)
    })
    return unsub
  }, [])

  // ── Registra o usuário no Firestore para o admin gerenciar ──
  const registrarUsuario = async (u: User) => {
    const ref = doc(db, 'usuarios_registro', u.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        email: u.email,
        status: 'ativo',        // 'ativo' | 'bloqueado'
        criadoEm: serverTimestamp(),
      })
    }
  }

  // ── Verifica se o usuário está bloqueado ──
  const verificarBloqueio = async (u: User): Promise<boolean> => {
    // Admin nunca é bloqueado
    if (u.email === ADMIN_EMAIL) return false
    const ref  = doc(db, 'usuarios_registro', u.uid)
    const snap = await getDoc(ref)
    return snap.exists() && snap.data()?.status === 'bloqueado'
  }

  const login = async (email: string, senha: string): Promise<string | null> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha)
      await registrarUsuario(cred.user)
      const bloqueado = await verificarBloqueio(cred.user)
      if (bloqueado) {
        await signOut(auth)
        return 'Sua conta foi bloqueada. Entre em contato com o administrador.'
      }
      return null
    } catch (e: any) {
      const cod = e?.code || ''
      if (cod === 'auth/user-not-found')     return 'E-mail não cadastrado.'
      if (cod === 'auth/wrong-password')     return 'Senha incorreta.'
      if (cod === 'auth/invalid-email')      return 'E-mail inválido.'
      if (cod === 'auth/invalid-credential') return 'E-mail ou senha incorretos.'
      return 'Erro ao entrar. Tente novamente.'
    }
  }

  const cadastrar = async (email: string, senha: string): Promise<string | null> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha)
      await registrarUsuario(cred.user)
      return null
    } catch (e: any) {
      const cod = e?.code || ''
      if (cod === 'auth/email-already-in-use') return 'E-mail já cadastrado. Faça login.'
      if (cod === 'auth/weak-password')        return 'Senha fraca. Use pelo menos 6 caracteres.'
      if (cod === 'auth/invalid-email')        return 'E-mail inválido.'
      return 'Erro ao cadastrar. Tente novamente.'
    }
  }

  const logout = async () => { await signOut(auth) }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

