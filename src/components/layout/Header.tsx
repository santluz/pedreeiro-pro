'use client'
// src/components/layout/Header.tsx

import { useAuth } from '@/hooks/useAuth'
import { LogOut } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-brand text-white px-4 py-3 flex items-center justify-between flex-shrink-0 min-h-[54px]">
      <div>
        <div className="text-[17px] font-semibold leading-tight">PedreiroPro</div>
        {user && (
          <div className="text-[11px] opacity-75 truncate max-w-[200px]">
            {user.displayName || user.email}
          </div>
        )}
      </div>
      {user && (
        <button
          onClick={logout}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      )}
    </header>
  )
}
