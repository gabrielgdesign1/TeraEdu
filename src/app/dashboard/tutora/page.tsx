'use client'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Mensagem = {
  role: 'user' | 'assistant'
  content: string
}

export default function IATutora() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou a tutora de IA do TeraEdu 👋 Pode me perguntar qualquer coisa sobre as matérias do ENEM e vestibulares — Matemática, Física, Química, Biologia, História, Geografia, Português, Inglês e muito mais. Como posso te ajudar hoje?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

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
    <div className="min-h-screen bg-[#0f1117] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1d27] border-r border-[#2a2d3a] flex flex-col fixed h-full">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-[#2a2d3a]">
          <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={32} height={32} />
          <span className="text-white font-semibold text-lg">TeraEdu</span>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </Link>
          <Link href="/dashboard/questoes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            Questões
          </Link>
          <Link href="/dashboard/flashcards" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Flashcards
          </Link>
          <Link href="/dashboard/resumos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Resumos
          </Link>
          <Link href="/dashboard/tutora" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-medium">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            IA Tutora
          </Link>
          <Link href="/dashboard/desempenho" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Desempenho
          </Link>
          <Link href="/dashboard/plano" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Plano de Estudos
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-[#2a2d3a]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#2a2d3a] cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-[#2563eb] rounded-full flex items-center justify-center text-white text-sm font-semibold">G</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Gabriel</p>
              <p className="text-[#8b8fa8] text-xs truncate">gabriel@email.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 ml-64 flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-[#2a2d3a] px-8 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2563eb] rounded-xl flex items-center justify-center">
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <div>
            <h1 className="text-white font-semibold">IA Tutora</h1>
            <p className="text-[#8b8fa8] text-xs">Tire dúvidas sobre qualquer conteúdo de vestibulares.</p>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4">
          {mensagens.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-[#2563eb] rounded-xl flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </div>
              )}
              <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
  msg.role === 'user'
    ? 'bg-[#2563eb] text-white rounded-tr-sm'
    : 'bg-[#1a1d27] border border-[#2a2d3a] text-white rounded-tl-sm'
}`}>
  {msg.role === 'assistant' ? (
    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-code:text-[#60a5fa] prose-code:bg-[#0f1117] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#0f1117] prose-pre:border prose-pre:border-[#2a2d3a] prose-blockquote:border-l-[#2563eb] prose-blockquote:text-[#8b8fa8] prose-a:text-[#60a5fa]">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {msg.content}
      </ReactMarkdown>
    </div>
  ) : (
    msg.content
  )}
</div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-[#2563eb] rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div className="bg-[#1a1d27] border border-[#2a2d3a] px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#8b8fa8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#8b8fa8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#8b8fa8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={fimRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#2a2d3a] px-8 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl px-4 py-3 focus-within:border-[#2563eb] transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensagem() } }}
                placeholder="Pergunte qualquer coisa... (Enter para enviar)"
                className="w-full bg-transparent text-white text-sm placeholder:text-[#4a4d5e] resize-none focus:outline-none max-h-32"
                rows={1}
              />
            </div>
            <button
              onClick={enviarMensagem}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <p className="text-[#4a4d5e] text-xs mt-2 text-center">TeraEdu IA pode cometer erros. Sempre verifique informações importantes.</p>
        </div>
      </main>
    </div>
  )
}