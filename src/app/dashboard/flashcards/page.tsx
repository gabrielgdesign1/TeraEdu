'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from "next-themes"
import { LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle, BarChart3, Calendar, Sun, Moon, Settings, Pencil, ClipboardList, FileUp } from "lucide-react"

type Flashcard = { pergunta: string, resposta: string }
type ModoEntrada = 'tema' | 'texto' | 'pdf'

export default function Flashcards() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [modoEntrada, setModoEntrada] = useState<ModoEntrada>('tema')
  const [tema, setTema] = useState('')
  const [texto, setTexto] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [quantidade, setQuantidade] = useState(5)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(false)
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [virado, setVirado] = useState(false)
  const [modoEstudo, setModoEstudo] = useState(false)

  async function gerarFlashcards() {
    if (loading) return
    if (modoEntrada === 'tema' && !tema.trim()) return
    if (modoEntrada === 'texto' && !texto.trim()) return
    if (modoEntrada === 'pdf' && !arquivo) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('modo', modoEntrada)
      formData.append('quantidade', String(quantidade))
      if (modoEntrada === 'tema') formData.append('tema', tema)
      if (modoEntrada === 'texto') formData.append('texto', texto)
      if (modoEntrada === 'pdf' && arquivo) formData.append('arquivo', arquivo)
      const resposta = await fetch('/api/flashcards', { method: 'POST', body: formData })
      const dados = await resposta.json()
      setFlashcards(dados.flashcards)
      setIndiceAtual(0)
      setVirado(false)
      setModoEstudo(true)
    } catch {
      alert('Erro ao gerar flashcards. Tente novamente.')
    }
    setLoading(false)
  }

  function proximoCard() {
    setVirado(false)
    setTimeout(() => {
      if (indiceAtual < flashcards.length - 1) setIndiceAtual(indiceAtual + 1)
      else setModoEstudo(false)
    }, 150)
  }
  function cardAnterior() {
    setVirado(false)
    setTimeout(() => { if (indiceAtual > 0) setIndiceAtual(indiceAtual - 1) }, 150)
  }
  function novosFlashcards() {
    setFlashcards([]); setTema(''); setTexto(''); setArquivo(null); setModoEstudo(false); setIndiceAtual(0); setVirado(false)
  }

  const podeGerar = (modoEntrada === 'tema' && tema.trim()) || (modoEntrada === 'texto' && texto.trim()) || (modoEntrada === 'pdf' && arquivo)

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-60 bg-bg-card border-r border-border flex flex-col fixed h-full">
        <div className="flex items-center gap-2 px-5 py-5">
          <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={28} height={28} />
          <span className="text-text font-semibold text-base">TeraEdu</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 py-2 flex-1">
          <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink href="/dashboard/questoes" icon={FileQuestion} label="Questões" />
          <SidebarLink href="/dashboard/flashcards" icon={Layers} label="Flashcards" active />
          <SidebarLink href="/dashboard/resumos" icon={FileText} label="Resumos" />
          <SidebarLink href="/dashboard/tutora" icon={MessageCircle} label="IA Tutora" />
          <div className="px-3 mt-6 mb-2">
            <p className="text-text-faint text-[11px] uppercase tracking-wider font-medium">Progresso</p>
          </div>
          <SidebarLink href="/dashboard/desempenho" icon={BarChart3} label="Desempenho" />
          <SidebarLink href="/dashboard/plano" icon={Calendar} label="Plano de Estudos" />
        </nav>
        <div className="px-3 py-3 border-t border-border">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text text-sm transition-colors">
            {mounted && theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{mounted && theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-hover cursor-pointer transition-colors mt-1">
            <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center text-white text-xs font-semibold">G</div>
            <div className="flex-1 min-w-0">
              <p className="text-text text-sm font-medium truncate">Gabriel</p>
              <p className="text-text-faint text-xs truncate">gabriel@email.com</p>
            </div>
            <Settings size={14} className="text-text-faint" />
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-60 px-10 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-text text-3xl font-semibold tracking-tight">Flashcards</h1>
            <p className="text-text-muted text-sm mt-1.5">A IA cria flashcards a partir de qualquer conteúdo</p>
          </div>

          {!modoEstudo ? (
            <div className="bg-bg-card border border-border rounded-2xl p-8">
              <div className="flex gap-2 mb-6 bg-bg p-1 rounded-xl">
                {([
                  { id: 'tema' as ModoEntrada, label: 'Tema', icon: Pencil },
                  { id: 'texto' as ModoEntrada, label: 'Colar texto', icon: ClipboardList },
                  { id: 'pdf' as ModoEntrada, label: 'PDF', icon: FileUp },
                ]).map((m) => (
                  <button key={m.id} onClick={() => setModoEntrada(m.id)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${modoEntrada === m.id ? 'bg-brand text-white' : 'text-text-muted hover:text-text'}`}>
                    <m.icon size={14} /> {m.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-5">
                {modoEntrada === 'tema' && (
                  <div>
                    <label className="text-text-muted text-sm mb-2 block">Sobre o que você quer estudar?</label>
                    <input type="text" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex: Revolução Francesa, Mitose, Função Quadrática..." className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors" />
                  </div>
                )}
                {modoEntrada === 'texto' && (
                  <div>
                    <label className="text-text-muted text-sm mb-2 block">Cole o conteúdo aqui</label>
                    <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Cole texto, anotações da aula, conteúdo do livro..." rows={8} className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors resize-none" />
                  </div>
                )}
                {modoEntrada === 'pdf' && (
                  <div>
                    <label className="text-text-muted text-sm mb-2 block">Anexe um PDF</label>
                    <label className="block w-full bg-bg border-2 border-dashed border-border hover:border-brand rounded-xl px-4 py-12 text-center cursor-pointer transition-colors">
                      <input type="file" accept="application/pdf" onChange={(e) => setArquivo(e.target.files?.[0] || null)} className="hidden" />
                      <FileUp size={32} className="mx-auto mb-2 text-text-muted" />
                      {arquivo ? (
                        <>
                          <p className="text-text text-sm font-medium">{arquivo.name}</p>
                          <p className="text-text-muted text-xs mt-1">Clique para trocar de arquivo</p>
                        </>
                      ) : (
                        <>
                          <p className="text-text text-sm font-medium">Clique para selecionar um PDF</p>
                          <p className="text-text-muted text-xs mt-1">Material da escola, livro, apostila...</p>
                        </>
                      )}
                    </label>
                  </div>
                )}

                <div>
                  <label className="text-text-muted text-sm mb-2 block">Quantos flashcards?</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map((n) => (
                      <button key={n} onClick={() => setQuantidade(n)} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${quantidade === n ? 'bg-brand text-white' : 'bg-bg border border-border text-text-muted hover:text-text'}`}>{n}</button>
                    ))}
                  </div>
                </div>

                <button onClick={gerarFlashcards} disabled={loading || !podeGerar} className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors mt-2">
                  {loading ? 'Gerando flashcards...' : 'Gerar flashcards com IA'}
                </button>
              </div>

              {flashcards.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <button onClick={() => { setModoEstudo(true); setIndiceAtual(0); setVirado(false) }} className="w-full bg-bg border border-border hover:border-brand text-text py-3 rounded-xl text-sm font-medium transition-colors">
                    Continuar estudando os {flashcards.length} flashcards
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-muted text-sm">Card {indiceAtual + 1} de {flashcards.length}</span>
                  <button onClick={novosFlashcards} className="text-text-muted hover:text-text text-sm transition-colors">Novos flashcards</button>
                </div>
                <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
                  <div className="h-full bg-brand transition-all duration-300" style={{ width: `${((indiceAtual + 1) / flashcards.length) * 100}%` }}></div>
                </div>
              </div>

              <div onClick={() => setVirado(!virado)} className="bg-bg-card border border-border rounded-2xl p-12 min-h-[400px] flex flex-col items-center justify-center cursor-pointer hover:border-brand transition-all">
                <div className="text-center">
                  <p className="text-text-faint text-xs uppercase tracking-wide mb-4">{virado ? 'Resposta' : 'Pergunta'}</p>
                  <p className="text-text text-xl leading-relaxed">{virado ? flashcards[indiceAtual]?.resposta : flashcards[indiceAtual]?.pergunta}</p>
                </div>
                <p className="text-text-faint text-xs mt-8">Clique no card para {virado ? 'voltar' : 'ver a resposta'}</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={cardAnterior} disabled={indiceAtual === 0} className="flex-1 bg-bg-card border border-border hover:border-brand disabled:opacity-30 text-text py-3 rounded-xl text-sm font-medium transition-colors">← Anterior</button>
                <button onClick={proximoCard} className="flex-1 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl text-sm font-medium transition-colors">{indiceAtual === flashcards.length - 1 ? 'Finalizar' : 'Próximo →'}</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SidebarLink({ href, icon: Icon, label, active }: { href: string, icon: React.ElementType, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-brand-soft text-brand font-medium' : 'text-text-muted hover:text-text hover:bg-bg-hover'}`}>
      <Icon size={16} />
      {label}
    </Link>
  )
}