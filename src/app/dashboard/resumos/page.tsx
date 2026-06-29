'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle,
  BarChart3, Calendar, Sun, Moon, Settings, Pencil, ClipboardList,
  FileUp, Send, RotateCcw
} from 'lucide-react'
import { useNome } from '@/hooks/useNome'

type ModoEntrada = 'tema' | 'texto' | 'pdf'
type Tamanho = 'curto' | 'medio' | 'completo'

export default function Resumos() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { primeiroNome, nome } = useNome()

  const [modoEntrada, setModoEntrada] = useState<ModoEntrada>('tema')
  const [tema, setTema] = useState('')
  const [texto, setTexto] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [tamanho, setTamanho] = useState<Tamanho>('medio')
  const [resumo, setResumo] = useState('')
  const [loading, setLoading] = useState(false)
  const [perguntas, setPerguntas] = useState<{ pergunta: string; resposta: string }[]>([])
  const [pergunta, setPergunta] = useState('')
  const [loadingPergunta, setLoadingPergunta] = useState(false)

  async function gerarResumo() {
    if (loading) return
    if (modoEntrada === 'tema' && !tema.trim()) return
    if (modoEntrada === 'texto' && !texto.trim()) return
    if (modoEntrada === 'pdf' && !arquivo) return
    setLoading(true)
    setResumo('')
    try {
      const formData = new FormData()
      formData.append('modo', modoEntrada)
      formData.append('tamanho', tamanho)
      if (modoEntrada === 'tema') formData.append('tema', tema)
      if (modoEntrada === 'texto') formData.append('texto', texto)
      if (modoEntrada === 'pdf' && arquivo) formData.append('arquivo', arquivo)
      const res = await fetch('/api/resumos', { method: 'POST', body: formData })
      const dados = await res.json()
      setResumo(dados.resumo)
    } catch {
      alert('Erro ao gerar resumo.')
    }
    setLoading(false)
  }

  async function enviarPergunta() {
    if (!pergunta.trim() || loadingPergunta) return
    const q = pergunta
    setPergunta('')
    setLoadingPergunta(true)
    try {
      const res = await fetch('/api/resumos/pergunta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumo, pergunta: q, historico: perguntas }),
      })
      const dados = await res.json()
      setPerguntas([...perguntas, { pergunta: q, resposta: dados.resposta }])
    } catch {
      alert('Erro ao enviar pergunta.')
    }
    setLoadingPergunta(false)
  }

  function novoResumo() {
    setResumo(''); setTema(''); setTexto(''); setArquivo(null); setPerguntas([]); setPergunta('')
  }

  const podeGerar =
    (modoEntrada === 'tema' && tema.trim()) ||
    (modoEntrada === 'texto' && texto.trim()) ||
    (modoEntrada === 'pdf' && arquivo)

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-bg border-r border-border/60 flex flex-col fixed h-full">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={26} height={26} />
          <span className="text-text font-bold tracking-tight">TeraEdu</span>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 flex-1 pt-1">
          <SidebarLink href="/dashboard"            icon={LayoutDashboard} label="Início" />
          <SidebarLink href="/dashboard/questoes"   icon={FileQuestion}    label="Questões" />
          <SidebarLink href="/dashboard/flashcards" icon={Layers}          label="Flashcards" />
          <SidebarLink href="/dashboard/resumos"    icon={FileText}        label="Resumos" active />
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

        {!resumo ? (
          /* ── Tela de criação ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
            <div className="w-full max-w-xl">
              <h1 className="text-text text-3xl font-bold tracking-tight mb-1.5 text-center">Resumos com IA</h1>
              <p className="text-text-muted text-center mb-10">Gere resumos bem estruturados de qualquer conteúdo</p>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-bg-card rounded-xl p-1">
                {([
                  { id: 'tema' as ModoEntrada,  label: 'Tema',       icon: Pencil        },
                  { id: 'texto' as ModoEntrada, label: 'Colar texto', icon: ClipboardList },
                  { id: 'pdf' as ModoEntrada,   label: 'PDF',         icon: FileUp        },
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
                    <label className="text-text-muted text-sm mb-2 block">Sobre o que você quer um resumo?</label>
                    <input
                      type="text"
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') gerarResumo() }}
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

                {/* Tamanho */}
                <div>
                  <label className="text-text-muted text-sm mb-2 block">Tamanho do resumo</label>
                  <div className="flex gap-2">
                    {([
                      { id: 'curto'    as Tamanho, label: 'Curto',    desc: 'Principais pontos' },
                      { id: 'medio'    as Tamanho, label: 'Médio',    desc: 'Equilibrado'        },
                      { id: 'completo' as Tamanho, label: 'Completo', desc: 'Detalhado'           },
                    ]).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTamanho(t.id)}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors text-left ${
                          tamanho === t.id ? 'bg-brand text-white' : 'bg-bg border border-border text-text-muted hover:text-text'
                        }`}
                      >
                        <div>{t.label}</div>
                        <div className="text-xs opacity-70 font-normal">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={gerarResumo}
                  disabled={loading || !podeGerar}
                  className="w-full bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Gerando resumo...' : 'Gerar resumo com IA'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Resumo gerado ── */
          <div className="flex-1 px-10 py-8 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-text font-semibold">Resumo gerado</h2>
              <button
                onClick={novoResumo}
                className="flex items-center gap-1.5 text-text-muted hover:text-text text-sm transition-colors"
              >
                <RotateCcw size={13} /> Novo resumo
              </button>
            </div>

            {/* Conteúdo do resumo */}
            <div className="bg-bg-card rounded-2xl p-8 mb-6">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-text prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-p:leading-relaxed prose-p:text-text prose-strong:text-text prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-li:text-text prose-code:text-brand prose-code:bg-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-bg prose-pre:border prose-pre:border-border prose-blockquote:border-l-brand prose-blockquote:text-text-muted prose-a:text-brand">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {resumo}
                </ReactMarkdown>
              </div>
            </div>

            {/* Q&A sobre o resumo */}
            <div className="bg-bg-card rounded-2xl p-6">
              <h3 className="text-text font-semibold mb-1 flex items-center gap-2">
                <MessageCircle size={15} className="text-brand" /> Dúvidas sobre o resumo?
              </h3>
              <p className="text-text-muted text-sm mb-5">Pergunte qualquer coisa sobre o conteúdo acima</p>

              {perguntas.length > 0 && (
                <div className="flex flex-col gap-4 mb-5">
                  {perguntas.map((p, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="bg-brand text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm self-end max-w-[80%]">{p.pergunta}</div>
                      <div className="bg-bg border border-border text-text text-sm px-4 py-3 rounded-2xl rounded-tl-sm self-start max-w-[90%]">
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-p:text-text prose-headings:text-text prose-strong:text-text">
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {p.resposta}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loadingPergunta && (
                    <div className="bg-bg border border-border px-4 py-3 rounded-2xl rounded-tl-sm self-start">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') enviarPergunta() }}
                  placeholder="Faça uma pergunta sobre o resumo..."
                  className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors"
                />
                <button
                  onClick={enviarPergunta}
                  disabled={loadingPergunta || !pergunta.trim()}
                  className="w-11 h-11 bg-brand hover:bg-brand-hover disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send size={15} className="text-white" />
                </button>
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
