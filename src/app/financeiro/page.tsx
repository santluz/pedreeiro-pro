'use client'
// src/app/financeiro/page.tsx — Controle de entradas e despesas

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoginScreen from '@/components/ui/LoginScreen'
import { Card, BtnPrimary, Label, Input, Erro, Loading } from '@/components/ui'
import { colFinanceiro, addDoc, doc, deleteDoc, db, getDocs } from '@/lib/firebase'
import { Lancamento, TipoLancamento } from '@/lib/types'
import { fmtMoeda, fmtData, hoje, isNestesMes } from '@/lib/utils'

type Tela = 'lista' | 'form'

export default function FinanceiroPage() {
  const { user, loading } = useAuth()

  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [tela,        setTela]        = useState<Tela>('lista')
  const [carregando,  setCarregando]  = useState(true)

  // Form
  const [tipo,  setTipo]  = useState<TipoLancamento>('entrada')
  const [desc,  setDesc]  = useState('')
  const [valor, setValor] = useState('')
  const [data,  setData]  = useState(hoje())
  const [erro,  setErro]  = useState('')

  useEffect(() => {
    if (!user) return
    getDocs(colFinanceiro(user.uid)).then(snap => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() } as Lancamento))
      lista.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      setLancamentos(lista)
      setCarregando(false)
    })
  }, [user])

  if (loading)    return <Loading />
  if (!user)      return <LoginScreen />
  if (carregando) return <Loading />

  // Cálculos do mês
  const finMes   = lancamentos.filter(f => isNestesMes(f.data))
  const entradas = finMes.filter(f => f.tipo === 'entrada').reduce((s, f) => s + f.valor, 0)
  const despesas = finMes.filter(f => f.tipo === 'despesa').reduce((s, f) => s + f.valor, 0)
  const saldo    = entradas - despesas

  // ── Salvar lançamento ──
  const salvar = async () => {
    if (!desc.trim())               { setErro('Informe a descrição'); return }
    if (!valor || parseFloat(valor) <= 0) { setErro('Informe o valor corretamente'); return }
    const dados: Omit<Lancamento, 'id'> = {
      tipo,
      desc: desc.trim(),
      valor: parseFloat(valor),
      data,
      criadoEm: new Date().toISOString(),
    }
    const ref = await addDoc(colFinanceiro(user.uid), dados)
    const novo: Lancamento = { id: ref.id, ...dados }
    setLancamentos(prev =>
      [novo, ...prev].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    )
    setDesc(''); setValor(''); setData(hoje()); setErro('')
    setTela('lista')
  }

  // ── Excluir lançamento ──
  const excluir = async (id: string) => {
    if (!confirm('Excluir este lançamento?')) return
    await deleteDoc(doc(db, 'users', user.uid, 'financeiro', id))
    setLancamentos(prev => prev.filter(f => f.id !== id))
  }

  // ── FORMULÁRIO ──
  if (tela === 'form') return (
    <div>
      <Card>
        {/* Toggle entrada / despesa */}
        <Label>Tipo do lançamento</Label>
        <div className="flex gap-2 mb-4">
          {(['entrada', 'despesa'] as TipoLancamento[]).map(t => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`flex-1 py-3 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                tipo === t
                  ? t === 'entrada'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-200 text-gray-400 bg-gray-50'
              }`}
            >
              {t === 'entrada' ? '✓ Entrada (recebi)' : 'Despesa (gastei)'}
            </button>
          ))}
        </div>

        <Label>Descrição *</Label>
        <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Pagamento do João Silva" />

        <Label>Valor (R$) *</Label>
        <Input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" min="0" step="0.01" />

        <Label>Data</Label>
        <Input type="date" value={data} onChange={e => setData(e.target.value)} />

        <Erro msg={erro} />

        <div className="flex gap-2.5">
          <button onClick={() => setTela('lista')} className="flex-1 py-3.5 border border-gray-200 rounded-xl text-[15px]">
            Cancelar
          </button>
          <button
            onClick={salvar}
            className={`flex-[2] py-3.5 rounded-xl text-[15px] font-semibold text-white ${
              tipo === 'entrada' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {tipo === 'entrada' ? 'Salvar Entrada' : 'Salvar Despesa'}
          </button>
        </div>
      </Card>
    </div>
  )

  // ── LISTA ──
  return (
    <div>
      {/* Resumo do mês */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 text-center">
          <div className="text-[11px] text-green-700 mb-1">Entradas do mês</div>
          <div className="text-[19px] font-bold text-green-700">{fmtMoeda(entradas)}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-center">
          <div className="text-[11px] text-red-600 mb-1">Despesas do mês</div>
          <div className="text-[19px] font-bold text-red-600">{fmtMoeda(despesas)}</div>
        </div>
      </div>

      {/* Saldo */}
      <div className={`rounded-2xl p-4 mb-3 text-center border ${
        saldo >= 0
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="text-[13px] text-gray-500 mb-1">Saldo líquido do mês</div>
        <div className={`text-[30px] font-bold ${saldo >= 0 ? 'text-green-700' : 'text-red-600'}`}>
          {fmtMoeda(saldo)}
        </div>
      </div>

      <BtnPrimary onClick={() => { setTipo('entrada'); setDesc(''); setValor(''); setData(hoje()); setErro(''); setTela('form') }}>
        <Plus size={18} strokeWidth={2.5} /> Novo Lançamento
      </BtnPrimary>

      <Card>
        <div className="text-[14px] font-semibold mb-3">Todos os lançamentos</div>
        {lancamentos.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum lançamento registrado ainda.</p>
        )}
        {lancamentos.map(f => (
          <div key={f.id} className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 last:border-none">
            {/* Ponto colorido */}
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${f.tipo === 'entrada' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium truncate">{f.desc}</div>
              <div className="text-[12px] text-gray-400">{fmtData(f.data)}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className={`text-[14px] font-bold ${f.tipo === 'entrada' ? 'text-green-600' : 'text-red-500'}`}>
                {f.tipo === 'entrada' ? '+' : '-'}{fmtMoeda(f.valor)}
              </span>
              <button onClick={() => excluir(f.id)} className="text-gray-300 hover:text-red-400 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
