'use client'
// src/components/ui/LoginScreen.tsx
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type Modo = 'login' | 'cadastro'

export default function LoginScreen() {
  const { login, cadastrar } = useAuth()

  const [modo,       setModo]       = useState<Modo>('login')
  const [email,      setEmail]      = useState('')
  const [senha,      setSenha]      = useState('')
  const [verSenha,   setVerSenha]   = useState(false)
  const [erro,       setErro]       = useState('')
  const [loading,    setLoading]    = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !senha.trim()) { setErro('Preencha o e-mail e a senha.'); return }
    setErro(''); setLoading(true)
    const resultado = modo === 'login'
      ? await login(email.trim(), senha)
      : await cadastrar(email.trim(), senha)
    setLoading(false)
    if (resultado) setErro(resultado)
  }

  return (
    <div className="flex flex-col justify-center h-full px-6 py-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🏗️</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">PedreiroPro</h1>
        <p className="text-gray-400 text-sm mt-1">Orçamentos e financeiro para pedreiros autônomos</p>
      </div>

      {/* Toggle Login / Cadastro */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
        {(['login', 'cadastro'] as Modo[]).map(m => (
          <button
            key={m}
            onClick={() => { setModo(m); setErro('') }}
            className={`flex-1 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${
              modo === m
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {m === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        ))}
      </div>

      {/* E-mail */}
      <label className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
        E-mail
      </label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="seu@email.com"
        autoCapitalize="none"
        autoCorrect="off"
        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3.5 text-[15px] mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
      />

      {/* Senha com olho */}
      <label className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
        Senha {modo === 'cadastro' && <span className="text-gray-400 font-normal">(mínimo 6 caracteres)</span>}
      </label>
      <div className="relative mb-4">
        <input
          type={verSenha ? 'text' : 'password'}
          value={senha}
          onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={modo === 'cadastro' ? 'Crie uma senha' : 'Sua senha'}
          className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3.5 pr-12 text-[15px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={() => setVerSenha(v => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400 mb-4">
          {erro}
        </div>
      )}

      {/* Botão */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-brand text-white rounded-xl py-4 text-[16px] font-semibold disabled:opacity-60 mb-4"
      >
        {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar minha conta'}
      </button>

      <p className="text-center text-xs text-gray-400 leading-relaxed">
        {modo === 'login'
          ? 'Não tem conta? Toque em "Criar conta" acima.'
          : 'Seus dados ficam salvos na nuvem em qualquer aparelho.'}
      </p>
    </div>
  )
}


