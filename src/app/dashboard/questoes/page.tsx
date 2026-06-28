'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Questoes() {
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
          <Link href="/dashboard/questoes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-medium">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            Questões
          </Link>
          <Link href="/dashboard/flashcards" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
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

      <main className="flex-1 ml-64 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-white text-2xl font-semibold mb-2">Em construção</h1>
          <p className="text-[#8b8fa8] text-sm">O banco de questões está sendo desenvolvido. Volte em breve!</p>
        </div>
      </main>
    </div>
  )
}