'use client'

import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import {
  MessageCircle, Pencil, ClipboardList,
  FileUp, Send, Plus, Trash2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { HistoryPanel } from '@/components/HistoryPanel'
import { createClient } from '@/lib/supabase'
import { extractPdfText } from '@/lib/extractPdfText'

type ModoEntrada = 'tema' | 'texto' | 'pdf'
type Tamanho     = 'curto' | 'medio' | 'completo'
type QA          = { pergunta: string; resposta: string }
type HistoricoItem = { id: number; titulo: string; criado_em: string }

function dataRelativa(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const dias  = Math.floor(diff / 86400000)
  if (dias === 0)  return 'hoje'
  if (dias === 1)  return 'ontem'
  if (dias < 7)   return `${dias} dias atrás`
  if (dias < 30)  return `${Math.floor(dias / 7)} sem. atrás`
  return `${Math.floor(dias / 30)} mes. atrás`
}

export default function Resumos() {
  const [modoEntrada, setModoEntrada] = useState<ModoEntrada>('tema')
  const [tema,        setTema        ] = useState('')
  const [texto,       setTexto       ] = useState('')
  const [arquivo,     setArquivo     ] = useState<File | null>(null)
  const [tamanho,     setTamanho     ] = useState<Tamanho>('medio')
  const [resumo,      setResumo      ] = useState('')
  const [loading,     setLoading     ] = useState(false)
  const [perguntas,   setPerguntas   ] = useState<QA[]>([])
  const [pergunta,    setPergunta    ] = useState('')
  const [loadingQ,    setLoadingQ    ] = useState(false)
  const [sessaoId,    setSessaoId    ] = useState<number | null>(null)
  const [historico,   setHistorico   ] = useState<HistoricoItem[]>([])

  const carregarHistorico = useCallback(async () => {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    const { data } = await sb
      .from('sessoes_resumos')
      .select('id, titulo, criado_em')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(30)
    if (data) setHistorico(data as HistoricoItem[])
  }, [])

  useEffect(() => { carregarHistorico() }, [carregarHistorico])

  function novoResumo() {
    setResumo(''); setTema(''); setTexto(''); setArquivo(null)
    setPerguntas([]); setPergunta(''); setSessaoId(null)
  }

  async function removerSessao(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    const sb = createClient()
    await sb.from('sessoes_resumos').delete().eq('id', id)
    setHistorico(prev => prev.filter(h => h.id !== id))
    if (sessaoId === id) novoResumo()
  }

  async function abrirSessao(id: number) {
    const sb = createClient()
    const { data } = await sb
      .from('sessoes_resumos')
      .select('resumo, tema, perguntas, modo_entrada')
      .eq('id', id)
      .single()
    if (data) {
      setResumo(data.resumo)
      setTema(data.tema ?? '')
      setPerguntas(data.perguntas as QA[])
      setModoEntrada(data.modo_entrada as ModoEntrada)
      setSessaoId(id)
    }
  }

  async function gerarResumo() {
    if (loading) return
    if (modoEntrada === 'tema' && !tema.trim()) return
    if (modoEntrada === 'texto' && !texto.trim()) return
    if (modoEntrada === 'pdf' && !arquivo) return
    setLoading(true)
    setResumo('')
    try {
      const formData = new FormData()
      formData.append('tamanho', tamanho)
      if (modoEntrada === 'tema') {
        formData.append('modo', 'tema')
        formData.append('tema', tema)
      } else if (modoEntrada === 'texto') {
        formData.append('modo', 'texto')
        formData.append('texto', texto)
      } else if (modoEntrada === 'pdf' && arquivo) {
        // Extrai o texto do PDF no navegador para evitar o limite de tamanho
        // de payload dos Serverless Functions (envio do arquivo bruto dava 413).
        // "origem" marca que veio de PDF pro servidor aplicar o rate limit de upload.
        const textoExtraido = await extractPdfText(arquivo)
        formData.append('modo', 'texto')
        formData.append('texto', textoExtraido)
        formData.append('origem', 'pdf')
      }
      const res = await fetch('/api/resumos', { method: 'POST', body: formData })
      const dados = await res.json()
      const novoResumoTexto = dados.resumo as string
      setResumo(novoResumoTexto)
      setPerguntas([])
      setSessaoId(null)

      // Salva no Supabase
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        const titulo = tema.trim() || texto.trim().slice(0, 60) || arquivo?.name || 'Resumo'
        const { data } = await sb
          .from('sessoes_resumos')
          .insert({
            user_id:     user.id,
            titulo:      titulo + (titulo.length >= 60 ? '…' : ''),
            modo_entrada: modoEntrada,
            resumo:      novoResumoTexto,
            tema:        tema || null,
            perguntas:   [],
          })
          .select('id')
          .single()
        if (data) {
          setSessaoId(data.id)
          setHistorico(prev => [{
            id:        data.id,
            titulo:    titulo + (titulo.length >= 60 ? '…' : ''),
            criado_em: new Date().toISOString(),
          }, ...prev])
        }
      }
    } catch {
      alert('Erro ao gerar resumo.')
    }
    setLoading(false)
  }

  async function enviarPergunta() {
    if (!pergunta.trim() || loadingQ) return
    const q = pergunta
    setPergunta('')
    setLoadingQ(true)
    try {
      const res = await fetch('/api/resumos/pergunta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumo, pergunta: q, historico: perguntas }),
      })
      const dados = await res.json()
      const novasPerguntas = [...perguntas, { pergunta: q, resposta: dados.resposta }]
      setPerguntas(novasPerguntas)

      if (sessaoId) {
        const sb = createClient()
        await sb.from('sessoes_resumos').update({ perguntas: novasPerguntas }).eq('id', sessaoId)
      }
    } catch {
      alert('Erro ao enviar pergunta.')
    }
    setLoadingQ(false)
  }

  const podeGerar =
    (modoEntrada === 'tema' && tema.trim()) ||
    (modoEntrada === 'texto' && texto.trim()) ||
    (modoEntrada === 'pdf' && arquivo)

  return (
    <div className="min-h-screen bg-bg flex app-atmosphere">

      <DashboardSidebar />

      {/* ── Histórico de resumos ── */}
      <HistoryPanel>
        {historico.length === 0 ? (
          <p className="text-text-faint text-xs text-center py-6 px-2 leading-relaxed">
            Nenhum resumo ainda. Gere o primeiro ao lado!
          </p>
        ) : (
          historico.map(item => (
            <div
              key={item.id}
              onClick={() => abrirSessao(item.id)}
              className={`group relative px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                sessaoId === item.id
                  ? 'bg-brand/10 text-brand'
                  : 'hover:bg-bg-hover text-text-muted hover:text-text'
              }`}
            >
              <p className="text-sm leading-snug line-clamp-2 pr-7">{item.titulo}</p>
              <p className="text-[10px] text-text-faint mt-0.5">{dataRelativa(item.criado_em)}</p>
              <button
                onClick={e => removerSessao(item.id, e)}
                className="absolute right-2 top-2 hidden group-hover:flex w-6 h-6 text-text-faint hover:text-red-500 rounded-lg items-center justify-center transition-colors"
                title="Remover"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))
        )}
      </HistoryPanel>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 ml-0 md:ml-[344px] flex flex-col min-h-screen pb-24 md:pb-0">
        {!resumo ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-10">
            <div className="w-full max-w-xl">
              <h1 className="text-text text-3xl font-bold tracking-tight mb-1.5 text-center">Resumos com IA</h1>
              <p className="text-text-muted text-center mb-10">Gere resumos bem estruturados de qualquer conteúdo</p>

              <div className="flex gap-1 mb-6 bg-bg-card rounded-xl p-1">
                {([
                  { id: 'tema' as ModoEntrada,  label: 'Tema',        icon: Pencil        },
                  { id: 'texto' as ModoEntrada, label: 'Colar texto',  icon: ClipboardList },
                  { id: 'pdf' as ModoEntrada,   label: 'PDF',          icon: FileUp        },
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
                  className="w-full bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-full transition-colors"
                >
                  {loading ? 'Gerando resumo...' : 'Gerar resumo com IA'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 px-4 md:px-10 py-6 md:py-8 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-text font-semibold">{tema || 'Resumo gerado'}</h2>
              <button
                onClick={novoResumo}
                className="flex items-center gap-1.5 text-text-muted hover:text-text text-sm transition-colors border border-border px-4 py-2 rounded-full hover:border-brand/50"
              >
                <Plus size={13} /> Novo resumo
              </button>
            </div>

            <div className="bg-bg-card rounded-2xl p-8 mb-6">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-text prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-p:leading-relaxed prose-p:text-text prose-strong:text-text prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-li:text-text prose-code:text-brand prose-code:bg-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-bg prose-pre:border prose-pre:border-border prose-blockquote:border-l-brand prose-blockquote:text-text-muted prose-a:text-brand">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {resumo}
                </ReactMarkdown>
              </div>
            </div>

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
                  {loadingQ && (
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
                  disabled={loadingQ || !pergunta.trim()}
                  className="w-11 h-11 bg-brand hover:bg-brand-hover disabled:opacity-40 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
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
