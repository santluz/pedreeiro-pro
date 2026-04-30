'use client'
// src/app/orcamentos/page.tsx — Lista de orçamentos

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoginScreen from '@/components/ui/LoginScreen'
import { Card, BtnPrimary, Vazio, Loading } from '@/components/ui'
import { colOrcamentos, getDocs } from '@/lib/firebase'
import { Orcamento } from '@/lib/types'
import { fmtMoeda, fmtData } from '@/lib/utils'

export default function OrcamentosPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orcamentos,  setOrcamentos]  = useState<Orcamento[]>([])
  const [carregando,  setCarregando]  = useState(true)

  useEffect(() => {
    if (!user) return
    getDocs(colOrcamentos(user.uid)).then(snap => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() } as Orcamento))
      lista.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      setOrcamentos(lista)
      setCarregando(false)
    })
  }, [user])

  if (loading)    return <Loading />
  if (!user)      return <LoginScreen />
  if (carregando) return <Loading />

  return (
    <div>
      <BtnPrimary onClick={() => router.push('/orcamentos/novo')}>
        <Plus size={18} strokeWidth={2.5} /> Novo Orçamento
      </BtnPrimary>

      {orcamentos.length === 0 && (
        <Vazio emoji="📋" texto="Nenhum orçamento criado ainda" sub="Toque no botão acima para criar o primeiro" />
      )}

      {orcamentos.map(o => (
        <Card key={o.id} onClick={() => router.push(`/orcamentos/${o.id}`)}>
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold">{o.cliente}</div>
              {o.descricao && (
                <div className="text-[12px] text-gray-400 truncate">{o.descricao}</div>
              )}
              <div className="text-[12px] text-gray-400 mt-1.5">
                {fmtData(o.data)} · {o.itens.length} serviço{o.itens.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[18px] font-bold text-brand">{fmtMoeda(o.total)}</div>
              <div className="text-[11px] text-gray-400 mt-1">Ver detalhes →</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
