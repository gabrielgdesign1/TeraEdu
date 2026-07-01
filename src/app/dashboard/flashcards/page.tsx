'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Pencil, ClipboardList,
  FileUp, RotateCcw, ChevronLeft, ChevronRight, Trash2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { createClient } from '@/lib/supabase'
import { registrarAtividade } from '@/lib/registrarAtividade'

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
      formData.append('modo', modoEntrada)
      formData.append('quantidade', String(quantidade))
      if (modoEntrada === 'tema') formData.append('tema', tema)
      if (modoEntrada === 'texto') formData.append('texto', texto)
      if (modoEntrada === 'pdf' && arquivo) formData.append('arquivo', arquivo)
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

  function proximo() {
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
    }, 120)
  }

  function anterior() {
    setVirado(false)
    setTimeout(() => { if (indiceAtual > 0) setIndiceAtual(indiceAtual - 1) }, 120)
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
    <div className="min-h-screen bg-bg flex">

      <DashboardSidebar />

      {/* ── Histórico de flashcards ── */}
      <aside className="fixed left-[80px] top-0 bottom-0 w-56 border-r border-border bg-bg-card flex flex-col z-40">
        <div className="px-4 py-4 border-b border-border flex-shrink-0">
          <p className="text-text-faint text-[10px] font-semibold uppercase tracking-widest">Histórico</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-0.5">
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
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 ml-[304px] flex flex-col min-h-screen">
        {modoEstudo ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
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
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
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
