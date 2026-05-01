// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/hooks/useTheme'
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-gray-100 dark:bg-gray-950 h-dvh flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-col h-dvh max-w-[480px] w-full mx-auto bg-white dark:bg-gray-900 shadow-xl">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
                {children}
              </main>
              <BottomNav />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
