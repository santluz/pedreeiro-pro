'use client'
// src/app/financeiro/page.tsx

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoginScreen from '@/components/ui/LoginScreen'
import { Card, BtnPrimary, Label, Input, Erro, Loading } from '@/components/ui'
import { InputMoeda } from '@/components/ui/InputMoeda'
import { colFinanceiro, addDoc, doc, deleteDoc, db, getDocs } from '@/lib/firebase'
import { Lancamento, TipoLancamento } from '@/lib/types'
import { fmtMoeda, fmtData, hoje, isNestesMes } from '@/lib/utils'

type Tela = 'lista' | 'form'

export default function FinanceiroPage() {
  const { user, loading } = useAuth()

  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [tela,        setTela]        = useState<Tela>('lista')
  const [carregando,  setCarregando]  = useState(true)

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

  const finMes   = lancamentos.filter(f => isNestesMes(f.data))
  const entradas = finMes.filter(f => f.tipo === 'entrada').reduce((s, f) => s + f.valor, 0)
  const despesas = finMes.filter(f => f.tipo === 'despesa').reduce((s, f) => s + f.valor, 0)
  const saldo    = entradas - despesas

  const salvar = async () => {
    if (!desc.trim())                     { setErro('Informe a descrição'); return }
    if (!valor || parseFloat(valor) <= 0) { setErro('Informe o valor corretamente'); return }
    const dados: Omit<Lancamento, 'id'> = {
      tipo, desc: desc.trim(), valor: parseFloat(valor),
      data, criadoEm: new Date().toISOString(),
    }
    const ref = await addDoc(colFinanceiro(user.uid), dados)
    setLancamentos(prev =>
      [{ id: ref.id, ...dados }, ...prev]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    )
    setDesc(''); setValor(''); setData(hoje()); setErro('')
    setTela('lista')
  }

  const excluir = async (id: string) => {
    if (!confirm('Excluir este lançamento?')) return
    await deleteDoc(doc(db, 'users', user.uid, 'financeiro', id))
    setLancamentos(prev => prev.filter(f => f.id !== id))
  }

  const abrirForm = () => {
    setTipo('entrada'); setDesc(''); setValor(''); setData(hoje()); setErro('')
    setTela('form')
  }

  // ── FORMULÁRIO ──
  if (tela === 'form') return (
    <div>
      <Card>
        <Label>Tipo do lançamento</Label>
        <div className="flex gap-2 mb-4">
          {(['entrada', 'despesa'] as TipoLancamento[]).map(t => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`flex-1 py-3 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                tipo === t
                  ? t === 'entrada'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400'
                    : 'border-red-500 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-400 bg-gray-50 dark:bg-gray-800'
              }`}
            >
              {t === 'entrada' ? '✓ Entrada (recebi)' : 'Despesa (gastei)'}
            </button>
          ))}
        </div>

        <Label>Descrição *</Label>
        <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Pagamento do João Silva" />

        <Label>Valor (R$) *</Label>
        <InputMoeda value={valor} onChange={setValor} placeholder="0,00" />

        <Label>Data</Label>
        <Input type="date" value={data} onChange={e => setData(e.target.value)} />

        <Erro msg={erro} />

        <div className="flex gap-2.5">
          <button
            onClick={() => setTela('lista')}
            className="flex-1 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl text-[15px] dark:text-gray-300"
          >
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
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-3.5 text-center">
          <div className="text-[11px] text-green-700 dark:text-green-400 mb-1">Entradas do mês</div>
          <div className="text-[19px] font-bold text-green-700 dark:text-green-400">{fmtMoeda(entradas)}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3.5 text-center">
          <div className="text-[11px] text-red-600 dark:text-red-400 mb-1">Despesas do mês</div>
          <div className="text-[19px] font-bold text-red-600 dark:text-red-400">{fmtMoeda(despesas)}</div>
        </div>
      </div>

      {/* Saldo */}
      <div className={`rounded-2xl p-4 mb-3 text-center border ${
        saldo >= 0
          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      }`}>
        <div className="text-[13px] text-gray-500 dark:text-gray-400 mb-1">Saldo líquido do mês</div>
        <div className={`text-[30px] font-bold ${saldo >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {fmtMoeda(saldo)}
        </div>
      </div>

      <BtnPrimary onClick={abrirForm}>
        <Plus size={18} strokeWidth={2.5} /> Novo Lançamento
      </BtnPrimary>

      <Card>
        <div className="text-[14px] font-semibold mb-3 dark:text-gray-100">Todos os lançamentos</div>
        {lancamentos.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum lançamento ainda.</p>
        )}
        {lancamentos.map(f => (
          <div key={f.id} className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 dark:border-gray-700 last:border-none">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${f.tipo === 'entrada' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium truncate dark:text-gray-100">{f.desc}</div>
              <div className="text-[12px] text-gray-400">{fmtData(f.data)}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className={`text-[14px] font-bold ${f.tipo === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
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

