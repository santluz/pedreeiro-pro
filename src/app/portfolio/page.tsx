'use client'
// src/app/portfolio/page.tsx — Upload e exibição de fotos dos trabalhos

import { useEffect, useRef, useState } from 'react'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LoginScreen from '@/components/ui/LoginScreen'
import { Vazio, Loading } from '@/components/ui'
import {
  storage, db,
  colFotos, addDoc, doc, deleteDoc, getDocs,
} from '@/lib/firebase'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { Foto } from '@/lib/types'

export default function PortfolioPage() {
  const { user, loading } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

  const [fotos,      setFotos]      = useState<Foto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [enviando,   setEnviando]   = useState(false)

  useEffect(() => {
    if (!user) return
    getDocs(colFotos(user.uid)).then(snap => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() } as Foto))
      lista.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''))
      setFotos(lista)
      setCarregando(false)
    })
  }, [user])

  if (loading)    return <Loading />
  if (!user)      return <LoginScreen />
  if (carregando) return <Loading />

  // ── Upload de foto ──
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setEnviando(true)

    for (const file of files) {
      try {
        // Salva no Firebase Storage: users/{uid}/fotos/{timestamp}_{nome}
        const caminho = `users/${user.uid}/fotos/${Date.now()}_${file.name}`
        const sRef = storageRef(storage, caminho)
        await uploadBytes(sRef, file)
        const url = await getDownloadURL(sRef)

        const nome = file.name.replace(/\.[^.]+$/, '')
        const criadoEm = new Date().toISOString()

        // Salva referência no Firestore
        const docRef = await addDoc(colFotos(user.uid), { nome, url, caminho, criadoEm })
        setFotos(prev => [{ id: docRef.id, nome, url, criadoEm }, ...prev])
      } catch (err) {
        console.error('Erro ao enviar foto:', err)
        alert('Erro ao enviar uma foto. Verifique as regras do Storage no Firebase.')
      }
    }

    setEnviando(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  // ── Excluir foto ──
  const excluir = async (foto: Foto & { caminho?: string }) => {
    if (!confirm('Excluir esta foto?')) return
    // Remove do Storage (se tiver caminho salvo)
    if (foto.caminho) {
      try {
        await deleteObject(storageRef(storage, foto.caminho))
      } catch { /* ignora se já não existir */ }
    }
    // Remove do Firestore
    await deleteDoc(doc(db, 'users', user.uid, 'fotos', foto.id))
    setFotos(prev => prev.filter(f => f.id !== foto.id))
  }

  return (
    <div>
      {/* Botão de upload */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
        className="w-full bg-brand text-white rounded-xl py-4 text-[16px] font-semibold flex items-center justify-center gap-2 mb-3 active:bg-brand-dark disabled:opacity-60"
      >
        {enviando
          ? <><Loader2 size={18} className="animate-spin" /> Enviando...</>
          : <><Camera size={18} /> Adicionar Fotos</>
        }
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={upload}
      />

      {fotos.length === 0 ? (
        <Vazio
          emoji="📷"
          texto="Nenhuma foto adicionada ainda"
          sub="Mostre seus trabalhos para atrair mais clientes!"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {fotos.map(f => (
            <div key={f.id} className="rounded-2xl overflow-hidden border border-gray-100">
              <img
                src={f.url}
                alt={f.nome}
                className="w-full h-[130px] object-cover block"
                loading="lazy"
              />
              <div className="flex items-center justify-between px-2.5 py-2 bg-white">
                <span className="text-[12px] text-gray-500 truncate flex-1">{f.nome}</span>
                <button
                  onClick={() => excluir(f as Foto & { caminho?: string })}
                  className="ml-2 text-red-400 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dica */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-[12px] text-blue-700 text-center">
        As fotos ficam salvas na nuvem e aparecem em qualquer aparelho que você usar para entrar.
      </div>
    </div>
  )
}
