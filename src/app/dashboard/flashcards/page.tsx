'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Pencil, ClipboardList,
  FileUp, RotateCcw, ChevronLeft, ChevronRight, Trash2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { HistoryPanel } from '@/components/HistoryPanel'
import { createClient } from '@/lib/supabase'
import { registrarAtividade } from '@/lib/registrarAtividade'
import { extractPdfText } from '@/lib/extractPdfText'

type Flashcard     = { pergunta: string; resposta: string }
type ModoEntrada   = 'tema' | 'texto' | 'pdf'
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

export default function Flashcards() {
  const [modoEntrada, setModoEntrada] = useState<ModoEntrada>('tema')
  const [tema,        setTema        ] = useState('')
  const [texto,       setTexto       ] = useState('')
  const [arquivo,     setArquivo     ] = useState<File | null>(null)
  const [quantidade,  setQuantidade  ] = useState(5)
  const [flashcards,  setFlashcards  ] = useState<Flashcard[]>([])
  const [loading,     setLoading     ] = useState(false)
  const [indiceAtual, setIndiceAtual ] = useState(0)
  const [virado,      setVirado      ] = useState(false)
  const [modoEstudo,  setModoEstudo  ] = useState(false)
  const [historico,   setHistorico   ] = useState<HistoricoItem[]>([])
  const [sessaoId,    setSessaoId    ] = useState<number | null>(null)

  const carregarHistorico = useCallback(async () => {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    const { data } = await sb
      .from('sessoes_flashcards')
      .select('id, titulo, criado_em')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(30)
    if (data) setHistorico(data as HistoricoItem[])
  }, [])

  useEffect(() => { carregarHistorico() }, [carregarHistorico])

  async function abrirSessao(id: number) {
    const sb = createClient()
    const { data } = await sb
      .from('sessoes_flashcards')
      .select('flashcards')
      .eq('id', id)
      .single()
    if (data) {
      setFlashcards(data.flashcards as Flashcard[])
      setIndiceAtual(0)
      setVirado(false)
      setModoEstudo(true)
      setSessaoId(id)
    }
  }

  async function gerarFlashcards() {
    if (loading) return
    if (modoEntrada === 'tema' && !tema.trim()) return
    if (modoEntrada === 'texto' && !texto.trim()) return
    if (modoEntrada === 'pdf' && !arquivo) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('quantidade', String(quantidade))
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
      const res = await fetch('/api/flashcards', { method: 'POST', body: formData })
      const dados = await res.json()
      const novosCards = dados.flashcards as Flashcard[]
      setFlashcards(novosCards)
      setIndiceAtual(0)
      setVirado(false)
      setModoEstudo(true)
      setSessaoId(null)

      // Salva no Supabase
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        const base = tema.trim() || texto.trim().slice(0, 60) || arquivo?.name || 'Flashcards'
        const titulo = base + (base.length >= 60 ? '…' : '')
        const { data } = await sb
          .from('sessoes_flashcards')
          .insert({ user_id: user.id, titulo, flashcards: novosCards })
          .select('id')
          .single()
        if (data) {
          setSessaoId(data.id)
          setHistorico(prev => [{ id: data.id, titulo, criado_em: new Date().toISOString() }, ...prev])
        }
      }
    } catch {
      alert('Erro ao gerar flashcards.')
    }
    setLoading(false)
  }

  const FLIP_MS = 480

  function proximo() {
    const delay = virado ? FLIP_MS : 0
    setVirado(false)
    setTimeout(() => {
      if (indiceAtual < flashcards.length - 1) {
        setIndiceAtual(indiceAtual + 1)
      } else {
        setModoEstudo(false)
        registrarAtividade({
          tipo: 'flashcard',
          descricao: `Revisou ${flashcards.length} flashcards${tema ? ` — ${tema}` : ''}`,
          quantidade: flashcards.length,
        })
      }
    }, delay)
  }

  function anterior() {
    const delay = virado ? FLIP_MS : 0
    setVirado(false)
    setTimeout(() => { if (indiceAtual > 0) setIndiceAtual(indiceAtual - 1) }, delay)
  }

  function reiniciar() {
    setFlashcards([]); setTema(''); setTexto(''); setArquivo(null)
    setModoEstudo(false); setIndiceAtual(0); setVirado(false); setSessaoId(null)
  }

  async function removerSessao(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    const sb = createClient()
    await sb.from('sessoes_flashcards').delete().eq('id', id)
    setHistorico(prev => prev.filter(h => h.id !== id))
    if (sessaoId === id) reiniciar()
  }

  const podeGerar =
    (modoEntrada === 'tema' && tema.trim()) ||
    (modoEntrada === 'texto' && texto.trim()) ||
    (modoEntrada === 'pdf' && arquivo)

  const progresso = flashcards.length ? ((indiceAtual + 1) / flashcards.length) * 100 : 0

  return (
    <div className="min-h-screen bg-bg flex app-atmosphere">

      <DashboardSidebar />

      {/* ── Histórico de flashcards ── */}
      <HistoryPanel>
        {historico.length === 0 ? (
          <p className="text-text-faint text-xs text-center py-6 px-2 leading-relaxed">
            Nenhum deck ainda. Gere o primeiro ao lado!
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
        {modoEstudo ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-10">
            <div className="w-full max-w-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-muted text-sm">{indiceAtual + 1} / {flashcards.length}</span>
                <button onClick={reiniciar} className="flex items-center gap-1.5 text-text-muted hover:text-text text-sm transition-colors">
                  <RotateCcw size={13} /> Reiniciar
                </button>
              </div>
              <div className="h-1 bg-bg-card rounded-full overflow-hidden mb-8">
                <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${progresso}%` }} />
              </div>

              <div
                onClick={() => setVirado(!virado)}
                className="group cursor-pointer select-none min-h-72"
                style={{ perspective: '1600px' }}
              >
                <div
                  className="motion-safe-ui relative w-full h-full min-h-72"
                  style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 480ms cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: virado ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Frente — Pergunta */}
                  <div
                    className="absolute inset-0 bg-bg-card rounded-2xl p-6 md:p-12 flex flex-col items-center justify-center group-hover:ring-1 group-hover:ring-brand/40 transition-shadow"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  >
                    <p className="text-text-faint text-xs uppercase tracking-widest mb-5">Pergunta</p>
                    <p className="text-text text-xl text-center leading-relaxed">
                      {flashcards[indiceAtual]?.pergunta}
                    </p>
                    <p className="text-text-faint text-xs mt-8">Clique para ver a resposta</p>
                  </div>

                  {/* Verso — Resposta */}
                  <div
                    className="absolute inset-0 bg-bg-card rounded-2xl p-6 md:p-12 flex flex-col items-center justify-center group-hover:ring-1 group-hover:ring-brand/40 transition-shadow"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <p className="text-text-faint text-xs uppercase tracking-widest mb-5">Resposta</p>
                    <p className="text-text text-xl text-center leading-relaxed">
                      {flashcards[indiceAtual]?.resposta}
                    </p>
                    <p className="text-text-faint text-xs mt-8">Clique para voltar</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={anterior}
                  disabled={indiceAtual === 0}
                  className="flex items-center gap-2 flex-1 justify-center py-3 rounded-full border border-border text-text-muted hover:text-text hover:border-brand/50 disabled:opacity-30 transition-all text-sm font-medium"
                >
                  <ChevronLeft size={15} /> Anterior
                </button>
                <button
                  onClick={proximo}
                  className="flex items-center gap-2 flex-1 justify-center py-3 rounded-full bg-brand hover:bg-brand-hover text-white transition-colors text-sm font-medium"
                >
                  {indiceAtual === flashcards.length - 1 ? 'Finalizar' : 'Próximo'}
                  {indiceAtual < flashcards.length - 1 && <ChevronRight size={15} />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-10">
            <div className="w-full max-w-xl">
              <h1 className="text-text text-3xl font-bold tracking-tight mb-1.5 text-center">Flashcards</h1>
              <p className="text-text-muted text-center mb-10">A IA cria flashcards a partir de qualquer conteúdo</p>

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

                <div>
                  <label className="text-text-muted text-sm mb-2 block">Quantos flashcards?</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map((n) => (
                      <button
                        key={n}
                        onClick={() => setQuantidade(n)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
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
                  className="w-full bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-full transition-colors"
                >
                  {loading ? 'Gerando flashcards...' : 'Gerar flashcards com IA'}
                </button>

                {flashcards.length > 0 && (
                  <button
                    onClick={() => { setModoEstudo(true); setIndiceAtual(0); setVirado(false) }}
                    className="w-full border border-border hover:border-brand text-text-muted hover:text-text py-3 rounded-full text-sm font-medium transition-colors"
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
