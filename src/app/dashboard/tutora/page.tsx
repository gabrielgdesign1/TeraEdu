'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useTheme } from "next-themes"
import { LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle, BarChart3, Calendar, Sun, Moon, Settings, Send } from "lucide-react"

type Mensagem = { role: 'user' | 'assistant', content: string }

export default function IATutora() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { role: 'assistant', content: 'Olá! Sou a tutora de IA do TeraEdu 👋 Pode me perguntar qualquer coisa sobre as matérias do ENEM e vestibulares. Como posso te ajudar hoje?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensagens])

  async function enviarMensagem() {
    if (!input.trim() || loading) return
    const novaMensagem: Mensagem = { role: 'user', content: input }
    const novasMensagens = [...mensagens, novaMensagem]
    setMensagens(novasMensagens)
    setInput('')
    setLoading(true)
    try {
      const resposta = await fetch('/api/tutora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: novasMensagens })
      })
      const dados = await resposta.json()
      setMensagens([...novasMensagens, { role: 'assistant', content: dados.resposta }])
    } catch {
      setMensagens([...novasMensagens, { role: 'assistant', content: 'Erro ao conectar com a IA. Tente novamente.' }])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-60 bg-bg-card border-r border-border flex flex-col fixed h-full">
        <div className="flex items-center gap-2 px-5 py-5">
          <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={28} height={28} />
          <span className="text-text font-semibold text-base">TeraEdu</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 py-2 flex-1">
          <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink href="/dashboard/questoes" icon={FileQuestion} label="Questões" />
          <SidebarLink href="/dashboard/flashcards" icon={Layers} label="Flashcards" />
          <SidebarLink href="/dashboard/resumos" icon={FileText} label="Resumos" />
          <SidebarLink href="/dashboard/tutora" icon={MessageCircle} label="IA Tutora" active />
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

      {/* Chat */}
      <main className="flex-1 ml-60 flex flex-col h-screen">
        <div className="border-b border-border px-8 py-5 flex items-center gap-3 bg-bg-card">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-text font-semibold">IA Tutora</h1>
            <p className="text-text-muted text-xs">Tire dúvidas sobre qualquer matéria do ENEM</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
            {mensagens.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                    <MessageCircle size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-brand text-white rounded-tr-sm' : 'bg-bg-card border border-border text-text rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-text prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-p:leading-relaxed prose-p:text-text prose-strong:text-text prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-li:text-text prose-code:text-brand prose-code:bg-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-bg prose-pre:border prose-pre:border-border prose-blockquote:border-l-brand prose-blockquote:text-text-muted prose-a:text-brand">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div className="bg-bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </div>
        </div>

        <div className="border-t border-border px-8 py-4 bg-bg-card">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <div className="flex-1 bg-bg border border-border rounded-2xl px-4 py-3 focus-within:border-brand transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensagem() } }}
                placeholder="Pergunte qualquer coisa..."
                className="w-full bg-transparent text-text text-sm placeholder:text-text-faint resize-none focus:outline-none max-h-32"
                rows={1}
              />
            </div>
            <button onClick={enviarMensagem} disabled={loading || !input.trim()} className="w-10 h-10 bg-brand hover:bg-brand-hover disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
              <Send size={16} className="text-white" />
            </button>
          </div>
          <p className="text-text-faint text-xs mt-2 text-center">TeraEdu IA pode cometer erros. Sempre verifique informações importantes.</p>
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