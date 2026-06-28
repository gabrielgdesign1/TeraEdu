'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from "next-themes"
import { LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle, BarChart3, Calendar, Sun, Moon, Settings, Construction } from "lucide-react"

export default function Questoes() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-60 bg-bg-card border-r border-border flex flex-col fixed h-full">
        <div className="flex items-center gap-2 px-5 py-5">
          <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={28} height={28} />
          <span className="text-text font-semibold text-base">TeraEdu</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 py-2 flex-1">
          <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink href="/dashboard/questoes" icon={FileQuestion} label="Questões" active />
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
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text text-sm transition-colors">
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

      <main className="flex-1 ml-60 px-10 py-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-brand-soft rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Construction size={28} className="text-brand" />
          </div>
          <h1 className="text-text text-2xl font-semibold tracking-tight mb-2">Em construção</h1>
          <p className="text-text-muted text-sm">O banco de questões está sendo desenvolvido. Em breve você terá acesso a milhares de questões do ENEM e principais vestibulares.</p>
        </div>
      </main>
    </div>
  )
}

function SidebarLink({ href, icon: Icon, label, active }: { href: string, icon: React.ElementType, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-brand-soft text-brand font-medium' : 'text-text-muted hover:text-text hover:bg-bg-hover'}`}>
      <Icon size={16} />
      {label}
    </Link>
  )
}