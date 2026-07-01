'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Calendar, ChevronRight, ChevronLeft, Check, Trash2, RefreshCw, RotateCcw,
  BookOpen, Sparkles, Target, Clock, AlertTriangle, BarChart3,
  FileQuestion, FileText, Layers, MessageCircle,
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { createClient } from '@/lib/supabase'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DiaPlano = {
  data: string
  diaSemana: string
  materia: string
  topico: string
  horas: number
  questoes: number
  concluido: boolean
  pulado?: boolean
}

type SemanaPlano = {
  numero: number
  fase: string
  dias: DiaPlano[]
}

type Cronograma = { semanas: SemanaPlano[] }

type Plano = {
  id: number
  user_id: string
  vestibular: string
  data_prova: string
  curso: string | null
  horas_por_dia: number
  dias_semana: string[]
  materias_boas: string[]
  materias_dificeis: string[]
  cronograma: Cronograma
  criado_em: string
}

type ConfigForm = {
  vestibular: string
  dataProva: string
  curso: string
  horasPorDia: number
  diasSemana: string[]
  materiasBoas: string[]
  materiasDificeis: string[]
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const VESTIBULARES_OPTS = ['ENEM', 'FUVEST', 'UNICAMP', 'UNESP', 'UERJ', 'UnB', 'UFG', 'UFPR', 'ITA', 'IME', 'Outro']

const MATERIAS = [
  'Português', 'Literatura', 'Matemática', 'Física', 'Química',
  'Biologia', 'História', 'Geografia', 'Filosofia', 'Sociologia',
  'Artes', 'Educação Física',
]

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

const MATERIA_COR: Record<string, { bg: string; text: string; dot: string }> = {
  'Matemática':      { bg: 'bg-blue-500/15',   text: 'text-blue-700 dark:text-blue-300',   dot: 'bg-blue-500' },
  'Física':          { bg: 'bg-indigo-500/15',  text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  'Química':         { bg: 'bg-violet-500/15',  text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
  'Biologia':        { bg: 'bg-green-500/15',   text: 'text-green-700 dark:text-green-300',  dot: 'bg-green-500' },
  'Português':       { bg: 'bg-orange-500/15',  text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  'Literatura':      { bg: 'bg-amber-500/15',   text: 'text-amber-700 dark:text-amber-300',  dot: 'bg-amber-500' },
  'História':        { bg: 'bg-red-500/15',     text: 'text-red-700 dark:text-red-300',     dot: 'bg-red-500' },
  'Geografia':       { bg: 'bg-teal-500/15',    text: 'text-teal-700 dark:text-teal-300',   dot: 'bg-teal-500' },
  'Filosofia':       { bg: 'bg-slate-500/15',   text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500' },
  'Sociologia':      { bg: 'bg-pink-500/15',    text: 'text-pink-700 dark:text-pink-300',   dot: 'bg-pink-500' },
  'Artes':           { bg: 'bg-rose-500/15',    text: 'text-rose-700 dark:text-rose-300',   dot: 'bg-rose-500' },
  'Educação Física': { bg: 'bg-lime-500/15',    text: 'text-lime-700 dark:text-lime-300',   dot: 'bg-lime-600' },
}

function corMateria(mat: string) {
  return MATERIA_COR[mat] ?? { bg: 'bg-bg-hover', text: 'text-text-muted', dot: 'bg-text-faint' }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function diffDias(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

function hoje() { return new Date().toISOString().slice(0, 10) }

function semanaAtualDias(): string[] {
  const d = new Date()
  const dow = d.getDay()
  const segunda = new Date(d)
  segunda.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const di = new Date(segunda)
    di.setDate(segunda.getDate() + i)
    return di.toISOString().slice(0, 10)
  })
}

function mesAtualDias(): { data: string; diaMes: number; mesOffset: number }[] {
  const d = new Date()
  const ano = d.getFullYear()
  const mes = d.getMonth()
  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia   = new Date(ano, mes + 1, 0)
  const result = []
  const offsetDow = primeiroDia.getDay() === 0 ? 6 : primeiroDia.getDay() - 1
  // Dias do mês anterior para completar a primeira semana
  for (let i = offsetDow; i > 0; i--) {
    const di = new Date(ano, mes, 1 - i)
    result.push({ data: di.toISOString().slice(0, 10), diaMes: di.getDate(), mesOffset: -1 })
  }
  for (let i = 1; i <= ultimoDia.getDate(); i++) {
    const di = new Date(ano, mes, i)
    result.push({ data: di.toISOString().slice(0, 10), diaMes: i, mesOffset: 0 })
  }
  // Dias do mês seguinte
  const restante = (7 - result.length % 7) % 7
  for (let i = 1; i <= restante; i++) {
    const di = new Date(ano, mes + 1, i)
    result.push({ data: di.toISOString().slice(0, 10), diaMes: di.getDate(), mesOffset: 1 })
  }
  return result
}

// ─── Badge de matéria ─────────────────────────────────────────────────────────

function MateriaBadge({ materia }: { materia: string }) {
  const cor = corMateria(materia)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cor.bg} ${cor.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cor.dot}`} />
      {materia}
    </span>
  )
}

// ─── Ações rápidas ────────────────────────────────────────────────────────────

function AcoesRapidas({ materia }: { materia: string }) {
  const mat = encodeURIComponent(materia)
  return (
    <div className="flex gap-1.5 flex-wrap mt-2">
      <Link href={`/dashboard/questoes`} className="text-[11px] px-2.5 py-1 rounded-full bg-bg-hover text-text-muted hover:text-text hover:bg-brand/10 hover:text-brand transition-colors flex items-center gap-1">
        <FileQuestion size={10} /> Questões
      </Link>
      <Link href={`/dashboard/resumos`} className="text-[11px] px-2.5 py-1 rounded-full bg-bg-hover text-text-muted hover:text-text hover:bg-brand/10 hover:text-brand transition-colors flex items-center gap-1">
        <FileText size={10} /> Resumo
      </Link>
      <Link href={`/dashboard/flashcards`} className="text-[11px] px-2.5 py-1 rounded-full bg-bg-hover text-text-muted hover:text-text hover:bg-brand/10 hover:text-brand transition-colors flex items-center gap-1">
        <Layers size={10} /> Flashcards
      </Link>
      <Link href={`/dashboard/tutora`} className="text-[11px] px-2.5 py-1 rounded-full bg-bg-hover text-text-muted hover:text-text hover:bg-brand/10 hover:text-brand transition-colors flex items-center gap-1">
        <MessageCircle size={10} /> IA Tutora
      </Link>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

const CONFIG_INICIAL: ConfigForm = {
  vestibular: '', dataProva: '', curso: '',
  horasPorDia: 2, diasSemana: [],
  materiasBoas: [], materiasDificeis: [],
}

export default function PlanoPage() {
  const { profile } = useProfile()

  const [plano,       setPlano      ] = useState<Plano | null>(null)
  const [loading,     setLoading    ] = useState(true)
  const [gerando,     setGerando    ] = useState(false)
  const [erroGerar,   setErroGerar  ] = useState('')
  const [showDelete,  setShowDelete ] = useState(false)
  const [deletando,   setDeletando  ] = useState(false)
  const [reagendando, setReagendando] = useState(false)
  const [abaAtiva,    setAbaAtiva   ] = useState<'semana' | 'mes' | 'completo'>('semana')
  const [step,        setStep       ] = useState<1 | 2 | 3>(1)
  const [config,      setConfig     ] = useState<ConfigForm>(CONFIG_INICIAL)

  const carregar = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('planos_estudo')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) setPlano(data as Plano)
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ── Gerar plano ─────────────────────────────────────────────────────────────

  async function gerarPlano() {
    if (!config.vestibular || !config.dataProva || !config.diasSemana.length) return
    setGerando(true); setErroGerar('')
    try {
      const res = await fetch('/api/plano/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vestibular: config.vestibular,
          dataProva: config.dataProva,
          curso: config.curso || null,
          horasPorDia: config.horasPorDia,
          diasSemana: config.diasSemana,
          materiasBoas: config.materiasBoas,
          materiasDificeis: config.materiasDificeis,
        }),
      })
      if (!res.ok) throw new Error('Erro na API')
      const cronograma = await res.json()

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('planos_estudo')
        .upsert({
          user_id: user.id,
          vestibular: config.vestibular,
          data_prova: config.dataProva,
          curso: config.curso || null,
          horas_por_dia: config.horasPorDia,
          dias_semana: config.diasSemana,
          materias_boas: config.materiasBoas,
          materias_dificeis: config.materiasDificeis,
          cronograma,
          atualizado_em: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single()

      if (error) throw error
      setPlano(data as Plano)
    } catch (e) {
      setErroGerar('Erro ao gerar o plano. Verifique sua conexão e tente novamente.')
    }
    setGerando(false)
  }

  // ── Concluir dia ────────────────────────────────────────────────────────────

  async function concluirDia(data: string) {
    if (!plano) return
    const novosCronograma: Cronograma = {
      semanas: plano.cronograma.semanas.map(s => ({
        ...s,
        dias: s.dias.map(d => d.data === data ? { ...d, concluido: true } : d),
      })),
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('planos_estudo')
      .update({ cronograma: novosCronograma, atualizado_em: new Date().toISOString() })
      .eq('user_id', user.id)
    setPlano({ ...plano, cronograma: novosCronograma })
  }

  // ── Reagendar dias perdidos ──────────────────────────────────────────────────

  async function reagendar() {
    if (!plano) return
    setReagendando(true)
    const hj = hoje()
    const novosCronograma: Cronograma = {
      semanas: plano.cronograma.semanas.map(s => ({
        ...s,
        dias: s.dias.map(d =>
          d.data < hj && !d.concluido ? { ...d, concluido: true, pulado: true } : d
        ),
      })),
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setReagendando(false); return }
    await supabase.from('planos_estudo')
      .update({ cronograma: novosCronograma, atualizado_em: new Date().toISOString() })
      .eq('user_id', user.id)
    setPlano({ ...plano, cronograma: novosCronograma })
    setReagendando(false)
  }

  // ── Deletar plano ───────────────────────────────────────────────────────────

  async function deletarPlano() {
    setDeletando(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setDeletando(false); return }
    await supabase.from('planos_estudo').delete().eq('user_id', user.id)
    setPlano(null)
    setShowDelete(false)
    setConfig(CONFIG_INICIAL)
    setStep(1)
    setDeletando(false)
  }

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Formulário de criação ───────────────────────────────────────────────────

  if (!plano) {
    return (
      <div className="min-h-screen bg-bg flex">
        <DashboardSidebar />
        <main className="flex-1 ml-20 flex items-start justify-center py-16 px-10">
          <div className="w-full max-w-xl">

            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-14 h-14 bg-brand-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={26} className="text-brand" />
              </div>
              <h1 className="text-text text-2xl font-bold mb-2">Criar plano de estudos</h1>
              <p className="text-text-muted text-sm">A IA vai montar um cronograma personalizado para você.</p>
            </div>

            {/* Barra de progresso */}
            <div className="flex items-center gap-2 mb-10">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex-1">
                  <div className={`h-1.5 rounded-full transition-all ${step >= s ? 'bg-brand' : 'bg-border'}`} />
                  <p className={`text-xs mt-2 font-medium ${step === s ? 'text-brand' : 'text-text-faint'}`}>
                    {s === 1 ? 'Sobre a prova' : s === 2 ? 'Seu tempo' : 'Seu nível'}
                  </p>
                </div>
              ))}
            </div>

            {/* Passo 1 — Sobre a prova */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">Qual vestibular vai fazer?</label>
                  <div className="flex flex-wrap gap-2">
                    {VESTIBULARES_OPTS.map(v => (
                      <button key={v}
                        onClick={() => setConfig(c => ({ ...c, vestibular: v }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          config.vestibular === v ? 'bg-brand text-white border-brand' : 'border-border text-text-muted hover:border-brand hover:text-text'
                        }`}
                      >{v}</button>
                    ))}
                  </div>
                  {config.vestibular === 'Outro' && (
                    <input
                      type="text"
                      placeholder="Nome do vestibular"
                      className="mt-3 w-full bg-bg-card border border-border rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-brand"
                      onChange={e => setConfig(c => ({ ...c, vestibular: e.target.value || 'Outro' }))}
                    />
                  )}
                </div>

                <div>
                  <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">Data da prova</label>
                  <input
                    type="date"
                    value={config.dataProva}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setConfig(c => ({ ...c, dataProva: e.target.value }))}
                    className="w-full bg-bg-card border border-border rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">Curso pretendido (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Medicina, Engenharia..."
                    value={config.curso}
                    onChange={e => setConfig(c => ({ ...c, curso: e.target.value }))}
                    className="w-full bg-bg-card border border-border rounded-xl px-4 py-2.5 text-text text-sm outline-none focus:border-brand"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!config.vestibular || !config.dataProva}
                  className="w-full bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Continuar <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Passo 2 — Tempo disponível */}
            {step === 2 && (
              <div className="space-y-7">
                <div>
                  <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">Quantas horas por dia pode estudar?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(h => (
                      <button key={h}
                        onClick={() => setConfig(c => ({ ...c, horasPorDia: h }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                          config.horasPorDia === h ? 'bg-brand text-white border-brand' : 'border-border text-text-muted hover:border-brand hover:text-text'
                        }`}
                      >{h === 4 ? '4h+' : `${h}h`}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">Quais dias você pode estudar?</label>
                  <div className="grid grid-cols-4 gap-2">
                    {DIAS_SEMANA.map(d => {
                      const on = config.diasSemana.includes(d)
                      return (
                        <button key={d}
                          onClick={() => setConfig(c => ({
                            ...c,
                            diasSemana: on ? c.diasSemana.filter(x => x !== d) : [...c.diasSemana, d],
                          }))}
                          className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                            on ? 'bg-brand text-white border-brand' : 'border-border text-text-muted hover:border-brand hover:text-text'
                          }`}
                        >{d.slice(0, 3)}</button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex items-center gap-2 border border-border text-text-muted hover:text-text px-5 py-3 rounded-xl text-sm transition-colors">
                    <ChevronLeft size={16} /> Voltar
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!config.diasSemana.length}
                    className="flex-1 bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    Continuar <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Passo 3 — Nível atual */}
            {step === 3 && (
              <div className="space-y-7">
                <div>
                  <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">Matérias que você se sente bem</label>
                  <div className="flex flex-wrap gap-2">
                    {MATERIAS.map(m => {
                      const on = config.materiasBoas.includes(m)
                      return (
                        <button key={m}
                          onClick={() => setConfig(c => ({
                            ...c,
                            materiasBoas: on ? c.materiasBoas.filter(x => x !== m) : [...c.materiasBoas, m],
                            materiasDificeis: c.materiasDificeis.filter(x => x !== m),
                          }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            on ? 'bg-green-500 text-white border-green-500' : 'border-border text-text-muted hover:border-green-400 hover:text-text'
                          }`}
                        >{m}</button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 block">Matérias com mais dificuldade</label>
                  <div className="flex flex-wrap gap-2">
                    {MATERIAS.map(m => {
                      const on = config.materiasDificeis.includes(m)
                      return (
                        <button key={m}
                          onClick={() => setConfig(c => ({
                            ...c,
                            materiasDificeis: on ? c.materiasDificeis.filter(x => x !== m) : [...c.materiasDificeis, m],
                            materiasBoas: c.materiasBoas.filter(x => x !== m),
                          }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            on ? 'bg-red-500 text-white border-red-500' : 'border-border text-text-muted hover:border-red-400 hover:text-text'
                          }`}
                        >{m}</button>
                      )
                    })}
                  </div>
                </div>

                {erroGerar && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{erroGerar}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} disabled={gerando}
                    className="flex items-center gap-2 border border-border text-text-muted hover:text-text disabled:opacity-40 px-5 py-3 rounded-xl text-sm transition-colors">
                    <ChevronLeft size={16} /> Voltar
                  </button>
                  <button
                    onClick={gerarPlano}
                    disabled={gerando}
                    className="flex-1 bg-brand hover:bg-brand-hover disabled:opacity-70 text-white py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {gerando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Gerando seu plano...
                      </>
                    ) : (
                      <><Sparkles size={15} /> Gerar meu plano de estudos</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // ── Visualização do plano ───────────────────────────────────────────────────

  const hj = hoje()
  const todasDias = plano.cronograma.semanas.flatMap(s => s.dias)
  const tarefaHoje = todasDias.find(d => d.data === hj)
  const diasSemana = semanaAtualDias()
  const diasMes    = mesAtualDias()
  const dataMap = new Map(todasDias.map(d => [d.data, d]))

  const diasParaProva = diffDias(hj, plano.data_prova)
  const diasDesdeInicio = diffDias(plano.criado_em.slice(0, 10), hj)
  const diasTotais = diffDias(plano.criado_em.slice(0, 10), plano.data_prova)
  const pctPassado = Math.min(100, Math.max(0, Math.round((diasDesdeInicio / diasTotais) * 100)))

  const diasPerdidos = todasDias.filter(d => d.data < hj && !d.concluido).length

  const fases = Array.from(new Set(plano.cronograma.semanas.map(s => s.fase)))
  const semanasGrupadas = fases.map(fase => ({
    fase,
    semanas: plano.cronograma.semanas.filter(s => s.fase === fase),
  }))

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Modal de confirmação de deleção */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border rounded-2xl p-8 max-w-sm w-full">
            <h3 className="text-text font-bold text-lg mb-2">Apagar plano?</h3>
            <p className="text-text-muted text-sm mb-6">
              Seu plano de estudos será apagado permanentemente. Você poderá criar um novo plano depois.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 border border-border text-text-muted hover:text-text py-2.5 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={deletarPlano} disabled={deletando}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                {deletando ? 'Apagando...' : 'Apagar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DashboardSidebar />

      {/* Main */}
      <main className="flex-1 ml-20 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-10 py-10 space-y-8">

          {/* Cabeçalho + ações */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-text text-2xl font-bold tracking-tight mb-1">Plano de Estudos</h1>
              <p className="text-text-muted text-sm">{plano.vestibular} · {plano.curso ? `${plano.curso} · ` : ''}{plano.horas_por_dia}h/dia</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {diasPerdidos > 0 && (
                <button onClick={reagendar} disabled={reagendando}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-text-muted hover:text-text hover:border-brand text-sm transition-colors disabled:opacity-50">
                  <RefreshCw size={13} className={reagendando ? 'animate-spin' : ''} />
                  Reagendar ({diasPerdidos})
                </button>
              )}
              <button onClick={() => { setPlano(null); setConfig(CONFIG_INICIAL); setStep(1) }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-text-muted hover:text-text text-sm transition-colors">
                <RotateCcw size={13} /> Refazer plano
              </button>
              <button onClick={() => setShowDelete(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-sm transition-colors">
                <Trash2 size={13} /> Apagar
              </button>
            </div>
          </div>

          {/* 1. Card de contagem regressiva */}
          <div className="bg-brand rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm font-medium mb-1">{plano.vestibular}</p>
                <p className="text-4xl font-black">{diasParaProva > 0 ? diasParaProva : 0} <span className="text-2xl font-bold text-white/80">dias</span></p>
                <p className="text-white/70 text-sm mt-1">
                  {diasParaProva > 0 ? 'para a prova' : 'Prova concluída!'} · {new Date(plano.data_prova + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Preparação</p>
                <p className="text-2xl font-bold">{pctPassado}%</p>
                <p className="text-white/70 text-xs">do tempo passou</p>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pctPassado}%` }} />
            </div>
          </div>

          {/* 2. Tarefa de hoje */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target size={15} className="text-brand" />
                <h3 className="text-text font-semibold text-sm">Hoje</h3>
                <span className="text-text-faint text-xs ml-auto">{new Date(hj + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
              </div>

              {!tarefaHoje ? (
                <p className="text-text-faint text-sm">Sem tarefa agendada para hoje. Aproveite o dia de descanso! 🎉</p>
              ) : tarefaHoje.concluido && !tarefaHoje.pulado ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Check size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-text font-semibold text-sm line-through text-text-muted">{tarefaHoje.materia}</p>
                    <p className="text-green-500 text-xs font-medium">Concluído hoje!</p>
                  </div>
                </div>
              ) : (
                <div>
                  <MateriaBadge materia={tarefaHoje.materia} />
                  <p className="text-text font-medium text-sm mt-2">{tarefaHoje.topico}</p>
                  <div className="flex items-center gap-3 mt-2 mb-4">
                    <span className="text-text-faint text-xs flex items-center gap-1"><Clock size={10} /> {tarefaHoje.horas}h</span>
                    <span className="text-text-faint text-xs flex items-center gap-1"><Target size={10} /> {tarefaHoje.questoes} questões</span>
                  </div>
                  <button onClick={() => concluirDia(tarefaHoje.data)}
                    className="w-full bg-brand hover:bg-brand-hover text-white py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Check size={14} /> Marcar como concluído
                  </button>
                </div>
              )}
            </div>

            {/* 3. Progresso da semana */}
            <div className="bg-bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={15} className="text-brand" />
                <h3 className="text-text font-semibold text-sm">Semana atual</h3>
              </div>
              <div className="flex gap-2 justify-between">
                {DIAS_SEMANA.map((nome, i) => {
                  const data = diasSemana[i]
                  const tarefa = dataMap.get(data)
                  const eHoje = data === hj
                  const passado = data < hj
                  const concluido = tarefa?.concluido && !tarefa.pulado
                  const pulado = tarefa?.pulado
                  const temTarefa = !!tarefa

                  return (
                    <div key={nome} className="flex flex-col items-center gap-1.5">
                      <p className="text-text-faint text-[10px]">{nome.slice(0, 3)}</p>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        concluido   ? 'bg-green-500 text-white' :
                        pulado      ? 'bg-red-400/20 text-red-400' :
                        eHoje && temTarefa ? 'bg-brand text-white ring-2 ring-brand/30' :
                        eHoje       ? 'ring-2 ring-border text-text-faint' :
                        passado && temTarefa ? 'bg-red-500/15 text-red-500' :
                        temTarefa   ? 'bg-bg-hover text-text-faint' :
                        'text-text-faint opacity-40'
                      }`}>
                        {concluido ? <Check size={13} /> : pulado ? '—' : new Date(data + 'T12:00:00').getDate()}
                      </div>
                      {tarefa && (
                        <span className={`w-1.5 h-1.5 rounded-full ${corMateria(tarefa.materia).dot}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 4. Cronograma em abas */}
          <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
            {/* Abas */}
            <div className="flex border-b border-border">
              {[
                { id: 'semana' as const, label: 'Esta semana' },
                { id: 'mes'   as const, label: 'Mês completo' },
                { id: 'completo' as const, label: 'Cronograma completo' },
              ].map(aba => (
                <button key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`px-6 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                    abaAtiva === aba.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-text-muted hover:text-text'
                  }`}
                >{aba.label}</button>
              ))}
            </div>

            <div className="p-6">

              {/* Aba: Esta semana */}
              {abaAtiva === 'semana' && (
                <div className="space-y-3">
                  {DIAS_SEMANA.map((nome, i) => {
                    const data = diasSemana[i]
                    const tarefa = dataMap.get(data)
                    if (!tarefa) return (
                      <div key={nome} className="flex items-center gap-4 py-2 opacity-40">
                        <div className="w-20 flex-shrink-0">
                          <p className="text-text-faint text-sm">{nome}</p>
                          <p className="text-text-faint text-xs">{new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</p>
                        </div>
                        <p className="text-text-faint text-sm">Dia livre</p>
                      </div>
                    )
                    return (
                      <div key={nome} className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                        tarefa.concluido && !tarefa.pulado ? 'bg-green-500/5 border border-green-500/20' :
                        tarefa.pulado ? 'opacity-50' :
                        data === hj ? 'bg-brand/5 border border-brand/20' :
                        'bg-bg-hover/50'
                      }`}>
                        <div className="w-20 flex-shrink-0">
                          <p className="text-text text-sm font-medium">{nome}</p>
                          <p className="text-text-faint text-xs">{new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</p>
                        </div>
                        <div className="flex-1">
                          <MateriaBadge materia={tarefa.materia} />
                          <p className="text-text text-sm mt-1.5">{tarefa.topico}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-text-faint text-xs">{tarefa.horas}h · {tarefa.questoes} questões</span>
                          </div>
                          {!tarefa.concluido && <AcoesRapidas materia={tarefa.materia} />}
                        </div>
                        {tarefa.concluido && !tarefa.pulado && (
                          <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check size={13} className="text-white" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Aba: Mês completo */}
              {abaAtiva === 'mes' && (
                <div>
                  <p className="text-text font-medium mb-4 capitalize">
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
                      <p key={d} className="text-text-faint text-[11px] text-center font-medium py-1">{d}</p>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {diasMes.map(({ data, diaMes, mesOffset }) => {
                      const tarefa = dataMap.get(data)
                      const eHoje = data === hj
                      const cor = tarefa ? corMateria(tarefa.materia) : null
                      return (
                        <div key={data}
                          title={tarefa ? `${tarefa.materia}: ${tarefa.topico}` : ''}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                            mesOffset !== 0 ? 'opacity-25' :
                            eHoje ? 'ring-2 ring-brand' :
                            ''
                          } ${tarefa && mesOffset === 0 ? cor!.bg : ''}`}
                        >
                          <span className={`text-xs font-medium ${eHoje ? 'text-brand font-bold' : tarefa && mesOffset === 0 ? cor!.text : 'text-text-faint'}`}>
                            {diaMes}
                          </span>
                          {tarefa && mesOffset === 0 && (
                            <span className={`w-1 h-1 rounded-full mt-0.5 ${tarefa.concluido && !tarefa.pulado ? 'bg-green-500' : cor!.dot}`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {/* Legenda */}
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
                    {Array.from(new Set(todasDias.map(d => d.materia))).map(mat => (
                      <div key={mat} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${corMateria(mat).dot}`} />
                        <span className="text-text-faint text-xs">{mat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aba: Cronograma completo */}
              {abaAtiva === 'completo' && (
                <div className="space-y-8">
                  {semanasGrupadas.map(({ fase, semanas }) => (
                    <div key={fase}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-text-muted text-xs font-semibold uppercase tracking-widest px-3 py-1 bg-bg-hover rounded-full">
                          Fase de {fase}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>

                      <div className="space-y-4">
                        {semanas.map(semana => (
                          <div key={semana.numero}>
                            <p className="text-text-faint text-xs font-medium mb-2">Semana {semana.numero}</p>
                            <div className="space-y-2">
                              {semana.dias.map((dia, i) => {
                                const cor = corMateria(dia.materia)
                                const passado = dia.data < hj
                                return (
                                  <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                                    dia.concluido && !dia.pulado ? 'border-green-500/20 bg-green-500/5' :
                                    dia.pulado ? 'opacity-40 border-border' :
                                    dia.data === hj ? 'border-brand/30 bg-brand/5' :
                                    'border-border hover:border-brand/20'
                                  }`}>
                                    <div className="flex-shrink-0 pt-0.5">
                                      {dia.concluido && !dia.pulado ? (
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                          <Check size={11} className="text-white" />
                                        </div>
                                      ) : (
                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${passado && !dia.concluido ? 'border-red-400' : 'border-border'}`} />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-text-faint text-xs">{dia.diaSemana} {new Date(dia.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                                        <MateriaBadge materia={dia.materia} />
                                      </div>
                                      <p className={`text-sm mt-1 ${dia.concluido ? 'text-text-muted line-through' : 'text-text'}`}>{dia.topico}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-text-faint text-xs">{dia.horas}h · {dia.questoes} questões</span>
                                      </div>
                                      {!dia.concluido && <AcoesRapidas materia={dia.materia} />}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
