'use client'
// src/app/orcamentos/novo/page.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Printer } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoginScreen from '@/components/ui/LoginScreen'
import { Card, Label, Input, Select, Erro, Loading } from '@/components/ui'
import { InputQtd } from '@/components/ui/InputMoeda'
import { colServicos, colOrcamentos, getDocs, addDoc } from '@/lib/firebase'
import { Servico, ItemOrcamento, tipoLabel, tipoUnid } from '@/lib/types'
import { fmtMoeda, hoje, gerarPDF } from '@/lib/utils'

export default function NovoOrcamentoPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [servicos,       setServicos]       = useState<Servico[]>([])
  const [itens,          setItens]          = useState<ItemOrcamento[]>([])
  const [carregando,     setCarregando]     = useState(true)
  const [cliente,        setCliente]        = useState('')
  const [descricao,      setDescricao]      = useState('')
  const [data,           setData]           = useState(hoje())
  const [svcSelecionado, setSvcSelecionado] = useState<Servico | null>(null)
  const [qtd,            setQtd]            = useState('1')
  const [erro,           setErro]           = useState('')
  const [salvando,       setSalvando]       = useState(false)

  useEffect(() => {
    if (!user) return
    getDocs(colServicos(user.uid)).then(snap => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() } as Servico))
      setServicos(lista)
      setSvcSelecionado(lista[0] ?? null)
      setCarregando(false)
    })
  }, [user])

  if (loading)    return <Loading />
  if (!user)      return <LoginScreen />
  if (carregando) return <Loading />

  const total = itens.reduce((s, i) => s + i.sub, 0)

  const addItem = () => {
    if (!svcSelecionado) return
    const q = parseFloat(qtd) || 1
    setItens(prev => {
      const idx = prev.findIndex(i => i.sid === svcSelecionado.id)
      if (idx >= 0) {
        const c = [...prev]
        c[idx] = { ...c[idx], qtd: q, sub: svcSelecionado.valor * q }
        return c
      }
      return [...prev, {
        sid: svcSelecionado.id, nome: svcSelecionado.nome,
        tipo: svcSelecionado.tipo, valor: svcSelecionado.valor,
        qtd: q, sub: svcSelecionado.valor * q,
      }]
    })
    setQtd('1')
  }

  const removerItem = (sid: string) => setItens(prev => prev.filter(i => i.sid !== sid))

  const salvar = async (pdf = false) => {
    if (!cliente.trim())    { setErro('Informe o nome do cliente'); return }
    if (itens.length === 0) { setErro('Adicione pelo menos um serviço'); return }
    setErro(''); setSalvando(true)
    const orc = { cliente: cliente.trim(), descricao: descricao.trim(), data, itens, total, status: 'pendente' as const }
    const ref = await addDoc(colOrcamentos(user.uid), orc)
    if (pdf) gerarPDF({ id: ref.id, ...orc })
    router.push('/orcamentos')
  }

  return (
    <div>
      <Card>
        <Label>Nome do cliente *</Label>
        <Input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ex: João Silva" />
        <Label>Descrição (opcional)</Label>
        <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Reforma do banheiro" />
        <Label>Data do orçamento</Label>
        <Input type="date" value={data} onChange={e => setData(e.target.value)} />
      </Card>

      <Card>
        <div className="text-[14px] font-semibold mb-3 dark:text-gray-100">Serviços incluídos</div>
        {servicos.length === 0 ? (
          <p className="text-sm text-gray-400">Cadastre serviços na aba "Serviços" primeiro.</p>
        ) : (
          <>
            <Label>Selecione o serviço</Label>
            <Select
              value={svcSelecionado?.id ?? ''}
              onChange={e => {
                const sv = servicos.find(s => s.id === e.target.value)
                if (sv) setSvcSelecionado(sv)
              }}
            >
              {servicos.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {fmtMoeda(s.valor)} {tipoLabel[s.tipo]}
                </option>
              ))}
            </Select>
            <Label>Quantidade</Label>
            <div className="flex gap-2 mb-3.5">
              <InputQtd value={qtd} onChange={setQtd} placeholder="1" className="flex-1" />
              <button onClick={addItem} className="bg-brand text-white rounded-xl px-4 font-semibold flex items-center gap-1 whitespace-nowrap">
                <Plus size={16} /> Adicionar
              </button>
            </div>
          </>
        )}
        {itens.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            {itens.map(i => (
              <div key={i.sid} className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-700 last:border-none">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium dark:text-gray-100">{i.nome}</div>
                  <div className="text-[12px] text-gray-400">
                    {String(i.qtd).replace('.', ',')} {tipoUnid[i.tipo]} × {fmtMoeda(i.valor)}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-[15px] font-bold text-brand">{fmtMoeda(i.sub)}</span>
                  <button onClick={() => removerItem(i.sid)} className="p-1.5 text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3.5 text-[19px] font-bold dark:text-gray-100">
              <span>Total</span>
              <span className="text-brand">{fmtMoeda(total)}</span>
            </div>
          </div>
        )}
      </Card>

      <Erro msg={erro} />

      <div className="flex gap-2 mb-3">
        <button onClick={() => router.back()} className="flex-1 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl text-[14px] dark:text-gray-300">
          Cancelar
        </button>
        <button onClick={() => salvar(false)} disabled={salvando} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-[14px] font-semibold dark:text-gray-200 disabled:opacity-50">
          Salvar
        </button>
        <button onClick={() => salvar(true)} disabled={salvando} className="flex-[2] py-3.5 bg-brand text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          <Printer size={15} /> Salvar + PDF
        </button>
      </div>
      <p className="text-center text-[12px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5">
        Ative pop-ups no navegador para gerar o PDF
      </p>
    </div>
  )
}
