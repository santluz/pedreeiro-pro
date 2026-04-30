'use client'
// src/app/servicos/page.tsx — Cadastro e listagem de serviços

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoginScreen from '@/components/ui/LoginScreen'
import { Card, BtnPrimary, Label, Input, Select, Vazio, Erro, Loading } from '@/components/ui'
import {
  colServicos, addDoc, doc, updateDoc, deleteDoc, db, getDocs
} from '@/lib/firebase'
import { Servico, tipoLabel, TipoCobranca } from '@/lib/types'
import { fmtMoeda } from '@/lib/utils'

type Tela = 'lista' | 'form'

export default function ServicosPage() {
  const { user, loading } = useAuth()
  const [servicos,   setServicos]   = useState<Servico[]>([])
  const [tela,       setTela]       = useState<Tela>('lista')
  const [editando,   setEditando]   = useState<Servico | null>(null)
  const [carregando, setCarregando] = useState(true)

  // Form state
  const [nome,  setNome]  = useState('')
  const [tipo,  setTipo]  = useState<TipoCobranca>('m2')
  const [valor, setValor] = useState('')
  const [erro,  setErro]  = useState('')

  useEffect(() => {
    if (!user) return
    getDocs(colServicos(user.uid)).then(snap => {
      setServicos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Servico)))
      setCarregando(false)
    })
  }, [user])

  if (loading)    return <Loading />
  if (!user)      return <LoginScreen />
  if (carregando) return <Loading />

  // ── Abrir formulário ──
  const abrirAdd = () => {
    setEditando(null); setNome(''); setTipo('m2'); setValor(''); setErro('')
    setTela('form')
  }
  const abrirEdit = (s: Servico) => {
    setEditando(s); setNome(s.nome); setTipo(s.tipo); setValor(String(s.valor)); setErro('')
    setTela('form')
  }

  // ── Salvar ──
  const salvar = async () => {
    if (!nome.trim())               { setErro('Informe o nome do serviço'); return }
    if (!valor || parseFloat(valor) <= 0) { setErro('Informe o valor corretamente'); return }
    const dados = { nome: nome.trim(), tipo, valor: parseFloat(valor) }
    if (editando) {
      await updateDoc(doc(db, 'users', user.uid, 'servicos', editando.id), dados)
      setServicos(prev => prev.map(s => s.id === editando.id ? { ...s, ...dados } : s))
    } else {
      const ref = await addDoc(colServicos(user.uid), dados)
      setServicos(prev => [...prev, { id: ref.id, ...dados }])
    }
    setTela('lista')
  }

  // ── Excluir ──
  const excluir = async (id: string) => {
    if (!confirm('Excluir este serviço?')) return
    await deleteDoc(doc(db, 'users', user.uid, 'servicos', id))
    setServicos(prev => prev.filter(s => s.id !== id))
  }

  // ── FORMULÁRIO ──
  if (tela === 'form') return (
    <div>
      <Card>
        <Label>Nome do serviço *</Label>
        <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Reboco, Piso, Pintura..." />

        <Label>Como você cobra?</Label>
        <Select value={tipo} onChange={e => setTipo(e.target.value as TipoCobranca)}>
          <option value="m2">Por metro quadrado (m²)</option>
          <option value="diaria">Por diária (dia de trabalho)</option>
          <option value="fixo">Valor fixo (preço fechado)</option>
        </Select>

        <Label>Valor (R$) *</Label>
        <Input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="Ex: 45.00" min="0" step="0.01" />

        <Erro msg={erro} />

        <div className="flex gap-2.5">
          <button onClick={() => setTela('lista')} className="flex-1 py-3.5 border border-gray-200 rounded-xl text-[15px]">
            Cancelar
          </button>
          <BtnPrimary className="flex-[2] mb-0" onClick={salvar}>
            Salvar Serviço
          </BtnPrimary>
        </div>
      </Card>
    </div>
  )

  // ── LISTA ──
  return (
    <div>
      <BtnPrimary onClick={abrirAdd}>
        <Plus size={18} strokeWidth={2.5} /> Adicionar Serviço
      </BtnPrimary>

      {servicos.length === 0 && (
        <Vazio emoji="🔨" texto="Nenhum serviço cadastrado" sub="Toque no botão acima para adicionar" />
      )}

      {servicos.map(s => (
        <Card key={s.id} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold">{s.nome}</div>
            <div className="text-[12px] text-gray-400">{tipoLabel[s.tipo]}</div>
            <div className="text-[17px] font-bold text-brand mt-1">{fmtMoeda(s.valor)}</div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => abrirEdit(s)} className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
              <Pencil size={16} className="text-gray-500" />
            </button>
            <button onClick={() => excluir(s.id)} className="p-2.5 bg-red-50 border border-red-100 rounded-xl">
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}
