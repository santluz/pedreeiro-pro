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
import { auth } from '@/lib/firebase'

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, senha: string) => Promise<string | null>
  cadastrar: (email: string, senha: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  login: async () => null,
  cadastrar: async () => null,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  // Retorna null se ok, ou mensagem de erro amigável
  const login = async (email: string, senha: string): Promise<string | null> => {
    try {
      await signInWithEmailAndPassword(auth, email, senha)
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
      await createUserWithEmailAndPassword(auth, email, senha)
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
    <AuthContext.Provider value={{ user, loading, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
