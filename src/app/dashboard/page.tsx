'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileQuestion, Layers, FileText, MessageCircle,
  BarChart3, Calendar, ChevronRight, TrendingUp, Flame,
} from "lucide-react"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { useProfile, type UserProfile } from "@/hooks/useProfile"
import { useStats, useActivities } from "@/hooks/useStats"
import { Onboarding } from "@/components/Onboarding"
import { createClient } from "@/lib/supabase"

const MATERIAS_CORES: Record<string, string> = {
  'Matemática':  '#f97316',
  'Português':   '#7c3aed',
  'Física':      '#0891b2',
  'Química':     '#059669',
  'Biologia':    '#65a30d',
  'História':    '#d97706',
  'Geografia':   '#dc2626',
  'Filosofia':   '#7c3aed',
  'Sociologia':  '#6366f1',
  'Inglês':      '#0284c7',
}

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  const hrs  = Math.floor(min / 60)
  const dias = Math.floor(hrs / 24)
  if (min < 2)   return 'agora'
  if (min < 60)  return `${min}min atrás`
  if (hrs < 24)  return `${hrs}h atrás`
  if (dias === 1) return 'ontem'
  return `${dias} dias`
}

const TIPO_ICON: Record<string, React.ElementType> = {
  questao:   FileQuestion,
  flashcard: Layers,
  resumo:    FileText,
  tutora:    MessageCircle,
  simulado:  BarChart3,
}

// ─── Card do plano no dashboard ───────────────────────────────────────────────

