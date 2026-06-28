'use client'

import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle, BarChart3, Calendar, Sun, Moon, Settings } from "lucide-react"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-60 bg-bg-card border-r border-border flex flex-col fixed h-full">
        <div className="flex items-center gap-2 px-5 py-5">
          <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={28} height={28} />
          <span className="text-text font-semibold text-base">TeraEdu</span>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-2 flex-1">
          <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" active />
          <SidebarLink href="/dashboard/questoes" icon={FileQuestion} label="Questões" />
          <SidebarLink href="/dashboard/flashcards" icon={Layers} label="Flashcards" />
          <SidebarLink href="/dashboard/resumos" icon={FileText} label="Resumos" />
          <SidebarLink href="/dashboard/tutora" icon={MessageCircle} label="IA Tutora" />

          <div className="px-3 mt-6 mb-2">
            <p className="text-text-faint text-[11px] uppercase tracking-wider font-medium">Progresso</p>
          </div>
          <SidebarLink href="/dashboard/desempenho" icon={BarChart3} label="Desempenho" />
          <SidebarLink href="/dashboard/plano" icon={Calendar} label="Plano de Estudos" />
        </nav>

        <div className="px-3 py-3 border-t border-border">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text text-sm transition-colors"
          >
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

      {/* Main */}
      <main className="flex-1 ml-60 px-10 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-text text-3xl font-semibold tracking-tight">Bom dia, Gabriel 👋</h1>
            <p className="text-text-muted text-sm mt-1.5">Você tem 3 revisões pendentes hoje.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Questões resolvidas", value: "142", sub: "+12 essa semana" },
              { label: "Flashcards revisados", value: "89", sub: "+24 essa semana" },
              { label: "Horas estudadas", value: "18h", sub: "+3h essa semana" },
              { label: "Sequência atual", value: "7 dias 🔥", sub: "Continue assim!" },
            ].map((c) => (
              <div key={c.label} className="bg-bg-card border border-border rounded-2xl p-5">
                <p className="text-text-muted text-xs mb-1.5">{c.label}</p>
                <p className="text-text text-2xl font-semibold tracking-tight">{c.value}</p>
                <p className="text-brand text-xs mt-1.5">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Matérias + Atividade */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-bg-card border border-border rounded-2xl p-6">
              <h2 className="text-text font-semibold mb-5">Matérias</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { nome: "Matemática", cor: "#2563eb", progresso: 68 },
                  { nome: "Português", cor: "#7c3aed", progresso: 45 },
                  { nome: "Física", cor: "#0891b2", progresso: 32 },
                  { nome: "Química", cor: "#059669", progresso: 55 },
                  { nome: "Biologia", cor: "#65a30d", progresso: 71 },
                  { nome: "História", cor: "#d97706", progresso: 40 },
                  { nome: "Geografia", cor: "#dc2626", progresso: 28 },
                  { nome: "Inglês", cor: "#7c3aed", progresso: 60 },
                ].map((m) => (
                  <div key={m.nome} className="bg-bg rounded-xl p-4 cursor-pointer hover:bg-bg-hover transition-colors border border-border">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-text text-sm font-medium">{m.nome}</span>
                      <span className="text-text-muted text-xs">{m.progresso}%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.progresso}%`, backgroundColor: m.cor }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-bg-card border border-border rounded-2xl p-6">
              <h2 className="text-text font-semibold mb-5">Atividade recente</h2>
              <div className="flex flex-col gap-4">
                {[
                  { acao: "Resolveu 10 questões", materia: "Matemática", tempo: "2h atrás" },
                  { acao: "Revisou flashcards", materia: "Biologia", tempo: "5h atrás" },
                  { acao: "Leu resumo", materia: "História", tempo: "ontem" },
                  { acao: "Simulado ENEM", materia: "Geral", tempo: "ontem" },
                  { acao: "Perguntou à IA", materia: "Física", tempo: "2 dias atrás" },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-text text-sm">{a.acao}</p>
                      <p className="text-text-faint text-xs mt-0.5">{a.materia} · {a.tempo}</p>
                    </div>
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

function SidebarLink({ href, icon: Icon, label, active }: { href: string, icon: React.ElementType, label: string, active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-brand-soft text-brand font-medium'
          : 'text-text-muted hover:text-text hover:bg-bg-hover'
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  )
}