'use client'
// src/app/orcamentos/[id]/page.tsx — Detalhes do orçamento

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Printer, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoginScreen from '@/components/ui/LoginScreen'
import { Card, Loading } from '@/components/ui'
import { db, doc, deleteDoc, updateDoc, getDocs, addDoc, colOrcamentos, colFinanceiro } from '@/lib/firebase'
import { Orcamento, tipoUnid } from '@/lib/types'
import { fmtMoeda, fmtData, hoje, gerarPDF } from '@/lib/utils'

export default function VerOrcamentoPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [orc,         setOrc]         = useState<Orcamento | null>(null)
  const [carregando,  setCarregando]  = useState(true)
  const [confirmDel,  setConfirmDel]  = useState(false)
  const [salvando,    setSalvando]    = useState(false)

  useEffect(() => {
    if (!user) return
    getDocs(colOrcamentos(user.uid)).then(snap => {
      const encontrado = snap.docs.find(d => d.id === id)
      if (encontrado) setOrc({ id: encontrado.id, ...encontrado.data() } as Orcamento)
      setCarregando(false)
    })
  }, [user, id])

  if (loading)    return <Loading />
  if (!user)      return <LoginScreen />
  if (carregando) return <Loading />
  if (!orc)       return <p className="text-center text-gray-400 py-10">Orçamento não encontrado.</p>

  const concluido = orc.status === 'concluido'

  // ── Marcar como concluído → cria entrada no financeiro ──
  const marcarConcluido = async () => {
    if (concluido) return
    setSalvando(true)
    try {
      const lancamento = {
        tipo: 'entrada' as const,
        desc: `Serviço concluído — ${orc.cliente}`,
        valor: orc.total,
        data: hoje(),
        orcamentoId: orc.id,
        criadoEm: new Date().toISOString(),
      }
      const lancRef = await addDoc(colFinanceiro(user.uid), lancamento)
      await updateDoc(doc(db, 'users', user.uid, 'orcamentos', id), {
        status: 'concluido',
        lancamentoId: lancRef.id,
      })
      setOrc(prev => prev ? { ...prev, status: 'concluido' as const, lancamentoId: lancRef.id } : prev)
    } catch (err: any) {
      alert('Erro ao concluir: ' + (err?.message || 'Verifique as regras do Firestore.'))
    } finally {
      setSalvando(false)
    }
  }

  // ── Reverter para pendente → remove a entrada do financeiro ──
  const marcarPendente = async () => {
    setSalvando(true)

    // Remove o lançamento do financeiro se existir
    if (orc.lancamentoId) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'financeiro', orc.lancamentoId))
      } catch { /* ignora se já não existir */ }
    }

    // Atualiza o orçamento
    await updateDoc(doc(db, 'users', user.uid, 'orcamentos', id), {
      status: 'pendente',
      lancamentoId: null,
    })

    setOrc(prev => prev ? { ...prev, status: 'pendente', lancamentoId: undefined } : prev)
    setSalvando(false)
  }

  // ── Excluir ──
  const excluir = async () => {
    if (!confirmDel) { setConfirmDel(true); return }
    // Remove o lançamento associado se existir
    if (orc.lancamentoId) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'financeiro', orc.lancamentoId))
      } catch { /* ignora */ }
    }
    await deleteDoc(doc(db, 'users', user.uid, 'orcamentos', id))
    router.push('/orcamentos')
  }

  return (
    <div>
      {/* ── Banner de status ── */}
      <div className={`rounded-2xl p-4 mb-3 flex items-center justify-between gap-3 border ${
        concluido
          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
          : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex items-center gap-2.5">
          {concluido
            ? <CheckCircle2 size={22} className="text-green-600 dark:text-green-400 flex-shrink-0" />
            : <Clock size={22} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          }
          <div>
            <div className={`text-[14px] font-bold ${concluido ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {concluido ? 'Serviço concluído' : 'Aguardando conclusão'}
            </div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400">
              {concluido
                ? 'Receita lançada automaticamente no financeiro'
                : 'Marque como concluído quando receber o pagamento'}
            </div>
          </div>
        </div>

        {/* Botão toggle concluído/pendente */}
        <button
          onClick={concluido ? marcarPendente : marcarConcluido}
          disabled={salvando}
          className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 ${
            concluido
              ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
              : 'bg-green-600 text-white border border-green-600'
          }`}
        >
          {salvando
            ? <Loader2 size={14} className="animate-spin" />
            : concluido
              ? <><Clock size={14} /> Reabrir</>
              : <><CheckCircle2 size={14} /> Concluir</>
          }
        </button>
      </div>

      {/* ── Dados do orçamento ── */}
      <Card>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Cliente</div>
            <div className="text-[15px] font-semibold dark:text-gray-100">{orc.cliente}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Data</div>
            <div className="text-[15px] font-semibold dark:text-gray-100">{fmtData(orc.data)}</div>
          </div>
          {orc.descricao && (
            <div className="col-span-2">
              <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Descrição</div>
              <div className="text-[15px] font-semibold dark:text-gray-100">{orc.descricao}</div>
            </div>
          )}
        </div>

        {/* Itens */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
          {orc.itens.map((i, idx) => (
            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-700 last:border-none">
              <div>
                <div className="text-[14px] font-medium dark:text-gray-100">{i.nome}</div>
                <div className="text-[12px] text-gray-400">
                  {String(i.qtd).replace('.', ',')} {tipoUnid[i.tipo]} × {fmtMoeda(i.valor)}
                </div>
              </div>
              <div className="text-[15px] font-bold text-brand">{fmtMoeda(i.sub)}</div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3.5 text-[20px] font-bold dark:text-gray-100">
            <span>Total Geral</span>
            <span className="text-brand">{fmtMoeda(orc.total)}</span>
          </div>
        </div>
      </Card>

      {/* ── Ações ── */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={excluir}
          className={`py-3.5 px-4 rounded-xl text-[14px] font-semibold border transition-all ${
            confirmDel
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-red-50 dark:bg-red-950 text-red-500 border-red-200 dark:border-red-800'
          }`}
        >
          {confirmDel ? 'Confirmar exclusão' : 'Excluir'}
        </button>

        <button
          onClick={() => gerarPDF(orc)}
          className="flex-1 py-3.5 bg-brand text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2"
        >
          <Printer size={16} /> Gerar PDF
        </button>
      </div>

      <p className="text-center text-[12px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5">
        Clique em "Gerar PDF" para imprimir ou salvar o orçamento
      </p>
    </div>
  )
}