function PlanoCardDashboard() {
  const [plano, setPlano] = useState<{
    vestibular: string
    data_prova: string
    cronograma: { semanas: { numero: number; fase: string; dias: { data: string; materia: string; topico: string; horas: number; questoes: number; concluido: boolean }[] }[] }
  } | null | undefined>(undefined) // undefined = ainda carregando

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setPlano(null); return }
      const { data } = await supabase
        .from('planos_estudo')
        .select('vestibular, data_prova, cronograma')
        .eq('user_id', user.id)
        .single()
      setPlano(data ?? null)
    })
  }, [])

  if (plano === undefined) return null

  if (!plano) {
    return (
      <div className="bg-bg-card rounded-2xl p-5 border border-dashed border-border flex items-center justify-between">
        <div>
          <p className="text-text font-semibold text-sm mb-1">📅 Plano de estudos personalizado</p>
          <p className="text-text-muted text-xs">Não sabe por onde começar? A IA organiza tudo para você.</p>
        </div>
        <Link href="/dashboard/plano"
          className="flex-shrink-0 ml-4 bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap">
          Criar meu plano →
        </Link>
      </div>
    )
  }

  const hj = new Date().toISOString().slice(0, 10)
  const tarefaHoje = plano.cronograma.semanas.flatMap(s => s.dias).find(d => d.data === hj)
  const diasParaProva = Math.round((new Date(plano.data_prova + 'T12:00:00').getTime() - Date.now()) / 86400000)

  return (
    <div className="bg-brand-soft border border-brand/20 rounded-2xl p-5 flex items-center justify-between">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-brand/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Calendar size={16} className="text-brand" />
        </div>
        <div>
          <p className="text-text font-semibold text-sm mb-0.5">
            {tarefaHoje
              ? `📅 Hoje: ${tarefaHoje.materia} — ${tarefaHoje.topico}`
              : `📅 Plano ${plano.vestibular} — ${diasParaProva > 0 ? `${diasParaProva} dias para a prova` : 'Prova chegou!'}`}
          </p>
          {tarefaHoje && (
            <p className="text-text-muted text-xs">{tarefaHoje.horas}h · {tarefaHoje.questoes} questões</p>
          )}
        </div>
      </div>
      <Link href="/dashboard/plano"
        className="flex-shrink-0 ml-4 border border-brand/30 text-brand hover:bg-brand hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap">
        Ver plano →
      </Link>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {

  const { profile, loading: loadingProfile, salvarProfile } = useProfile()
  const { stats,   loading: loadingStats  } = useStats()
  const activities = useActivities(5)
  const router = useRouter()

  const nome          = profile?.nome ?? null
  const primeiroNome  = nome?.split(' ')[0] ?? null
  const showOnboarding = !loadingProfile && profile !== null && !profile.onboarding_ok

  async function concluirOnboarding(dados: Partial<UserProfile>) {
    await salvarProfile(dados)
    router.push('/dashboard/planos')
  }

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  function fmtHoras(min: number) {
    if (min < 60) return `${min}min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  const statsCards = [
    {
      label: 'Questões resolvidas',
      value: loadingStats ? '—' : String(stats.questoes_total),
      delta: stats.questoes_semana > 0 ? `+${stats.questoes_semana} essa semana` : 'Comece a praticar!',
      icon: FileQuestion,
      hasDelta: stats.questoes_semana > 0,
    },
    {
      label: 'Flashcards revisados',
      value: loadingStats ? '—' : String(stats.flashcards_total),
      delta: stats.flashcards_semana > 0 ? `+${stats.flashcards_semana} essa semana` : 'Comece a revisar!',
      icon: Layers,
      hasDelta: stats.flashcards_semana > 0,
    },
    {
      label: 'Horas estudadas',
      value: loadingStats ? '—' : fmtHoras(stats.minutos_total),
      delta: stats.minutos_semana > 0 ? `+${fmtHoras(stats.minutos_semana)} essa semana` : 'Nenhuma sessão ainda',
      icon: BarChart3,
      hasDelta: stats.minutos_semana > 0,
    },
    {
      label: 'Sequência atual',
      value: loadingStats ? '—' : `${stats.sequencia_dias} ${stats.sequencia_dias === 1 ? 'dia' : 'dias'}`,
      delta: stats.sequencia_dias > 0 ? 'Continue assim!' : 'Estude hoje para começar!',
      icon: TrendingUp,
      hasDelta: stats.sequencia_dias > 0,
      flame: stats.sequencia_dias > 0,
    },
  ]

  return (
    <div className="min-h-screen bg-bg flex app-atmosphere">

      {showOnboarding && (
        <Onboarding
          nome={nome}
          onConcluir={concluirOnboarding}
        />
      )}

      <DashboardSidebar />

      {/* ── Main ── */}
      <main className="flex-1 ml-20">

        {/* Hero */}
        <div className="px-10 pt-11 pb-9 border-b border-border/60 relative overflow-hidden">
          {/* aurora sutil */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand/[0.05] via-transparent to-transparent" />
          <div className="pointer-events-none absolute -top-24 right-[15%] w-80 h-56 bg-brand/[0.07] blur-[80px] rounded-full" />
          <p className="text-text-muted text-sm mb-1">{saudacao}</p>
          <h1 className="text-[2.2rem] font-black tracking-tight mb-8 leading-tight">
            <span className="text-gradient-brand">{primeiroNome ?? '...'}</span> 👋
          </h1>
          <div className="flex items-center gap-2.5 flex-wrap">
            {[
              { href: '/dashboard/questoes',   label: 'Questões',   icon: FileQuestion,  primary: true  },
              { href: '/dashboard/flashcards', label: 'Flashcards', icon: Layers,        primary: false },
              { href: '/dashboard/resumos',    label: 'Resumos',    icon: FileText,      primary: false },
              { href: '/dashboard/tutora',     label: 'IA Tutora',  icon: MessageCircle, primary: false },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  a.primary
                    ? 'bg-brand hover:bg-brand-hover text-white shadow-[0_10px_24px_-8px_rgba(249,115,22,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(249,115,22,0.6)]'
                    : 'bg-bg-card border border-border text-text-muted hover:text-text hover:border-brand/40'
                }`}
              >
                <a.icon size={14} className={a.primary ? '' : 'text-brand'} />
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="px-10 py-8">

          {/* Card do plano */}
          <div className="mb-7">
            <PlanoCardDashboard />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {statsCards.map((c) => (
              <div
                key={c.label}
                className="card-premium group relative overflow-hidden rounded-2xl p-5 hover:-translate-y-0.5"
              >
                {/* brilho no hover */}
                <div className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 bg-brand/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-text-muted text-xs font-medium leading-tight">{c.label}</p>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/15">
                      <c.icon size={14} className="text-brand" />
                    </div>
                  </div>
                  <p className="text-text text-[1.7rem] font-black tracking-tight tabular-nums">{c.value}</p>
                  <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${c.hasDelta ? 'text-brand' : 'text-text-faint'}`}>
                    {c.flame && <Flame size={11} />}
                    {c.delta}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Matérias + Atividade */}
          <div className="grid grid-cols-3 gap-5">

            {/* Matérias — placeholder até ter dados reais de progresso */}
            <div className="card-premium col-span-2 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-text font-semibold">Matérias</h2>
                <button className="text-brand text-xs font-medium flex items-center gap-1 hover:opacity-75 transition-opacity">
                  Ver todas <ChevronRight size={12} />
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-text-faint text-sm">Nenhuma atividade ainda.</p>
                  <p className="text-text-faint text-xs mt-1">Resolva questões ou revise flashcards para ver seu progresso aqui.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(MATERIAS_CORES)).slice(0, 8).map(([nome, cor]) => {
                    const count = activities.filter(a => a.materia === nome).length
                    const progresso = Math.min(100, count * 20)
                    return (
                      <div key={nome} className="p-4 rounded-xl hover:bg-bg-hover cursor-pointer transition-colors">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-text text-sm font-medium">{nome}</span>
                          <span className="text-text-faint text-xs">{progresso > 0 ? `${progresso}%` : '—'}</span>
                        </div>
                        <div className="h-1 bg-border rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${progresso}%`, backgroundColor: cor }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Atividade recente */}
            <div className="card-premium rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-text font-semibold">Atividade recente</h2>
                <button className="text-brand text-xs font-medium flex items-center gap-1 hover:opacity-75 transition-opacity">
                  Ver tudo <ChevronRight size={12} />
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-text-faint text-sm">Nenhuma atividade ainda.</p>
                  <p className="text-text-faint text-xs mt-1">Suas sessões de estudo vão aparecer aqui.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {activities.map((a, i) => {
                    const Icon = TIPO_ICON[a.tipo] ?? FileQuestion
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center gap-3 py-3 ${i < activities.length - 1 ? 'border-b border-border/50' : ''}`}
                      >
                        <div className="w-9 h-9 bg-brand-soft rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon size={14} className="text-brand" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-text text-sm font-medium truncate">{a.descricao}</p>
                          <p className="text-text-faint text-xs mt-0.5">{a.materia ?? 'Geral'}</p>
                        </div>
                        <span className="text-text-faint text-xs flex-shrink-0">{tempoRelativo(a.criado_em)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

