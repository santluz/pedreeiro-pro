'use client'
// src/app/page.tsx — Dashboard (página inicial)

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import LoginScreen from '@/components/ui/LoginScreen'
import { Loading, Card } from '@/components/ui'
import { db, colFinanceiro, colOrcamentos, colServicos, getDocs } from '@/lib/firebase'
import { Lancamento, Orcamento, Servico } from '@/lib/types'
import { fmtMoeda, fmtData, isNestesMes } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [orcamentos,  setOrcamentos]  = useState<Orcamento[]>([])
  const [servicos,    setServicos]    = useState<Servico[]>([])
  const [carregando,  setCarregando]  = useState(true)

  useEffect(() => {
    if (!user) return
    const carregar = async () => {
      const [sSnap, oSnap, fSnap] = await Promise.all([
        getDocs(colServicos(user.uid)),
        getDocs(colOrcamentos(user.uid)),
        getDocs(colFinanceiro(user.uid)),
      ])
      setServicos(sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Servico)))
      setOrcamentos(oSnap.docs.map(d => ({ id: d.id, ...d.data() } as Orcamento)))
      setLancamentos(fSnap.docs.map(d => ({ id: d.id, ...d.data() } as Lancamento)))
      setCarregando(false)
    }
    carregar()
  }, [user])

  if (loading) return <Loading />
  if (!user)   return <LoginScreen />
  if (carregando) return <Loading />

  // Cálculos do mês atual
  const finMes = lancamentos.filter(f => isNestesMes(f.data))
  const entradas = finMes.filter(f => f.tipo === 'entrada').reduce((s, f) => s + f.valor, 0)
  const despesas = finMes.filter(f => f.tipo === 'despesa').reduce((s, f) => s + f.valor, 0)
  const saldo    = entradas - despesas

  const agora   = new Date()
  const orcMes  = orcamentos.filter(o => isNestesMes(o.data))
  const recentes = [...orcamentos]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5)

  const mes = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* ── Hero: saldo do mês ── */}
      <div className="bg-brand text-white rounded-2xl p-6 mb-3">
        <div className="text-[13px] opacity-80">Saldo deste mês</div>
        <div className="text-[38px] font-bold tracking-tight my-1">{fmtMoeda(saldo)}</div>
        <div className="text-[12px] opacity-70 capitalize">{mes}</div>
      </div>

      {/* ── Estatísticas rápidas ── */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {[
          { label: 'Entradas',            valor: fmtMoeda(entradas), cor: 'text-green-600' },
          { label: 'Despesas',            valor: fmtMoeda(despesas), cor: 'text-red-500'   },
          { label: 'Serviços cadastrados',valor: servicos.length,    cor: 'text-brand'     },
          { label: 'Orçamentos no mês',   valor: orcMes.length,      cor: 'text-blue-600'  },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3.5 text-center">
            <div className="text-[11px] text-gray-500 mb-1">{s.label}</div>
            <div className={`text-xl font-bold ${s.cor}`}>{s.valor}</div>
          </div>
        ))}
      </div>

      {/* ── Últimos orçamentos ── */}
      <Card>
        <div className="text-[14px] font-semibold mb-3">Últimos orçamentos</div>
        {recentes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhum orçamento ainda. Vá em "Orçamentos" para criar o primeiro.
          </p>
        ) : (
          recentes.map(o => (
            <div
              key={o.id}
              className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-none cursor-pointer"
              onClick={() => router.push(`/orcamentos/${o.id}`)}
            >
              <div>
                <div className="text-[14px] font-medium">{o.cliente}</div>
                <div className="text-[12px] text-gray-400">{fmtData(o.data)}</div>
              </div>
              <div className="text-[16px] font-bold text-brand">{fmtMoeda(o.total)}</div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
