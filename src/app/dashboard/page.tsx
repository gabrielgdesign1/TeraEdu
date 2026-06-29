'use client'

import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle,
  BarChart3, Calendar, Sun, Moon, Settings, ChevronRight, TrendingUp
} from "lucide-react"
import { useNome } from "@/hooks/useNome"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { primeiroNome, nome } = useNome()

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-bg border-r border-border/60 flex flex-col fixed h-full">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={26} height={26} />
          <span className="text-text font-bold tracking-tight">TeraEdu</span>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 flex-1 pt-1">
          <SidebarLink href="/dashboard"            icon={LayoutDashboard} label="Início"         active />
          <SidebarLink href="/dashboard/questoes"   icon={FileQuestion}    label="Questões" />
          <SidebarLink href="/dashboard/flashcards" icon={Layers}          label="Flashcards" />
          <SidebarLink href="/dashboard/resumos"    icon={FileText}        label="Resumos" />
          <SidebarLink href="/dashboard/tutora"     icon={MessageCircle}   label="IA Tutora" />

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
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-hover cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {primeiroNome ? primeiroNome[0].toUpperCase() : 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text text-sm font-semibold truncate">{nome ?? 'Gabriel'}</p>
            </div>
            <Settings size={13} className="text-text-faint" />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 ml-64">

        {/* Hero header — inspirado no "Total balance" do Wise */}
        <div className="px-10 pt-10 pb-8 border-b border-border/60">
          <p className="text-text-muted text-sm mb-0.5">Bom dia</p>
          <h1 className="text-text text-3xl font-bold tracking-tight mb-7">{primeiroNome ?? 'Gabriel'} 👋</h1>

          {/* Quick actions em pills — como os botões Send/Add/Request do Wise */}
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
            {[
              { label: "Questões resolvidas", value: "142",    delta: "+12 essa semana", icon: FileQuestion  },
              { label: "Flashcards revisados",value: "89",     delta: "+24 essa semana", icon: Layers        },
              { label: "Horas estudadas",     value: "18h",    delta: "+3h essa semana",  icon: BarChart3    },
              { label: "Sequência atual",     value: "7 dias", delta: "🔥 Continue assim!",icon: TrendingUp   },
            ].map((c) => (
              <div key={c.label} className="bg-bg-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-text-muted text-xs font-medium leading-tight">{c.label}</p>
                  <div className="w-8 h-8 bg-brand-soft rounded-xl flex items-center justify-center flex-shrink-0">
                    <c.icon size={14} className="text-brand" />
                  </div>
                </div>
                <p className="text-text text-2xl font-bold tracking-tight">{c.value}</p>
                <p className="text-brand text-xs mt-1.5 font-medium">{c.delta}</p>
              </div>
            ))}
          </div>

          {/* Matérias + Atividade */}
          <div className="grid grid-cols-3 gap-5">

            {/* Matérias */}
            <div className="col-span-2 bg-bg-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-text font-semibold">Matérias</h2>
                <button className="text-brand text-xs font-medium flex items-center gap-1 hover:opacity-75 transition-opacity">
                  Ver todas <ChevronRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { nome: "Matemática", cor: "#f97316", progresso: 68 },
                  { nome: "Português",  cor: "#7c3aed", progresso: 45 },
                  { nome: "Física",     cor: "#0891b2", progresso: 32 },
                  { nome: "Química",    cor: "#059669", progresso: 55 },
                  { nome: "Biologia",   cor: "#65a30d", progresso: 71 },
                  { nome: "História",   cor: "#d97706", progresso: 40 },
                  { nome: "Geografia",  cor: "#dc2626", progresso: 28 },
                  { nome: "Filosofia",  cor: "#7c3aed", progresso: 60 },
                ].map((m) => (
                  <div key={m.nome} className="p-4 rounded-xl hover:bg-bg-hover cursor-pointer transition-colors">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-text text-sm font-medium">{m.nome}</span>
                      <span className="text-text-faint text-xs">{m.progresso}%</span>
                    </div>
                    <div className="h-1 bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.progresso}%`, backgroundColor: m.cor }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atividade recente — estilo lista de transações do Wise */}
            <div className="bg-bg-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-text font-semibold">Atividade recente</h2>
                <button className="text-brand text-xs font-medium flex items-center gap-1 hover:opacity-75 transition-opacity">
                  Ver tudo <ChevronRight size={12} />
                </button>
              </div>
              <div className="flex flex-col">
                {[
                  { acao: "10 questões",       materia: "Matemática", tempo: "2h atrás",    icon: FileQuestion  },
                  { acao: "Flashcards",         materia: "Biologia",   tempo: "5h atrás",    icon: Layers        },
                  { acao: "Resumo gerado",      materia: "História",   tempo: "ontem",        icon: FileText      },
                  { acao: "Simulado ENEM",      materia: "Geral",      tempo: "ontem",        icon: BarChart3     },
                  { acao: "Pergunta à Tutora",  materia: "Física",     tempo: "2 dias",       icon: MessageCircle },
                ].map((a, i, arr) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 py-3 ${i < arr.length - 1 ? 'border-b border-border/50' : ''}`}
                  >
                    <div className="w-9 h-9 bg-brand-soft rounded-xl flex items-center justify-center flex-shrink-0">
                      <a.icon size={14} className="text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text text-sm font-medium truncate">{a.acao}</p>
                      <p className="text-text-faint text-xs mt-0.5">{a.materia}</p>
                    </div>
                    <span className="text-text-faint text-xs flex-shrink-0">{a.tempo}</span>
                  </div>
                ))}
              </div>
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
