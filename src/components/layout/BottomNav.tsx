'use client'
// src/components/layout/BottomNav.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wrench, FileText, Image, DollarSign } from 'lucide-react'

const tabs = [
  { href: '/',           label: 'Início',     Icon: Home       },
  { href: '/servicos',   label: 'Serviços',   Icon: Wrench     },
  { href: '/orcamentos', label: 'Orçamentos', Icon: FileText   },
  { href: '/portfolio',  label: 'Portfólio',  Icon: Image      },
  { href: '/financeiro', label: 'Financeiro', Icon: DollarSign },
]

export default function BottomNav() {
  const path = usePathname()

  return (
    <nav className="flex border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
      {tabs.map(({ href, label, Icon }) => {
        const active = path === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-[3px] py-2.5 text-[10px] transition-colors ${
              active
                ? 'text-brand font-semibold'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
