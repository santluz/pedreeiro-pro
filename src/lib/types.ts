// src/lib/types.ts

export type TipoCobranca = 'm2' | 'diaria' | 'fixo'

export interface Servico {
  id: string
  nome: string
  tipo: TipoCobranca
  valor: number
  criadoEm?: string
}

export interface ItemOrcamento {
  sid: string
  nome: string
  tipo: TipoCobranca
  valor: number
  qtd: number
  sub: number
}

export type StatusOrcamento = 'pendente' | 'concluido'

export interface Orcamento {
  id: string
  cliente: string
  descricao?: string
  data: string
  itens: ItemOrcamento[]
  total: number
  status?: StatusOrcamento   // 'pendente' (padrão) | 'concluido'
  lancamentoId?: string      // ID do lançamento criado no financeiro
  criadoEm?: string
}

export type TipoLancamento = 'entrada' | 'despesa'

export interface Lancamento {
  id: string
  tipo: TipoLancamento
  desc: string
  valor: number
  data: string
  orcamentoId?: string       // referência ao orçamento de origem
  criadoEm?: string
}

export interface Foto {
  id: string
  nome: string
  url: string
  criadoEm?: string
}

export const tipoLabel: Record<TipoCobranca, string> = {
  m2:     'por m²',
  diaria: 'por diária',
  fixo:   'valor fixo',
}
export const tipoUnid: Record<TipoCobranca, string> = {
  m2:     'm²',
  diaria: 'dia(s)',
  fixo:   'un',
}

