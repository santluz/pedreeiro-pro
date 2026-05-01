// src/components/ui/index.tsx
import { ReactNode, ButtonHTMLAttributes } from 'react'

export function Card({
  children, className = '', onClick,
}: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 mb-3 ${onClick ? 'cursor-pointer active:bg-gray-50 dark:active:bg-gray-700' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function BtnPrimary({
  children, className = '', ...props
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

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">{children}</div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3 text-[15px] mb-3.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const { children, ...rest } = props
  return (
    <select
      {...rest}
      className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3 text-[15px] mb-3.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none"
    >
      {children}
    </select>
  )
}

export function Vazio({ emoji, texto, sub }: { emoji?: string; texto: string; sub?: string }) {
  return (
    <div className="text-center py-10 text-gray-400 dark:text-gray-500">
      {emoji && <div className="text-4xl mb-2 opacity-40">{emoji}</div>}
      <div className="text-sm">{texto}</div>
      {sub && <div className="text-xs mt-1 opacity-70">{sub}</div>}
    </div>
  )
}

export function Erro({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400 mb-3">
      {msg}
    </div>
  )
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

