'use client'

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Sparkles, MessageCircle, FileQuestion, Layers, FileText, BarChart3, Calendar, Check } from "lucide-react"

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <main className="min-h-screen bg-bg text-text">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={28} height={28} />
            <span className="text-text font-semibold text-lg">TeraEdu</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-text-muted hover:text-text text-sm transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-text-muted hover:text-text text-sm transition-colors">Como funciona</a>
            <a href="#depoimentos" className="text-text-muted hover:text-text text-sm transition-colors">Depoimentos</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-9 h-9 rounded-lg hover:bg-bg-hover flex items-center justify-center text-text-muted hover:text-text transition-colors">
              {mounted && theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link href="/login" className="text-text-muted hover:text-text text-sm transition-colors">Entrar</Link>
            <Link href="/login" className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-bg-card border border-border rounded-full px-4 py-1.5 mb-8">
            <Sparkles size={12} className="text-brand" />
            <span className="text-text-muted text-xs">Plataforma com IA para o ENEM e vestibulares</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
            Estude mais inteligente,<br />
            <span className="text-brand">não mais difícil</span>
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            O TeraEdu usa inteligência artificial para criar resumos, flashcards, explicar conteúdos e gerar questões personalizadas para o seu ritmo de estudo.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/login" className="bg-brand hover:bg-brand-hover text-white font-medium px-8 py-3.5 rounded-xl transition-colors text-sm">
              Criar conta grátis
            </Link>
            <a href="#como-funciona" className="bg-bg-card border border-border hover:border-brand text-text font-medium px-8 py-3.5 rounded-xl transition-colors text-sm">
              Ver como funciona
            </a>
          </div>
          <p className="text-text-faint text-xs mt-5">Grátis para começar · Sem cartão de crédito</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Tudo que você precisa para passar</h2>
            <p className="text-text-muted">Ferramentas com IA pensadas para o estudante brasileiro</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: MessageCircle, titulo: "IA Tutora", desc: "Tire dúvidas sobre qualquer conteúdo do ensino médio em tempo real, com explicações claras e exemplos práticos." },
              { icon: FileQuestion, titulo: "Banco de Questões", desc: "Questões do ENEM, FUVEST, UNICAMP e outros vestibulares, organizadas por matéria e assunto." },
              { icon: Layers, titulo: "Flashcards com IA", desc: "A IA cria flashcards automaticamente a partir do conteúdo que você estuda, com sistema de revisão espaçada." },
              { icon: FileText, titulo: "Resumos Automáticos", desc: "Gere resumos completos de qualquer tema em segundos, ou faça upload do seu material e deixe a IA resumir." },
              { icon: BarChart3, titulo: "Painel de Desempenho", desc: "Acompanhe seu progresso por matéria, veja seus pontos fracos e receba sugestões personalizadas de estudo." },
              { icon: Calendar, titulo: "Plano de Estudos", desc: "A IA monta um cronograma personalizado com base na sua prova, tempo disponível e pontos de reforço." },
            ].map((f) => (
              <div key={f.titulo} className="bg-bg-card border border-border rounded-2xl p-6 hover:border-brand transition-colors">
                <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-brand" />
                </div>
                <h3 className="text-text font-semibold mb-2">{f.titulo}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Como funciona</h2>
            <p className="text-text-muted">Simples, rápido e eficiente</p>
          </div>
          <div className="flex flex-col gap-8">
            {[
              { num: "01", titulo: "Crie sua conta grátis", desc: "Cadastre-se em menos de 1 minuto. Sem cartão de crédito, sem burocracia." },
              { num: "02", titulo: "Escolha sua prova e matérias", desc: "Diga para o TeraEdu qual é o seu objetivo — ENEM, FUVEST, UNICAMP — e quais matérias quer focar." },
              { num: "03", titulo: "A IA monta seu plano", desc: "Com base na sua prova e disponibilidade, a IA cria um cronograma de estudos personalizado para você." },
              { num: "04", titulo: "Estude com as ferramentas certas", desc: "Use questões, flashcards, resumos e a tutora de IA para absorver o conteúdo de forma eficiente." },
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-6">
                <div className="w-12 h-12 bg-brand-soft rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-brand font-bold text-sm">{p.num}</span>
                </div>
                <div>
                  <h3 className="text-text font-semibold mb-1">{p.titulo}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">O que os alunos dizem</h2>
            <p className="text-text-muted">Estudantes que mudaram sua forma de estudar com o TeraEdu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { nome: "Ana Lima", curso: "Aprovada em Medicina — FUVEST 2024", texto: "O TeraEdu mudou minha forma de estudar. A IA tutora me salvou em Química Orgânica, explicava de um jeito que eu finalmente entendia." },
              { nome: "Pedro Souza", curso: "Aprovado em Engenharia — ITA 2024", texto: "Os flashcards automáticos são incríveis. Nunca conseguia manter consistência na revisão, mas com o sistema de repetição espaçada ficou fácil." },
              { nome: "Carla Mendes", curso: "Aprovada em Direito — USP 2024", texto: "O banco de questões é enorme e bem organizado. Fiz mais de 500 questões de Português e minha nota no ENEM subiu 80 pontos." },
            ].map((d) => (
              <div key={d.nome} className="bg-bg-card border border-border rounded-2xl p-6">
                <p className="text-text-muted text-sm leading-relaxed mb-4">&ldquo;{d.texto}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand rounded-full flex items-center justify-center text-white font-semibold text-sm">{d.nome[0]}</div>
                  <div>
                    <p className="text-text text-sm font-medium">{d.nome}</p>
                    <p className="text-text-faint text-xs">{d.curso}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Pronto para passar na sua prova?</h2>
          <p className="text-text-muted mb-8">Junte-se a milhares de estudantes que já estão usando o TeraEdu para estudar com inteligência.</p>
          <Link href="/login" className="inline-block bg-brand hover:bg-brand-hover text-white font-medium px-10 py-3.5 rounded-xl transition-colors text-sm">
            Criar conta grátis agora
          </Link>
          <div className="flex items-center justify-center gap-2 mt-5 text-text-faint text-xs">
            <Check size={12} /> Grátis para começar
            <span>·</span>
            <Check size={12} /> Cancele quando quiser
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={24} height={24} />
            <span className="text-text font-semibold">TeraEdu</span>
          </div>
          <p className="text-text-faint text-xs">© 2025 TeraEdu · Todos os direitos reservados</p>
          <div className="flex gap-6">
            <a href="#" className="text-text-muted hover:text-text text-xs transition-colors">Termos de uso</a>
            <a href="#" className="text-text-muted hover:text-text text-xs transition-colors">Privacidade</a>
            <a href="#" className="text-text-muted hover:text-text text-xs transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  )
}