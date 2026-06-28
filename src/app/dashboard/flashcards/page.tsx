'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Flashcard = {
  pergunta: string
  resposta: string
}

type ModoEntrada = 'tema' | 'texto' | 'pdf'

export default function Flashcards() {
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

      const resposta = await fetch('/api/flashcards', {
        method: 'POST',
        body: formData
      })
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
    setFlashcards([])
    setTema('')
    setTexto('')
    setArquivo(null)
    setModoEstudo(false)
    setIndiceAtual(0)
    setVirado(false)
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
          <Link href="/dashboard/flashcards" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-medium">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Flashcards
          </Link>
          <Link href="/dashboard/resumos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
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
            <h1 className="text-white text-2xl font-semibold">Flashcards</h1>
            <p className="text-[#8b8fa8] text-sm mt-1">A IA cria flashcards a partir de qualquer conteúdo</p>
          </div>

          {!modoEstudo ? (
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
                    <label className="text-[#8b8fa8] text-sm mb-2 block">Sobre o que você quer estudar?</label>
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
                  <label className="text-[#8b8fa8] text-sm mb-2 block">Quantos flashcards?</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map((n) => (
                      <button
                        key={n}
                        onClick={() => setQuantidade(n)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          quantidade === n
                            ? 'bg-[#2563eb] text-white'
                            : 'bg-[#0f1117] border border-[#2a2d3a] text-[#8b8fa8] hover:text-white'
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
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors mt-2"
                >
                  {loading ? 'Gerando flashcards...' : 'Gerar flashcards com IA'}
                </button>
              </div>

              {flashcards.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#2a2d3a]">
                  <button
                    onClick={() => { setModoEstudo(true); setIndiceAtual(0); setVirado(false) }}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] hover:border-[#2563eb] text-white py-3 rounded-xl text-sm font-medium transition-colors"
                  >
                    Continuar estudando os {flashcards.length} flashcards
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#8b8fa8] text-sm">Card {indiceAtual + 1} de {flashcards.length}</span>
                  <button onClick={novosFlashcards} className="text-[#8b8fa8] hover:text-white text-sm transition-colors">
                    Novos flashcards
                  </button>
                </div>
                <div className="h-1.5 bg-[#1a1d27] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563eb] transition-all duration-300" style={{ width: `${((indiceAtual + 1) / flashcards.length) * 100}%` }}></div>
                </div>
              </div>

              <div
                onClick={() => setVirado(!virado)}
                className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-12 min-h-[400px] flex flex-col items-center justify-center cursor-pointer hover:border-[#2563eb] transition-all"
              >
                <div className="text-center">
                  <p className="text-[#4a4d5e] text-xs uppercase tracking-wide mb-4">{virado ? 'Resposta' : 'Pergunta'}</p>
                  <p className="text-white text-xl leading-relaxed">{virado ? flashcards[indiceAtual]?.resposta : flashcards[indiceAtual]?.pergunta}</p>
                </div>
                <p className="text-[#4a4d5e] text-xs mt-8">Clique no card para {virado ? 'voltar' : 'ver a resposta'}</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={cardAnterior} disabled={indiceAtual === 0} className="flex-1 bg-[#1a1d27] border border-[#2a2d3a] hover:border-[#2563eb] disabled:opacity-30 text-white py-3 rounded-xl text-sm font-medium transition-colors">
                  ← Anterior
                </button>
                <button onClick={proximoCard} className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3 rounded-xl text-sm font-medium transition-colors">
                  {indiceAtual === flashcards.length - 1 ? 'Finalizar' : 'Próximo →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}