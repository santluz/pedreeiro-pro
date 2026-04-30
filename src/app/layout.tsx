// src/app/layout.tsx
// Layout raiz: cabeçalho + barra de navegação inferior (mobile-first)

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'PedreiroPro',
  description: 'Orçamentos, financeiro e portfólio para pedreiros autônomos',
  themeColor: '#E67E22',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-100 h-dvh flex flex-col">
        <AuthProvider>
          {/* Container central — limita largura em desktop */}
          <div className="flex flex-col h-dvh max-w-[480px] w-full mx-auto bg-white shadow-xl">
            <Header />
            {/* Área de conteúdo com scroll */}
            <main className="flex-1 overflow-y-auto p-4">
              {children}
            </main>
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
