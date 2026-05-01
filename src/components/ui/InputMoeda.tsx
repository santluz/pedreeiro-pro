'use client'
// src/components/ui/InputMoeda.tsx
// Input monetário brasileiro — aceita vírgula e ponto, teclado numérico no celular

import { useState } from 'react'

const baseClass = `w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3 
  text-[15px] mb-3.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
  placeholder-gray-400 dark:placeholder-gray-500`

/* ── Input de valor monetário (R$) ───────────────────── */
export function InputMoeda({
  value,
  onChange,
  placeholder = '0,00',
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  // Estado interno para exibição (com vírgula)
  const [display, setDisplay] = useState(() =>
    value ? value.replace('.', ',') : ''
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value

    // Permite apenas números, vírgula e ponto
    raw = raw.replace(/[^\d,]/g, '')

    // Permite apenas uma vírgula
    const partes = raw.split(',')
    if (partes.length > 2) {
      raw = partes[0] + ',' + partes.slice(1).join('')
    }

    // Limita casas decimais a 2
    if (partes.length === 2 && partes[1].length > 2) {
      raw = partes[0] + ',' + partes[1].slice(0, 2)
    }

    setDisplay(raw)

    // Converte para número com ponto para cálculos internos
    const comPonto = raw.replace(',', '.')
    onChange(comPonto)
  }

  const handleBlur = () => {
    const num = parseFloat(display.replace(',', '.'))
    if (!isNaN(num)) {
      const formatado = num.toFixed(2).replace('.', ',')
      setDisplay(formatado)
      onChange(num.toFixed(2))
    }
  }

  const handleFocus = () => {
    // Ao focar, remove o zero se estiver vazio
    if (display === '0,00') setDisplay('')
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={`${baseClass} ${className}`}
    />
  )
}

/* ── Input de quantidade (inteiro ou decimal) ────────── */
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
  const [display, setDisplay] = useState(() =>
    value ? value.replace('.', ',') : ''
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d,]/g, '')
    const partes = raw.split(',')
    if (partes.length > 2) raw = partes[0] + ',' + partes[1]
    setDisplay(raw)
    onChange(raw.replace(',', '.'))
  }

  const handleBlur = () => {
    const num = parseFloat(display.replace(',', '.'))
    if (!isNaN(num)) {
      const formatado = String(num).replace('.', ',')
      setDisplay(formatado)
      onChange(String(num))
    }
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3 
        text-[15px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
        placeholder-gray-400 ${className}`}
    />
  )
}

