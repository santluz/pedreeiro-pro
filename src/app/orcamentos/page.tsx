'use client'
// src/app/orcamentos/page.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoginScreen from '@/components/ui/LoginScreen'
import { Card, BtnPrimary, Vazio, Loading } from '@/components/ui'
import { colOrcamentos, getDocs, doc, deleteDoc, db } from '@/lib/firebase'
import { Orcamento } from '@/lib/types'
import { fmtMoeda, fmtData } from '@/lib/utils'

export default function OrcamentosPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orcamentos,  setOrcamentos]  = useState<Orcamento[]>([])
  const [carregando,  setCarregando]  = useState(true)
  const [confirmId,   setConfirmId]   = useState<string | null>(null)

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

  const excluir = async (orc: Orcamento, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirmId !== orc.id) {
      setConfirmId(orc.id)
      // Reseta confirmação após 3 segundos sem clicar
      setTimeout(() => setConfirmId(null), 3000)
      return
    }
    // Remove lançamento no financeiro se existir
    if (orc.lancamentoId) {
      try { await deleteDoc(doc(db, 'users', user.uid, 'financeiro', orc.lancamentoId)) } catch {}
    }
    await deleteDoc(doc(db, 'users', user.uid, 'orcamentos', orc.id))
    setOrcamentos(prev => prev.filter(o => o.id !== orc.id))
    setConfirmId(null)
  }

  const pendentes  = orcamentos.filter(o => !o.status || o.status === 'pendente')
  const concluidos = orcamentos.filter(o => o.status === 'concluido')

  const renderCard = (o: Orcamento) => {
    const concluido = o.status === 'concluido'
    const confirmando = confirmId === o.id
    return (
      <Card key={o.id} onClick={() => router.push(`/orcamentos/${o.id}`)}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {concluido
                ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                : <Clock size={15} className="text-amber-500 flex-shrink-0" />
              }
              <div className="text-[15px] font-semibold dark:text-gray-100 truncate">{o.cliente}</div>
            </div>
            {o.descricao && (
              <div className="text-[12px] text-gray-400 truncate ml-5">{o.descricao}</div>
            )}
            <div className="text-[12px] text-gray-400 mt-1 ml-5">
              {fmtData(o.data)} · {o.itens.length} serviço{o.itens.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="text-[17px] font-bold text-brand">{fmtMoeda(o.total)}</div>
            {/* Botão excluir — toque 1x pede confirmação, toque 2x exclui */}
            <button
              onClick={e => excluir(o, e)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                confirmando
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 dark:bg-red-950 text-red-500 border border-red-200 dark:border-red-800'
              }`}
            >
              <Trash2 size={11} />
              {confirmando ? 'Confirmar?' : 'Excluir'}
            </button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <BtnPrimary onClick={() => router.push('/orcamentos/novo')}>
        <Plus size={18} strokeWidth={2.5} /> Novo Orçamento
      </BtnPrimary>

      {orcamentos.length === 0 && (
        <Vazio emoji="📋" texto="Nenhum orçamento criado ainda" sub="Toque no botão acima para criar o primeiro" />
      )}

      {pendentes.length > 0 && (
        <>
          <div className="text-[12px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 mt-2 px-1">
            ⏳ Pendentes ({pendentes.length})
          </div>
          {pendentes.map(renderCard)}
        </>
      )}

      {concluidos.length > 0 && (
        <>
          <div className="text-[12px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 mt-4 px-1">
            ✅ Concluídos ({concluidos.length})
          </div>
          {concluidos.map(renderCard)}
        </>
      )}
    </div>
  )
}
