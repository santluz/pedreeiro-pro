'use client'
// src/components/ui/InputMoeda.tsx
// Input monetário brasileiro — só aceita vírgula como decimal

const baseClass = `w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3 
  text-[15px] mb-3.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
  placeholder-gray-400 dark:placeholder-gray-500`

/* ── Formata centavos: "1234" → "12,34" ── */
function centavosParaDisplay(centavos: string): string {
  const nums = centavos.replace(/\D/g, '')
  if (!nums) return ''
  const num = parseInt(nums, 10)
  return (num / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/* ── Input de valor monetário (R$) ── */
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
  // Converte o valor numérico (ex: "45.50") em centavos para exibição
  const toDisplay = (v: string) => {
    if (!v || v === '0') return ''
    const num = parseFloat(v)
    if (isNaN(num)) return ''
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Pega só os dígitos digitados
    const apenasNumeros = e.target.value.replace(/\D/g, '')
    if (!apenasNumeros) { onChange(''); return }

    // Trata como centavos: "1234" = R$ 12,34
    const centavos = parseInt(apenasNumeros, 10)
    const reais = centavos / 100
    onChange(reais.toFixed(2))
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={toDisplay(value)}
      onChange={handleChange}
      placeholder={placeholder}
      className={`${baseClass} ${className}`}
    />
  )
}

/* ── Input de quantidade ── */
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
    // Permite números e vírgula
    const raw = e.target.value.replace(/[^\d,]/g, '')
    const partes = raw.split(',')
    // Máximo uma vírgula
    const limpo = partes.length > 2
      ? partes[0] + ',' + partes.slice(1).join('')
      : raw
    onChange(limpo.replace(',', '.'))
  }

  const display = value ? value.replace('.', ',') : ''

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3 
        text-[15px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
        placeholder-gray-400 ${className}`}
    />
  )
}


