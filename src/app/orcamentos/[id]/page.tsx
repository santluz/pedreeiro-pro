'use client'
// src/app/orcamentos/[id]/page.tsx — Detalhes de um orçamento

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Printer } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoginScreen from '@/components/ui/LoginScreen'
import { Card, Loading } from '@/components/ui'
import { db, doc, deleteDoc, getDocs, colOrcamentos } from '@/lib/firebase'
import { Orcamento, tipoUnid } from '@/lib/types'
import { fmtMoeda, fmtData, gerarPDF } from '@/lib/utils'

export default function VerOrcamentoPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [orc,        setOrc]        = useState<Orcamento | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [confirmDel, setConfirmDel] = useState(false)

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

  const excluir = async () => {
    if (!confirmDel) { setConfirmDel(true); return }
    await deleteDoc(doc(db, 'users', user.uid, 'orcamentos', id))
    router.push('/orcamentos')
  }

  return (
    <div>
      <Card>
        {/* Cabeçalho */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Cliente</div>
            <div className="text-[15px] font-semibold">{orc.cliente}</div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Data</div>
            <div className="text-[15px] font-semibold">{fmtData(orc.data)}</div>
          </div>
          {orc.descricao && (
            <div className="col-span-2">
              <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Descrição</div>
              <div className="text-[15px] font-semibold">{orc.descricao}</div>
            </div>
          )}
        </div>

        {/* Itens */}
        <div className="border-t border-gray-100 pt-3">
          {orc.itens.map((i, idx) => (
            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-none">
              <div>
                <div className="text-[14px] font-medium">{i.nome}</div>
                <div className="text-[12px] text-gray-400">
                  {i.qtd} {tipoUnid[i.tipo]} × {fmtMoeda(i.valor)}
                </div>
              </div>
              <div className="text-[15px] font-bold text-brand">{fmtMoeda(i.sub)}</div>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-between items-center pt-3.5 text-[20px] font-bold">
            <span>Total Geral</span>
            <span className="text-brand">{fmtMoeda(orc.total)}</span>
          </div>
        </div>
      </Card>

      {/* Ações */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={excluir}
          className={`py-3.5 px-4 rounded-xl text-[14px] font-semibold border transition-all ${
            confirmDel
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-red-50 text-red-500 border-red-200'
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

      <p className="text-center text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
        Clique em "Gerar PDF" para imprimir ou salvar o orçamento
      </p>
    </div>
  )
}
