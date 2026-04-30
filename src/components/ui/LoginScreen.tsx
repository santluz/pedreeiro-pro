'use client'
// src/components/ui/LoginScreen.tsx
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

type Modo = 'login' | 'cadastro'

export default function LoginScreen() {
  const { login, cadastrar } = useAuth()

  const [modo,   setModo]   = useState<Modo>('login')
  const [email,  setEmail]  = useState('')
  const [senha,  setSenha]  = useState('')
  const [erro,   setErro]   = useState('')
  const [loading,setLoading]= useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha o e-mail e a senha.')
      return
    }
    setErro('')
    setLoading(true)

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
        <h1 className="text-2xl font-bold text-gray-800">PedreiroPro</h1>
        <p className="text-gray-400 text-sm mt-1">
          Orçamentos e financeiro para pedreiros autônomos
        </p>
      </div>

      {/* Toggle Login / Cadastro */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        {(['login', 'cadastro'] as Modo[]).map(m => (
          <button
            key={m}
            onClick={() => { setModo(m); setErro('') }}
            className={`flex-1 py-2.5 rounded-lg text-[14px] font-semibold transition-all ${
              modo === m
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400'
            }`}
          >
            {m === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        ))}
      </div>

      {/* Formulário */}
      <div className="space-y-0">
        <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">
          E-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="seu@email.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] mb-4"
          autoCapitalize="none"
          autoCorrect="off"
        />

        <label className="text-[13px] font-medium text-gray-500 mb-1.5 block">
          Senha {modo === 'cadastro' && <span className="text-gray-400 font-normal">(mínimo 6 caracteres)</span>}
        </label>
        <input
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={modo === 'cadastro' ? 'Crie uma senha' : 'Sua senha'}
          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] mb-4"
        />
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
          {erro}
        </div>
      )}

      {/* Botão principal */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-brand text-white rounded-xl py-4 text-[16px] font-semibold disabled:opacity-60 mb-4"
      >
        {loading
          ? 'Aguarde...'
          : modo === 'login' ? 'Entrar' : 'Criar minha conta'
        }
      </button>

      {/* Dica */}
      <p className="text-center text-xs text-gray-400 leading-relaxed">
        {modo === 'login'
          ? 'Não tem conta ainda? Toque em "Criar conta" acima.'
          : 'Seus dados ficam salvos na nuvem e aparecem em qualquer aparelho.'
        }
      </p>
    </div>
  )
}
