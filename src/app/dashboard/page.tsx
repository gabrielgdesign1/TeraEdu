'use client'

import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle,
  BarChart3, Calendar, Sun, Moon, Settings, ChevronRight, TrendingUp, Flame, GraduationCap
} from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { useStats, useActivities } from "@/hooks/useStats"
import { Onboarding } from "@/components/Onboarding"

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

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { profile, loading: loadingProfile, salvarProfile } = useProfile()
  const { stats,   loading: loadingStats  } = useStats()
  const activities = useActivities(5)

  const nome          = profile?.nome ?? null
  const primeiroNome  = nome?.split(' ')[0] ?? null
  const showOnboarding = !loadingProfile && profile !== null && !profile.onboarding_ok

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
    <div className="min-h-screen bg-bg flex">

      {showOnboarding && (
        <Onboarding
          nome={nome}
          onConcluir={salvarProfile}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-bg border-r border-border/60 flex flex-col fixed h-full">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={26} height={26} />
          <span className="text-text font-bold tracking-tight">TeraEdu</span>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 flex-1 pt-1">
          <SidebarLink href="/dashboard"                  icon={LayoutDashboard} label="Início"         active />
          <SidebarLink href="/dashboard/questoes"         icon={FileQuestion}    label="Questões" />
          <SidebarLink href="/dashboard/flashcards"       icon={Layers}          label="Flashcards" />
          <SidebarLink href="/dashboard/resumos"          icon={FileText}        label="Resumos" />
          <SidebarLink href="/dashboard/tutora"           icon={MessageCircle}   label="IA Tutora" />
          <SidebarLink href="/dashboard/vestibulares"    icon={GraduationCap}   label="Vestibulares" />

          <div className="px-3 mt-8 mb-2">
            <p className="text-text-faint text-[10px] uppercase tracking-widest font-semibold">Progresso</p>
          </div>
          <SidebarLink href="/dashboard/desempenho" icon={BarChart3}  label="Desempenho" />
          <SidebarLink href="/dashboard/plano"      icon={Calendar}   label="Plano de Estudos" />
        </nav>

        <div className="px-3 py-4 border-t border-border/60">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-bg-hover text-text-muted hover:text-text text-sm transition-colors mb-1"
          >
            {mounted && theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{mounted && theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
          </button>
          <Link
            href="/dashboard/configuracoes"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-hover cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {primeiroNome ? primeiroNome[0].toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text text-sm font-semibold truncate">{nome ?? '...'}</p>
              {profile?.universidade && (
                <p className="text-text-faint text-[10px] truncate">{profile.universidade}</p>
              )}
            </div>
            <Settings size={13} className="text-text-faint" />
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 ml-64">

        {/* Hero */}
        <div className="px-10 pt-10 pb-8 border-b border-border/60">
          <p className="text-text-muted text-sm mb-0.5">{saudacao}</p>
          <h1 className="text-text text-3xl font-bold tracking-tight mb-7">
            {primeiroNome ?? '...'} 👋
          </h1>
          <div className="flex items-center gap-2.5">
            {[
              { href: '/dashboard/questoes',   label: 'Questões',   icon: FileQuestion  },
              { href: '/dashboard/flashcards', label: 'Flashcards', icon: Layers        },
              { href: '/dashboard/resumos',    label: 'Resumos',    icon: FileText      },
              { href: '/dashboard/tutora',     label: 'IA Tutora',  icon: MessageCircle },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
              >
                <a.icon size={14} />
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="px-10 py-8">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {statsCards.map((c) => (
              <div key={c.label} className="bg-bg-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-text-muted text-xs font-medium leading-tight">{c.label}</p>
                  <div className="w-8 h-8 bg-brand-soft rounded-xl flex items-center justify-center flex-shrink-0">
                    <c.icon size={14} className="text-brand" />
                  </div>
                </div>
                <p className="text-text text-2xl font-bold tracking-tight">{c.value}</p>
                <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${c.hasDelta ? 'text-brand' : 'text-text-faint'}`}>
                  {c.flame && <Flame size={11} />}
                  {c.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Matérias + Atividade */}
          <div className="grid grid-cols-3 gap-5">

            {/* Matérias — placeholder até ter dados reais de progresso */}
            <div className="col-span-2 bg-bg-card rounded-2xl p-6">
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
            <div className="bg-bg-card rounded-2xl p-6">
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

function SidebarLink({ href, icon: Icon, label, active }: {
  href: string; icon: React.ElementType; label: string; active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
        active
          ? 'bg-bg-hover text-text font-semibold'
          : 'text-text-muted hover:text-text hover:bg-bg-hover'
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  )
}
