'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

type ModoEntrada = 'tema' | 'texto' | 'pdf'
type Tamanho = 'curto' | 'medio' | 'completo'

export default function Resumos() {
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

  function novoResumo() {
  setResumo('')
  setTema('')
  setTexto('')
  setArquivo(null)
  setPerguntas([])
  setPergunta('')
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

  const podeGerar =
    (modoEntrada === 'tema' && tema.trim()) ||
    (modoEntrada === 'texto' && texto.trim()) ||
    (modoEntrada === 'pdf' && arquivo)

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
          <Link href="/dashboard/resumos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-medium">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Resumos
          </Link>
          <Link href="/dashboard/tutora" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
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

      {/* Main */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-semibold">Resumos com IA</h1>
            <p className="text-[#8b8fa8] text-sm mt-1">Gere resumos bem estruturados de qualquer conteúdo</p>
          </div>

          {!resumo ? (
            <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8">
              {/* Tabs de modo */}
              <div className="flex gap-2 mb-6 bg-[#0f1117] p-1 rounded-xl">
                {([
                  { id: 'tema' as ModoEntrada, label: 'Tema', icon: '✏️' },
                  { id: 'texto' as ModoEntrada, label: 'Colar texto', icon: '📋' },
                  { id: 'pdf' as ModoEntrada, label: 'PDF', icon: '📄' },
                ]).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModoEntrada(m.id)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      modoEntrada === m.id
                        ? 'bg-[#2563eb] text-white'
                        : 'text-[#8b8fa8] hover:text-white'
                    }`}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-5">
                {modoEntrada === 'tema' && (
                  <div>
                    <label className="text-[#8b8fa8] text-sm mb-2 block">Sobre o que você quer um resumo?</label>
                    <input
                      type="text"
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                      placeholder="Ex: Revolução Francesa, Mitose, Função Quadrática..."
                      className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a4d5e] focus:outline-none focus:border-[#2563eb] transition-colors"
                    />
                  </div>
                )}

                {modoEntrada === 'texto' && (
                  <div>
                    <label className="text-[#8b8fa8] text-sm mb-2 block">Cole o conteúdo aqui</label>
                    <textarea
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      placeholder="Cole texto, anotações da aula, conteúdo do livro..."
                      rows={8}
                      className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a4d5e] focus:outline-none focus:border-[#2563eb] transition-colors resize-none"
                    />
                  </div>
                )}

                {modoEntrada === 'pdf' && (
                  <div>
                    <label className="text-[#8b8fa8] text-sm mb-2 block">Anexe um PDF</label>
                    <label className="block w-full bg-[#0f1117] border-2 border-dashed border-[#2a2d3a] hover:border-[#2563eb] rounded-xl px-4 py-12 text-center cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="text-4xl mb-2">📄</div>
                      {arquivo ? (
                        <>
                          <p className="text-white text-sm font-medium">{arquivo.name}</p>
                          <p className="text-[#8b8fa8] text-xs mt-1">Clique para trocar de arquivo</p>
                        </>
                      ) : (
                        <>
                          <p className="text-white text-sm font-medium">Clique para selecionar um PDF</p>
                          <p className="text-[#8b8fa8] text-xs mt-1">Material da escola, livro, apostila...</p>
                        </>
                      )}
                    </label>
                  </div>
                )}

                <div>
                  <label className="text-[#8b8fa8] text-sm mb-2 block">Tamanho do resumo</label>
                  <div className="flex gap-2">
                    {([
                      { id: 'curto' as Tamanho, label: 'Curto', desc: 'Principais pontos' },
                      { id: 'medio' as Tamanho, label: 'Médio', desc: 'Equilibrado' },
                      { id: 'completo' as Tamanho, label: 'Completo', desc: 'Detalhado' },
                    ]).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTamanho(t.id)}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors text-left ${
                          tamanho === t.id
                            ? 'bg-[#2563eb] text-white'
                            : 'bg-[#0f1117] border border-[#2a2d3a] text-[#8b8fa8] hover:text-white'
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
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors mt-2"
                >
                  {loading ? 'Gerando resumo...' : 'Gerar resumo com IA'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#8b8fa8] text-sm">Resumo gerado</span>
                <button onClick={novoResumo} className="text-[#8b8fa8] hover:text-white text-sm transition-colors">
                  Novo resumo
                </button>
              </div>
              <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8">
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-code:text-[#60a5fa] prose-code:bg-[#0f1117] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#0f1117] prose-pre:border prose-pre:border-[#2a2d3a] prose-blockquote:border-l-[#2563eb] prose-blockquote:text-[#8b8fa8] prose-a:text-[#60a5fa]">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {resumo}
                  </ReactMarkdown>
                  {/* Seção de perguntas */}
<div className="mt-8 pt-8 border-t border-[#2a2d3a]">
  <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
    💬 Dúvidas sobre o resumo?
  </h3>
  <p className="text-[#8b8fa8] text-sm mb-4">Pergunte qualquer coisa sobre o conteúdo acima</p>

  {/* Histórico de perguntas */}
  {perguntas.length > 0 && (
    <div className="flex flex-col gap-4 mb-4">
      {perguntas.map((p, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="bg-[#2563eb] text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm self-end max-w-[80%]">
            {p.pergunta}
          </div>
          <div className="bg-[#0f1117] border border-[#2a2d3a] text-white text-sm px-4 py-3 rounded-2xl rounded-tl-sm self-start max-w-[90%]">
            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-white prose-strong:text-white">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {p.resposta}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
      {loadingPergunta && (
        <div className="bg-[#0f1117] border border-[#2a2d3a] px-4 py-3 rounded-2xl rounded-tl-sm self-start">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[#8b8fa8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#8b8fa8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#8b8fa8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  )}

  {/* Input */}
  <div className="flex gap-2">
    <input
      type="text"
      value={pergunta}
      onChange={(e) => setPergunta(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') enviarPergunta() }}
      placeholder="Faça uma pergunta sobre o resumo..."
      className="flex-1 bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a4d5e] focus:outline-none focus:border-[#2563eb] transition-colors"
    />
    <button
      onClick={enviarPergunta}
      disabled={loadingPergunta || !pergunta.trim()}
      className="w-12 h-12 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
    >
      <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    </button>
  </div>
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