'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useTheme } from "next-themes"
import { LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle, BarChart3, Calendar, Sun, Moon, Settings, Pencil, ClipboardList, FileUp, Send } from "lucide-react"

type ModoEntrada = 'tema' | 'texto' | 'pdf'
type Tamanho = 'curto' | 'medio' | 'completo'

export default function Resumos() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [modoEntrada, setModoEntrada] = useState<ModoEntrada>('tema')
  const [tema, setTema] = useState('')
  const [texto, setTexto] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [tamanho, setTamanho] = useState<Tamanho>('medio')
  const [resumo, setResumo] = useState('')
  const [loading, setLoading] = useState(false)
  const [perguntas, setPerguntas] = useState<{pergunta: string, resposta: string}[]>([])
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
      const resposta = await fetch('/api/resumos', { method: 'POST', body: formData })
      const dados = await resposta.json()
      setResumo(dados.resumo)
    } catch {
      alert('Erro ao gerar resumo. Tente novamente.')
    }
    setLoading(false)
  }

  async function enviarPergunta() {
    if (!pergunta.trim() || loadingPergunta) return
    const novaPergunta = pergunta
    setPergunta('')
    setLoadingPergunta(true)
    try {
      const resposta = await fetch('/api/resumos/pergunta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumo, pergunta: novaPergunta, historico: perguntas })
      })
      const dados = await resposta.json()
      setPerguntas([...perguntas, { pergunta: novaPergunta, resposta: dados.resposta }])
    } catch {
      alert('Erro ao enviar pergunta')
    }
    setLoadingPergunta(false)
  }

  function novoResumo() {
    setResumo(''); setTema(''); setTexto(''); setArquivo(null); setPerguntas([]); setPergunta('')
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
          <SidebarLink href="/dashboard/flashcards" icon={Layers} label="Flashcards" />
          <SidebarLink href="/dashboard/resumos" icon={FileText} label="Resumos" active />
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
            <h1 className="text-text text-3xl font-semibold tracking-tight">Resumos com IA</h1>
            <p className="text-text-muted text-sm mt-1.5">Gere resumos bem estruturados de qualquer conteúdo</p>
          </div>

          {!resumo ? (
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
                    <label className="text-text-muted text-sm mb-2 block">Sobre o que você quer um resumo?</label>
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
                  <label className="text-text-muted text-sm mb-2 block">Tamanho do resumo</label>
                  <div className="flex gap-2">
                    {([
                      { id: 'curto' as Tamanho, label: 'Curto', desc: 'Principais pontos' },
                      { id: 'medio' as Tamanho, label: 'Médio', desc: 'Equilibrado' },
                      { id: 'completo' as Tamanho, label: 'Completo', desc: 'Detalhado' },
                    ]).map((t) => (
                      <button key={t.id} onClick={() => setTamanho(t.id)} className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors text-left ${tamanho === t.id ? 'bg-brand text-white' : 'bg-bg border border-border text-text-muted hover:text-text'}`}>
                        <div>{t.label}</div>
                        <div className="text-xs opacity-70 font-normal">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={gerarResumo} disabled={loading || !podeGerar} className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors mt-2">
                  {loading ? 'Gerando resumo...' : 'Gerar resumo com IA'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-muted text-sm">Resumo gerado</span>
                <button onClick={novoResumo} className="text-text-muted hover:text-text text-sm transition-colors">Novo resumo</button>
              </div>
              <div className="bg-bg-card border border-border rounded-2xl p-8">
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-text prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-p:leading-relaxed prose-p:text-text prose-strong:text-text prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-li:text-text prose-code:text-brand prose-code:bg-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-bg prose-pre:border prose-pre:border-border prose-blockquote:border-l-brand prose-blockquote:text-text-muted prose-a:text-brand">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {resumo}
                  </ReactMarkdown>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-text font-semibold mb-1 flex items-center gap-2">
                    <MessageCircle size={16} /> Dúvidas sobre o resumo?
                  </h3>
                  <p className="text-text-muted text-sm mb-4">Pergunte qualquer coisa sobre o conteúdo acima</p>

                  {perguntas.length > 0 && (
                    <div className="flex flex-col gap-4 mb-4">
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
                            <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input type="text" value={pergunta} onChange={(e) => setPergunta(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') enviarPergunta() }} placeholder="Faça uma pergunta sobre o resumo..." className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors" />
                    <button onClick={enviarPergunta} disabled={loadingPergunta || !pergunta.trim()} className="w-12 h-12 bg-brand hover:bg-brand-hover disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                      <Send size={16} className="text-white" />
                    </button>
                  </div>
                </div>
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