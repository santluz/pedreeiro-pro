'use client'
// src/components/layout/Header.tsx

import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { LogOut, Moon, Sun, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { user, logout, isAdmin } = useAuth()
  const { dark, toggle } = useTheme()
  const router = useRouter()

  return (
    <header className="bg-brand text-white px-4 py-3 flex items-center justify-between flex-shrink-0 min-h-[54px]">
      <div>
        <div className="text-[17px] font-semibold leading-tight">PedreiroPro</div>
        {user && (
          <div className="text-[11px] opacity-75 truncate max-w-[180px]">
            {user.email}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Botão modo escuro */}
        <button
          onClick={toggle}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title={dark ? 'Modo claro' : 'Modo escuro'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Botão admin — só aparece para o e-mail administrador */}
        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Painel Admin"
          >
            <ShieldCheck size={18} />
          </button>
        )}

        {/* Botão sair */}
        {user && (
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  )
}

