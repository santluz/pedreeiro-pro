// src/components/ui/index.tsx
// Componentes pequenos reutilizados nas páginas

import { ReactNode, ButtonHTMLAttributes } from 'react'

/* ── Card ─────────────────────────────────────────────── */
export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-100 rounded-2xl p-4 mb-3 ${onClick ? 'cursor-pointer active:bg-gray-50' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

/* ── BtnPrimary ───────────────────────────────────────── */
export function BtnPrimary({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={`w-full bg-brand text-white rounded-xl py-4 text-[16px] font-semibold flex items-center justify-center gap-2 mb-3 active:bg-brand-dark disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

/* ── Label ────────────────────────────────────────────── */
export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-[13px] font-medium text-gray-500 mb-1.5">{children}</div>
  )
}

/* ── Input ────────────────────────────────────────────── */
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-[15px] mb-3.5 bg-white"
    />
  )
}

/* ── Select ───────────────────────────────────────────── */
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const { children, ...rest } = props
  return (
    <select
      {...rest}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-[15px] mb-3.5 bg-white appearance-none"
    >
      {children}
    </select>
  )
}

/* ── Vazio ────────────────────────────────────────────── */
export function Vazio({ emoji, texto, sub }: { emoji?: string; texto: string; sub?: string }) {
  return (
    <div className="text-center py-10 text-gray-400">
      {emoji && <div className="text-4xl mb-2 opacity-40">{emoji}</div>}
      <div className="text-sm">{texto}</div>
      {sub && <div className="text-xs mt-1 opacity-70">{sub}</div>}
    </div>
  )
}

/* ── Erro ─────────────────────────────────────────────── */
export function Erro({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-3">
      {msg}
    </div>
  )
}

/* ── Loading ──────────────────────────────────────────── */
export function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
