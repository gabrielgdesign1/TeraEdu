import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f1117] text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f1117]/80 backdrop-blur-md border-b border-[#2a2d3a]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={32} height={32} />
            <span className="text-white font-semibold text-lg">TeraEdu</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#8b8fa8] hover:text-white text-sm transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-[#8b8fa8] hover:text-white text-sm transition-colors">Como funciona</a>
            <a href="#depoimentos" className="text-[#8b8fa8] hover:text-white text-sm transition-colors">Depoimentos</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[#8b8fa8] hover:text-white text-sm transition-colors">Entrar</Link>
            <Link href="/login" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#1a1d27] border border-[#2a2d3a] rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-[#2563eb] rounded-full animate-pulse"></div>
            <span className="text-[#8b8fa8] text-xs">Plataforma com IA para o ENEM e vestibulares</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Estude mais inteligente,<br />
            <span className="text-[#2563eb]">não mais difícil</span>
          </h1>
          <p className="text-[#8b8fa8] text-lg max-w-2xl mx-auto mb-10">
            O TeraEdu usa inteligência artificial para criar resumos, flashcards, explicar conteúdos e gerar questões personalizadas para o seu ritmo de estudo.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-8 py-3.5 rounded-xl transition-colors text-sm">
              Criar conta grátis
            </Link>
            <a href="#como-funciona" className="bg-[#1a1d27] border border-[#2a2d3a] hover:border-[#2563eb] text-white font-medium px-8 py-3.5 rounded-xl transition-colors text-sm">
              Ver como funciona
            </a>
          </div>
          <p className="text-[#4a4d5e] text-xs mt-4">Grátis para começar · Sem cartão de crédito</p>

          {/* Dashboard preview */}
          <div className="mt-16 bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-1 max-w-4xl mx-auto">
            <div className="bg-[#0f1117] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Questões resolvidas", value: "142" },
                  { label: "Flashcards revisados", value: "89" },
                  { label: "Horas estudadas", value: "18h" },
                  { label: "Sequência atual", value: "7 dias 🔥" },
                ].map((c) => (
                  <div key={c.label} className="bg-[#1a1d27] rounded-xl p-3 border border-[#2a2d3a]">
                    <p className="text-[#8b8fa8] text-xs mb-1">{c.label}</p>
                    <p className="text-white font-semibold">{c.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { nome: "Matemática", p: 68 },
                  { nome: "Física", p: 45 },
                  { nome: "Português", p: 72 },
                  { nome: "Biologia", p: 55 },
                  { nome: "Química", p: 38 },
                  { nome: "História", p: 61 },
                ].map((m) => (
                  <div key={m.nome} className="bg-[#1a1d27] rounded-lg p-3 border border-[#2a2d3a]">
                    <p className="text-white text-xs font-medium mb-1.5">{m.nome}</p>
                    <div className="h-1 bg-[#2a2d3a] rounded-full">
                      <div className="h-1 bg-[#2563eb] rounded-full" style={{ width: `${m.p}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-[#2a2d3a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Tudo que você precisa para passar</h2>
            <p className="text-[#8b8fa8]">Ferramentas com IA pensadas para o estudante brasileiro</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "💬", titulo: "IA Tutora", desc: "Tire dúvidas sobre qualquer conteúdo do ensino médio em tempo real, com explicações claras e exemplos práticos." },
              { icon: "📝", titulo: "Banco de Questões", desc: "Questões do ENEM, FUVEST, UNICAMP e outros vestibulares, organizadas por matéria e assunto." },
              { icon: "🃏", titulo: "Flashcards com IA", desc: "A IA cria flashcards automaticamente a partir do conteúdo que você estuda, com sistema de revisão espaçada." },
              { icon: "📄", titulo: "Resumos Automáticos", desc: "Gere resumos completos de qualquer tema em segundos, ou faça upload do seu material e deixe a IA resumir." },
              { icon: "📊", titulo: "Painel de Desempenho", desc: "Acompanhe seu progresso por matéria, veja seus pontos fracos e receba sugestões personalizadas de estudo." },
              { icon: "📅", titulo: "Plano de Estudos", desc: "A IA monta um cronograma personalizado com base na sua prova, tempo disponível e pontos de reforço." },
            ].map((f) => (
              <div key={f.titulo} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6 hover:border-[#2563eb] transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.titulo}</h3>
                <p className="text-[#8b8fa8] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 px-6 border-t border-[#2a2d3a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Como funciona</h2>
            <p className="text-[#8b8fa8]">Simples, rápido e eficiente</p>
          </div>
          <div className="flex flex-col gap-8">
            {[
              { num: "01", titulo: "Crie sua conta grátis", desc: "Cadastre-se em menos de 1 minuto. Sem cartão de crédito, sem burocracia." },
              { num: "02", titulo: "Escolha sua prova e matérias", desc: "Diga para o TeraEdu qual é o seu objetivo — ENEM, FUVEST, UNICAMP — e quais matérias quer focar." },
              { num: "03", titulo: "A IA monta seu plano", desc: "Com base na sua prova e disponibilidade, a IA cria um cronograma de estudos personalizado para você." },
              { num: "04", titulo: "Estude com as ferramentas certas", desc: "Use questões, flashcards, resumos e a tutora de IA para absorver o conteúdo de forma eficiente." },
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-6">
                <div className="w-12 h-12 bg-[#2563eb]/10 border border-[#2563eb]/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-[#2563eb] font-bold text-sm">{p.num}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{p.titulo}</h3>
                  <p className="text-[#8b8fa8] text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20 px-6 border-t border-[#2a2d3a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">O que os alunos dizem</h2>
            <p className="text-[#8b8fa8]">Estudantes que mudaram sua forma de estudar com o TeraEdu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { nome: "Ana Lima", curso: "Aprovada em Medicina — FUVEST 2024", texto: "O TeraEdu mudou minha forma de estudar. A IA tutora me salvou em Química Orgânica, explicava de um jeito que eu finalmente entendia." },
              { nome: "Pedro Souza", curso: "Aprovado em Engenharia — ITA 2024", texto: "Os flashcards automáticos são incríveis. Nunca conseguia manter consistência na revisão, mas com o sistema de repetição espaçada ficou fácil." },
              { nome: "Carla Mendes", curso: "Aprovada em Direito — USP 2024", texto: "O banco de questões é enorme e bem organizado. Fiz mais de 500 questões de Português e minha nota no ENEM subiu 80 pontos." },
            ].map((d) => (
              <div key={d.nome} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
                <p className="text-[#8b8fa8] text-sm leading-relaxed mb-4">"{d.texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#2563eb] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {d.nome[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{d.nome}</p>
                    <p className="text-[#8b8fa8] text-xs">{d.curso}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 border-t border-[#2a2d3a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para passar na sua prova?</h2>
          <p className="text-[#8b8fa8] mb-8">Junte-se a milhares de estudantes que já estão usando o TeraEdu para estudar com inteligência.</p>
          <Link href="/login" className="inline-block bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-10 py-3.5 rounded-xl transition-colors text-sm">
            Criar conta grátis agora
          </Link>
          <p className="text-[#4a4d5e] text-xs mt-4">Grátis para começar · Cancele quando quiser</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#2a2d3a]">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Image src="/TeraEdu-logo-white.png" alt="TeraEdu" width={28} height={28} />
            <span className="text-white font-semibold">TeraEdu</span>
          </div>
          <p className="text-[#4a4d5e] text-xs">© 2025 TeraEdu · Todos os direitos reservados</p>
          <div className="flex gap-6">
            <a href="#" className="text-[#8b8fa8] hover:text-white text-xs transition-colors">Termos de uso</a>
            <a href="#" className="text-[#8b8fa8] hover:text-white text-xs transition-colors">Privacidade</a>
            <a href="#" className="text-[#8b8fa8] hover:text-white text-xs transition-colors">Contato</a>
          </div>
        </div>
      </footer>

    </main>
  );
}