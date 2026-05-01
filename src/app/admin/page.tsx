'use client'
// src/app/admin/page.tsx — Painel do administrador

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ShieldOff, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Loading, Card } from '@/components/ui'
import { db } from '@/lib/firebase'
import {
  collection, getDocs, doc, updateDoc, Timestamp
} from 'firebase/firestore'

interface UsuarioRegistro {
  uid: string
  email: string
  status: 'ativo' | 'bloqueado'
  criadoEm: Timestamp | string | null
}

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  const [usuarios,   setUsuarios]   = useState<UsuarioRegistro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState<string | null>(null)

  // Redireciona se não for admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/')
    }
  }, [loading, user, isAdmin, router])

  const carregar = async () => {
    setCarregando(true)
    const snap = await getDocs(collection(db, 'usuarios_registro'))
    const lista = snap.docs.map(d => ({
      uid: d.id,
      ...d.data(),
    } as UsuarioRegistro))
    lista.sort((a, b) => {
      const da = a.criadoEm instanceof Timestamp ? a.criadoEm.toMillis() : 0
      const db_ = b.criadoEm instanceof Timestamp ? b.criadoEm.toMillis() : 0
      return db_ - da
    })
    setUsuarios(lista)
    setCarregando(false)
  }

  useEffect(() => {
    if (isAdmin) carregar()
  }, [isAdmin])

  if (loading || carregando) return <Loading />
  if (!isAdmin) return null

  const alterarStatus = async (uid: string, novoStatus: 'ativo' | 'bloqueado') => {
    setAtualizando(uid)
    await updateDoc(doc(db, 'usuarios_registro', uid), { status: novoStatus })
    setUsuarios(prev =>
      prev.map(u => u.uid === uid ? { ...u, status: novoStatus } : u)
    )
    setAtualizando(null)
  }

  const fmtData = (val: Timestamp | string | null) => {
    if (!val) return '—'
    if (val instanceof Timestamp) return val.toDate().toLocaleDateString('pt-BR')
    return new Date(val).toLocaleDateString('pt-BR')
  }

  const ativos    = usuarios.filter(u => u.status === 'ativo')
  const bloqueados = usuarios.filter(u => u.status === 'bloqueado')

  return (
    <div>
      {/* Header do painel */}
      <div className="bg-brand text-white rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={20} />
          <span className="font-bold text-lg">Painel Admin</span>
        </div>
        <div className="text-[13px] opacity-80">
          {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
          · {ativos.length} ativo{ativos.length !== 1 ? 's' : ''}
          · {bloqueados.length} bloqueado{bloqueados.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Botão atualizar */}
      <button
        onClick={carregar}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 ml-1"
      >
        <RefreshCw size={14} /> Atualizar lista
      </button>

      {usuarios.length === 0 && (
        <p className="text-center text-gray-400 py-10 text-sm">
          Nenhum usuário registrado ainda.
        </p>
      )}

      {/* Lista de usuários */}
      {usuarios.map(u => {
        const isMe = u.email === user?.email
        const bloqueado = u.status === 'bloqueado'

        return (
          <Card key={u.uid} className={bloqueado ? 'opacity-60' : ''}>
            <div className="flex items-center gap-3">
              {/* Avatar inicial */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0 ${
                bloqueado ? 'bg-gray-400' : 'bg-brand'
              }`}>
                {u.email?.[0]?.toUpperCase() || '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-medium truncate dark:text-gray-100">
                    {u.email}
                  </span>
                  {isMe && (
                    <span className="text-[10px] bg-brand text-white px-2 py-0.5 rounded-full font-semibold">
                      você
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[11px] font-semibold ${
                    bloqueado ? 'text-red-500' : 'text-green-600'
                  }`}>
                    {bloqueado ? '● Bloqueado' : '● Ativo'}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    · desde {fmtData(u.criadoEm)}
                  </span>
                </div>
              </div>

              {/* Botão bloquear/desbloquear — não aparece para o próprio admin */}
              {!isMe && (
                <button
                  disabled={atualizando === u.uid}
                  onClick={() => alterarStatus(u.uid, bloqueado ? 'ativo' : 'bloqueado')}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-50 ${
                    bloqueado
                      ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {atualizando === u.uid ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : bloqueado ? (
                    <><ShieldCheck size={13} /> Liberar</>
                  ) : (
                    <><ShieldOff size={13} /> Bloquear</>
                  )}
                </button>
              )}
            </div>
          </Card>
        )
      })}

      <div className="mt-2 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3 text-[12px] text-blue-700 dark:text-blue-300 text-center">
        Usuários bloqueados não conseguem entrar no app até serem liberados.
      </div>
    </div>
  )
}
