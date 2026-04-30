// src/lib/types.ts
// Tipos TypeScript compartilhados em todo o projeto

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

export interface Orcamento {
  id: string
  cliente: string
  descricao?: string
  data: string          // ISO 'YYYY-MM-DD'
  itens: ItemOrcamento[]
  total: number
  criadoEm?: string
}

export type TipoLancamento = 'entrada' | 'despesa'

export interface Lancamento {
  id: string
  tipo: TipoLancamento
  desc: string
  valor: number
  data: string          // ISO 'YYYY-MM-DD'
  criadoEm?: string
}

export interface Foto {
  id: string
  nome: string
  url: string           // URL do Firebase Storage
  criadoEm?: string
}

// Labels amigáveis
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
