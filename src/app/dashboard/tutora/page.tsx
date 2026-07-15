'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import {
  MessageCircle, Send, Pencil, Trash2,
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { HistoryPanel } from '@/components/HistoryPanel'
import { createClient } from '@/lib/supabase'

type Mensagem = { role: 'user' | 'assistant'; content: string }
type ChatItem = { id: number; titulo: string; atualizado_em: string }

const SUGESTOES = [
  'Explica função do 2° grau',
  'Como funciona a fotossíntese?',
  'O que foi a Ditadura Militar?',
  'Me ajuda com estequiometria',
  'Diferença entre mitose e meiose',
  'O que são ondas eletromagnéticas?',
]

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  const hrs  = Math.floor(min / 60)
  const dias = Math.floor(hrs / 24)
  if (min < 2)    return 'agora'
  if (min < 60)   return `${min}min`
  if (hrs < 24)   return `${hrs}h atrás`
  if (dias === 1) return 'ontem'
  return `há ${dias} dias`
}

export default function IATutora() {
  const { profile } = useProfile()
  const primeiroNome = profile?.nome?.split(' ')[0] ?? null

  const [mensagens,  setMensagens ] = useState<Mensagem[]>([])
  const [input,      setInput     ] = useState('')
  const [loading,    setLoading   ] = useState(false)
  const [sessaoId,   setSessaoId  ] = useState<number | null>(null)
  const [chats,      setChats     ] = useState<ChatItem[]>([])
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [tituloEdit, setTituloEdit] = useState('')

  const fimRef      = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Carrega lista de chats ──────────────────────────────────────────────────
  const carregarChats = useCallback(async () => {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    const { data } = await sb
      .from('sessoes_tutora')
      .select('id, titulo, atualizado_em')
      .eq('user_id', user.id)
      .order('atualizado_em', { ascending: false })
      .limit(30)
    if (data) setChats(data as ChatItem[])
  }, [])

  useEffect(() => { carregarChats() }, [carregarChats])
  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensagens])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  // ── Novo chat ───────────────────────────────────────────────────────────────
  function novaConversa() {
    setMensagens([])
    setSessaoId(null)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  // ── Carrega chat existente ──────────────────────────────────────────────────
  async function abrirChat(id: number) {
    const sb = createClient()
    const { data } = await sb
      .from('sessoes_tutora')
      .select('mensagens')
      .eq('id', id)
      .single()
    if (data) {
      setMensagens(data.mensagens as Mensagem[])
      setSessaoId(id)
    }
  }

  // ── Envia mensagem ──────────────────────────────────────────────────────────
  async function enviar(texto?: string) {
    const conteudo = texto ?? input
    if (!conteudo.trim() || loading) return

    const nova: Mensagem = { role: 'user', content: conteudo }
    const lista = [...mensagens, nova]
    setMensagens(lista)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    let respostaTexto = ''
    try {
      const res = await fetch('/api/tutora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: lista }),
      })
      const dados = await res.json()
      respostaTexto = dados.resposta ?? 'Erro ao processar.'
    } catch {
      respostaTexto = 'Erro ao conectar. Tente novamente.'
    }

    const listaFinal: Mensagem[] = [...lista, { role: 'assistant', content: respostaTexto }]
    setMensagens(listaFinal)
    setLoading(false)

    // Salva/atualiza no Supabase
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return

    if (!sessaoId) {
      // Cria nova sessão com título = trecho da primeira mensagem
      const titulo = conteudo.slice(0, 60) + (conteudo.length > 60 ? '…' : '')
      const { data } = await sb
        .from('sessoes_tutora')
        .insert({ user_id: user.id, titulo, mensagens: listaFinal })
        .select('id')
        .single()
      if (data) {
        setSessaoId(data.id)
        setChats(prev => [{ id: data.id, titulo, atualizado_em: new Date().toISOString() }, ...prev])
      }
    } else {
      await sb.from('sessoes_tutora').update({ mensagens: listaFinal }).eq('id', sessaoId)
      setChats(prev => prev.map(c =>
        c.id === sessaoId ? { ...c, atualizado_em: new Date().toISOString() } : c
      ))
    }
  }

  // ── Renomeia título ─────────────────────────────────────────────────────────
  async function salvarTitulo(id: number) {
    if (!tituloEdit.trim()) return
    const sb = createClient()
    await sb.from('sessoes_tutora').update({ titulo: tituloEdit }).eq('id', id)
    setChats(prev => prev.map(c => c.id === id ? { ...c, titulo: tituloEdit } : c))
    setEditandoId(null)
  }

  async function deletarChat(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    const sb = createClient()
    await sb.from('sessoes_tutora').delete().eq('id', id)
    setChats(prev => prev.filter(c => c.id !== id))
    if (sessaoId === id) novaConversa()
  }

  const vazio = mensagens.length === 0

  const inputBar = (
    <div className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 transition-all shadow-sm focus-within:border-brand/50 focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.12)]">
      <textarea
        ref={textareaRef}
        value={input}
        rows={1}
        onChange={e => { setInput(e.target.value); autoResize() }}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
        placeholder="Pergunte qualquer coisa sobre as matérias..."
        className="no-focus-ring w-full bg-transparent text-text text-sm placeholder:text-text-faint resize-none focus:outline-none"
      />
      <div className="flex items-center justify-end mt-2.5">
        <button
          onClick={() => enviar()}
          disabled={loading || !input.trim()}
          className="w-8 h-8 bg-brand hover:bg-brand-hover disabled:opacity-30 rounded-full flex items-center justify-center transition-colors"
        >
          <Send size={13} className="text-white" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg flex app-atmosphere">

      <DashboardSidebar />

      {/* ── Histórico de conversas ── */}
      <HistoryPanel>
        {chats.length === 0 ? (
          <p className="text-text-faint text-xs text-center py-6 px-2 leading-relaxed">
            Nenhuma conversa ainda. Comece digitando uma pergunta!
          </p>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => abrirChat(chat.id)}
              className={`group relative px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                sessaoId === chat.id
                  ? 'bg-brand/10 text-brand'
                  : 'hover:bg-bg-hover text-text-muted hover:text-text'
              }`}
            >
              {editandoId === chat.id ? (
                <input
                  autoFocus
                  value={tituloEdit}
                  onChange={e => setTituloEdit(e.target.value)}
                  onBlur={() => salvarTitulo(chat.id)}
                  onKeyDown={e => e.key === 'Enter' && salvarTitulo(chat.id)}
                  className="w-full bg-transparent text-sm text-text focus:outline-none"
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <>
                  <p className="text-sm leading-snug line-clamp-2 pr-9">{chat.titulo}</p>
                  <p className="text-[10px] text-text-faint mt-0.5">{tempoRelativo(chat.atualizado_em)}</p>
                </>
              )}
              {/* Ações (visíveis no hover) */}
              <div className="absolute right-2 top-2 hidden group-hover:flex gap-0.5">
                <button
                  onClick={e => { e.stopPropagation(); setEditandoId(chat.id); setTituloEdit(chat.titulo) }}
                  className="w-6 h-6 text-text-faint hover:text-text rounded-lg flex items-center justify-center transition-colors"
                  title="Renomear"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={e => deletarChat(chat.id, e)}
                  className="w-6 h-6 text-text-faint hover:text-red-500 rounded-lg flex items-center justify-center transition-colors"
                  title="Deletar"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))
        )}
      </HistoryPanel>

      {/* ── Chat ── */}
      <main className="flex-1 min-w-0 ml-0 md:ml-[344px] flex flex-col h-[calc(100dvh-4rem)] md:h-screen overflow-hidden">
        {vazio ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 pb-10">
            <h1 className="text-text text-3xl md:text-4xl font-bold tracking-tight mb-2 text-center">
              Olá{primeiroNome ? `, ${primeiroNome}` : ''}
            </h1>
            <p className="text-text-muted text-lg md:text-xl mb-10 text-center">Sobre o que quer aprender hoje?</p>
            <div className="flex flex-wrap gap-2 justify-center mb-10 max-w-xl">
              {SUGESTOES.map(s => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="border border-border text-text-muted hover:text-text hover:border-brand/50 text-sm px-4 py-2 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="w-full max-w-2xl">{inputBar}</div>
            <p className="text-text-faint text-xs mt-3">TeraEdu IA pode cometer erros. Sempre verifique informações importantes.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-8">
              <div className="max-w-2xl mx-auto px-4 flex flex-col gap-6">
                {mensagens.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageCircle size={13} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[82%] text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-bg-card border border-border text-text px-4 py-3 rounded-2xl rounded-tr-sm'
                        : 'text-text'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-text prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-p:leading-relaxed prose-p:text-text prose-strong:text-text prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-li:text-text prose-code:text-brand prose-code:bg-bg-card prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-bg-card prose-pre:border prose-pre:border-border prose-blockquote:border-l-brand prose-blockquote:text-text-muted prose-a:text-brand">
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle size={13} className="text-white" />
                    </div>
                    <div className="pt-2 flex gap-1">
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={fimRef} />
              </div>
            </div>
            <div className="px-4 pb-5 pt-2">
              <div className="max-w-2xl mx-auto">
                {inputBar}
                <p className="text-text-faint text-xs mt-2.5 text-center">TeraEdu IA pode cometer erros. Sempre verifique informações importantes.</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
