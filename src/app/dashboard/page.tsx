import Image from "next/image"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0f1117] flex">

      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1d27] border-r border-[#2a2d3a] flex flex-col fixed h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-[#2a2d3a]">
          <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={32} height={32} />
          <span className="text-white font-semibold text-lg">TeraEdu</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-medium">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a href="/dashboard/questoes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            Questões
          </a>
          <a href="/dashboard/flashcards" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Flashcards
          </a>
          <a href="/dashboard/resumos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Resumos
          </a>
          <a href="/dashboard/tutora" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            IA Tutora
          </a>
          <a href="/dashboard/desempenho" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Desempenho
          </a>
          <a href="/dashboard/plano" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8b8fa8] hover:text-white hover:bg-[#2a2d3a] text-sm transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Plano de Estudos
          </a>
        </nav>

        {/* User */}
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-semibold">Bom dia, Gabriel! 👋</h1>
          <p className="text-[#8b8fa8] text-sm mt-1">Você tem 3 revisões pendentes hoje.</p>
        </div>

        {/* Cards de progresso */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5">
            <p className="text-[#8b8fa8] text-xs mb-1">Questões resolvidas</p>
            <p className="text-white text-2xl font-semibold">142</p>
            <p className="text-[#2563eb] text-xs mt-1">+12 essa semana</p>
          </div>
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5">
            <p className="text-[#8b8fa8] text-xs mb-1">Flashcards revisados</p>
            <p className="text-white text-2xl font-semibold">89</p>
            <p className="text-[#2563eb] text-xs mt-1">+24 essa semana</p>
          </div>
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5">
            <p className="text-[#8b8fa8] text-xs mb-1">Horas estudadas</p>
            <p className="text-white text-2xl font-semibold">18h</p>
            <p className="text-[#2563eb] text-xs mt-1">+3h essa semana</p>
          </div>
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5">
            <p className="text-[#8b8fa8] text-xs mb-1">Sequência atual</p>
            <p className="text-white text-2xl font-semibold">7 dias 🔥</p>
            <p className="text-[#2563eb] text-xs mt-1">Continue assim!</p>
          </div>
        </div>

        {/* Matérias e atividade recente */}
        <div className="grid grid-cols-3 gap-6">
          {/* Matérias */}
          <div className="col-span-2 bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Matérias</h2>
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
                <div key={m.nome} className="bg-[#0f1117] rounded-xl p-4 cursor-pointer hover:border hover:border-[#2563eb] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{m.nome}</span>
                    <span className="text-[#8b8fa8] text-xs">{m.progresso}%</span>
                  </div>
                  <div className="h-1.5 bg-[#2a2d3a] rounded-full">
                    <div className="h-1.5 rounded-full" style={{ width: `${m.progresso}%`, backgroundColor: m.cor }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Atividade recente */}
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Atividade recente</h2>
            <div className="flex flex-col gap-3">
              {[
                { acao: "Resolveu 10 questões", materia: "Matemática", tempo: "2h atrás" },
                { acao: "Revisou flashcards", materia: "Biologia", tempo: "5h atrás" },
                { acao: "Leu resumo", materia: "História", tempo: "ontem" },
                { acao: "Simulado ENEM", materia: "Geral", tempo: "ontem" },
                { acao: "Perguntou à IA", materia: "Física", tempo: "2 dias atrás" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#2563eb] rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-white text-sm">{a.acao}</p>
                    <p className="text-[#8b8fa8] text-xs">{a.materia} · {a.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}