'use client'
// src/components/ui/InputMoeda.tsx
// Input para valores monetários no formato brasileiro (R$ 1.250,90)
// Aceita vírgula ou ponto como separador decimal

import { useRef } from 'react'

interface Props {
  value: string           // valor como string (ex: "1250.90")
  onChange: (v: string) => void  // devolve sempre com ponto (ex: "1250.90")
  placeholder?: string
  className?: string
}

export function InputMoeda({ value, onChange, placeholder = '0,00', className = '' }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  // Exibe o valor com vírgula para o usuário
  const exibir = (v: string) => {
    if (!v) return ''
    return v.replace('.', ',')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value

    // Remove tudo que não for número, vírgula ou ponto
    raw = raw.replace(/[^\d.,]/g, '')

    // Aceita só uma vírgula ou ponto (usa o último como decimal)
    const partes = raw.split(/[.,]/)
    if (partes.length > 2) {
      raw = partes.slice(0, -1).join('') + ',' + partes[partes.length - 1]
    }

    // Converte para ponto internamente (para cálculos)
    const comPonto = raw.replace(',', '.')

    onChange(comPonto)
  }

  // Ao sair do campo, formata com 2 casas decimais
  const handleBlur = () => {
    if (!value) return
    const num = parseFloat(value)
    if (!isNaN(num)) {
      onChange(num.toFixed(2))
    }
  }

  return (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"   // abre teclado numérico no celular
      value={exibir(value)}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3 text-[15px] mb-3.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${className}`}
    />
  )
}

// Input para quantidade (inteiro ou decimal)
export function InputQtd({
  value,
  onChange,
  placeholder = '1',
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d.,]/g, '')
    const partes = raw.split(/[.,]/)
    if (partes.length > 2) {
      raw = partes.slice(0, -1).join('') + ',' + partes[partes.length - 1]
    }
    onChange(raw.replace(',', '.'))
  }

  const handleBlur = () => {
    if (!value) return
    const num = parseFloat(value)
    if (!isNaN(num)) onChange(String(num))
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={value.replace('.', ',')}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3 text-[15px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 ${className}`}
    />
  )
}
