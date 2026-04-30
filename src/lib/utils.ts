// src/lib/utils.ts
// Funções utilitárias reutilizadas em todo o projeto

import { Orcamento, tipoLabel, tipoUnid } from './types'

/** Formata um número como moeda brasileira: R$ 1.250,00 */
export function fmtMoeda(v: number): string {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

/** Formata 'YYYY-MM-DD' para 'DD/MM/YYYY' */
export function fmtData(d: string): string {
  return new Date(d + 'T12:00').toLocaleDateString('pt-BR')
}

/** Retorna a data de hoje no formato 'YYYY-MM-DD' */
export function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Verifica se uma data ISO está no mês/ano atual */
export function isNestesMes(d: string): boolean {
  const agora = new Date()
  const data  = new Date(d + 'T12:00')
  return data.getMonth() === agora.getMonth() &&
         data.getFullYear() === agora.getFullYear()
}

/** Escapa HTML para evitar XSS */
export function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

/**
 * Gera o HTML do orçamento e abre em nova aba para impressão/PDF.
 * Funciona sem dependências externas — usa window.print() do próprio navegador.
 */
export function gerarPDF(orc: Orcamento): void {
  const linhas = orc.itens.map(i => `
    <tr>
      <td>${esc(i.nome)}</td>
      <td style="text-align:center">${tipoLabel[i.tipo]}</td>
      <td style="text-align:center">${i.qtd}</td>
      <td style="text-align:right">R$ ${i.valor.toFixed(2).replace('.',',')}</td>
      <td style="text-align:right;font-weight:700">R$ ${i.sub.toFixed(2).replace('.',',')}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8">
  <title>Orçamento — ${esc(orc.cliente)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;padding:40px;color:#222;max-width:750px;margin:0 auto}
    .topo{border-bottom:4px solid #E67E22;padding-bottom:20px;margin-bottom:28px}
    .titulo{font-size:30px;font-weight:700;color:#E67E22}
    .sub{font-size:14px;color:#999;margin-top:4px}
    .campos{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
    .campo label{font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:3px}
    .campo p{font-size:16px;font-weight:600}
    .full{grid-column:1/-1}
    table{width:100%;border-collapse:collapse;margin-bottom:28px}
    th{background:#F7F7F7;padding:10px 12px;text-align:left;font-size:11px;color:#666;text-transform:uppercase}
    td{padding:12px;border-bottom:1px solid #F0F0F0;font-size:14px}
    .total td{background:#FEF3E8;font-weight:700;font-size:17px;color:#E67E22}
    footer{text-align:center;font-size:12px;color:#bbb;padding-top:20px;border-top:1px solid #EEE}
    @media print{body{padding:20px}}
  </style></head><body>
  <div class="topo">
    <div class="titulo">ORÇAMENTO DE SERVIÇOS</div>
    <div class="sub">Construção · Reforma · Acabamento</div>
  </div>
  <div class="campos">
    <div class="campo"><label>Cliente</label><p>${esc(orc.cliente)}</p></div>
    <div class="campo"><label>Data</label><p>${fmtData(orc.data)}</p></div>
    ${orc.descricao ? `<div class="campo full"><label>Descrição</label><p>${esc(orc.descricao)}</p></div>` : ''}
  </div>
  <table>
    <thead><tr><th>Serviço</th><th style="text-align:center">Tipo</th><th style="text-align:center">Qtd</th><th style="text-align:right">Valor unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
    <tbody>
      ${linhas}
      <tr class="total"><td colspan="4">TOTAL GERAL</td><td style="text-align:right">R$ ${orc.total.toFixed(2).replace('.',',')}</td></tr>
    </tbody>
  </table>
  <footer>
    <p>Orçamento válido por 15 dias · Forma de pagamento a combinar</p>
    <p style="margin-top:6px">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
  </footer>
  <script>window.onload=()=>setTimeout(()=>window.print(),400)<\/script>
  </body></html>`

  try {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
    window.open(url, '_blank')
  } catch {
    alert('Ative pop-ups no navegador para gerar o PDF.')
  }
}
