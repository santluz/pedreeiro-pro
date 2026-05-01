'use client'
// src/hooks/useTheme.tsx
// Gerencia o modo escuro. Salva a preferência no navegador.

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeCtx {
  dark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeCtx>({ dark: false, toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false)

  // Carrega preferência salva ao iniciar
  useEffect(() => {
    const salvo = localStorage.getItem('pedreeiro_dark')
    const prefereDark = salvo
      ? salvo === 'true'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(prefereDark)
    document.documentElement.classList.toggle('dark', prefereDark)
  }, [])

  const toggle = () => {
    const novo = !dark
    setDark(novo)
    localStorage.setItem('pedreeiro_dark', String(novo))
    document.documentElement.classList.toggle('dark', novo)
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
