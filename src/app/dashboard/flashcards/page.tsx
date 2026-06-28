'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle,
  BarChart3, Calendar, Sun, Moon, Settings, Pencil, ClipboardList,
  FileUp, RotateCcw, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useNome } from '@/hooks/useNome'

type Flashcard = { pergunta: string; resposta: string }
type ModoEntrada = 'tema' | 'texto' | 'pdf'

export default function Flashcards() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { primeiroNome, nome } = useNome()

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
      const res = await fetch('/api/flashcards', { method: 'POST', body: formData })
      const dados = await res.json()
      setFlashcards(dados.flashcards)
      setIndiceAtual(0)
      setVirado(false)
      setModoEstudo(true)
    } catch {
      alert('Erro ao gerar flashcards.')
    }
    setLoading(false)
  }

  function proximo() {
    setVirado(false)
    setTimeout(() => {
      if (indiceAtual < flashcards.length - 1) setIndiceAtual(indiceAtual + 1)
      else setModoEstudo(false)
    }, 120)
  }
  function anterior() {
    setVirado(false)
    setTimeout(() => { if (indiceAtual > 0) setIndiceAtual(indiceAtual - 1) }, 120)
  }
  function reiniciar() {
    setFlashcards([]); setTema(''); setTexto(''); setArquivo(null)
    setModoEstudo(false); setIndiceAtual(0); setVirado(false)
  }

  const podeGerar =
    (modoEntrada === 'tema' && tema.trim()) ||
    (modoEntrada === 'texto' && texto.trim()) ||
    (modoEntrada === 'pdf' && arquivo)

  const progresso = flashcards.length ? ((indiceAtual + 1) / flashcards.length) * 100 : 0

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-bg border-r border-border/60 flex flex-col fixed h-full">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={26} height={26} />
          <span className="text-text font-bold tracking-tight">TeraEdu</span>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 flex-1 pt-1">
          <SidebarLink href="/dashboard"            icon={LayoutDashboard} label="Início" />
          <SidebarLink href="/dashboard/questoes"   icon={FileQuestion}    label="Questões" />
          <SidebarLink href="/dashboard/flashcards" icon={Layers}          label="Flashcards" active />
          <SidebarLink href="/dashboard/resumos"    icon={FileText}        label="Resumos" />
          <SidebarLink href="/dashboard/tutora"     icon={MessageCircle}   label="IA Tutora" />
          <div className="px-3 mt-8 mb-2">
            <p className="text-text-faint text-[10px] uppercase tracking-widest font-semibold">Progresso</p>
          </div>
          <SidebarLink href="/dashboard/desempenho" icon={BarChart3}  label="Desempenho" />
          <SidebarLink href="/dashboard/plano"      icon={Calendar}   label="Plano de Estudos" />
        </nav>

        <div className="px-3 py-4 border-t border-border/60">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-bg-hover text-text-muted hover:text-text text-sm transition-colors mb-1"
          >
            {mounted && theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{mounted && theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-hover cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {primeiroNome ? primeiroNome[0].toUpperCase() : 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text text-sm font-semibold truncate">{nome ?? 'Gabriel'}</p>
            </div>
            <Settings size={13} className="text-text-faint" />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">

        {modoEstudo ? (
          /* ── Modo estudo ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
            <div className="w-full max-w-xl">

              {/* Progresso */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-muted text-sm">{indiceAtual + 1} / {flashcards.length}</span>
                <button onClick={reiniciar} className="flex items-center gap-1.5 text-text-muted hover:text-text text-sm transition-colors">
                  <RotateCcw size={13} /> Reiniciar
                </button>
              </div>
              <div className="h-1 bg-bg-card rounded-full overflow-hidden mb-8">
                <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${progresso}%` }} />
              </div>

              {/* Card */}
              <div
                onClick={() => setVirado(!virado)}
                className="bg-bg-card rounded-2xl p-12 min-h-72 flex flex-col items-center justify-center cursor-pointer hover:ring-1 hover:ring-brand/40 transition-all select-none"
              >
                <p className="text-text-faint text-xs uppercase tracking-widest mb-5">
                  {virado ? 'Resposta' : 'Pergunta'}
                </p>
                <p className="text-text text-xl text-center leading-relaxed">
                  {virado ? flashcards[indiceAtual]?.resposta : flashcards[indiceAtual]?.pergunta}
                </p>
                <p className="text-text-faint text-xs mt-8">
                  Clique para {virado ? 'voltar' : 'ver a resposta'}
                </p>
              </div>

              {/* Navegação */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={anterior}
                  disabled={indiceAtual === 0}
                  className="flex items-center gap-2 flex-1 justify-center py-3 rounded-xl border border-border text-text-muted hover:text-text hover:border-brand/50 disabled:opacity-30 transition-all text-sm font-medium"
                >
                  <ChevronLeft size={15} /> Anterior
                </button>
                <button
                  onClick={proximo}
                  className="flex items-center gap-2 flex-1 justify-center py-3 rounded-xl bg-brand hover:bg-brand-hover text-white transition-colors text-sm font-medium"
                >
                  {indiceAtual === flashcards.length - 1 ? 'Finalizar' : 'Próximo'}
                  {indiceAtual < flashcards.length - 1 && <ChevronRight size={15} />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Tela de criação ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
            <div className="w-full max-w-xl">
              <h1 className="text-text text-3xl font-bold tracking-tight mb-1.5 text-center">Flashcards</h1>
              <p className="text-text-muted text-center mb-10">A IA cria flashcards a partir de qualquer conteúdo</p>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-bg-card rounded-xl p-1">
                {([
                  { id: 'tema' as ModoEntrada,  label: 'Tema',       icon: Pencil       },
                  { id: 'texto' as ModoEntrada, label: 'Colar texto', icon: ClipboardList },
                  { id: 'pdf' as ModoEntrada,   label: 'PDF',         icon: FileUp       },
                ]).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModoEntrada(m.id)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      modoEntrada === m.id ? 'bg-brand text-white' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <m.icon size={14} /> {m.label}
                  </button>
                ))}
              </div>

              {/* Entrada */}
              <div className="flex flex-col gap-5">
                {modoEntrada === 'tema' && (
                  <div>
                    <label className="text-text-muted text-sm mb-2 block">Sobre o que você quer estudar?</label>
                    <input
                      type="text"
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') gerarFlashcards() }}
                      placeholder="Ex: Revolução Francesa, Mitose, Função Quadrática..."
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                )}
                {modoEntrada === 'texto' && (
                  <div>
                    <label className="text-text-muted text-sm mb-2 block">Cole o conteúdo aqui</label>
                    <textarea
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      placeholder="Cole texto, anotações da aula, conteúdo do livro..."
                      rows={7}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors resize-none"
                    />
                  </div>
                )}
                {modoEntrada === 'pdf' && (
                  <label className="block w-full bg-bg border-2 border-dashed border-border hover:border-brand rounded-xl px-4 py-12 text-center cursor-pointer transition-colors">
                    <input type="file" accept="application/pdf" onChange={(e) => setArquivo(e.target.files?.[0] || null)} className="hidden" />
                    <FileUp size={28} className="mx-auto mb-2 text-text-muted" />
                    {arquivo ? (
                      <><p className="text-text text-sm font-medium">{arquivo.name}</p><p className="text-text-muted text-xs mt-1">Clique para trocar</p></>
                    ) : (
                      <><p className="text-text text-sm font-medium">Clique para selecionar um PDF</p><p className="text-text-muted text-xs mt-1">Material da escola, livro, apostila...</p></>
                    )}
                  </label>
                )}

                {/* Quantidade */}
                <div>
                  <label className="text-text-muted text-sm mb-2 block">Quantos flashcards?</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map((n) => (
                      <button
                        key={n}
                        onClick={() => setQuantidade(n)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          quantidade === n ? 'bg-brand text-white' : 'bg-bg border border-border text-text-muted hover:text-text'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={gerarFlashcards}
                  disabled={loading || !podeGerar}
                  className="w-full bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Gerando flashcards...' : 'Gerar flashcards com IA'}
                </button>

                {flashcards.length > 0 && (
                  <button
                    onClick={() => { setModoEstudo(true); setIndiceAtual(0); setVirado(false) }}
                    className="w-full border border-border hover:border-brand text-text-muted hover:text-text py-3 rounded-xl text-sm font-medium transition-colors"
                  >
                    Continuar estudando os {flashcards.length} flashcards
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function SidebarLink({ href, icon: Icon, label, active }: {
  href: string; icon: React.ElementType; label: string; active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
        active
          ? 'bg-bg-hover text-text font-semibold'
          : 'text-text-muted hover:text-text hover:bg-bg-hover'
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  )
}
