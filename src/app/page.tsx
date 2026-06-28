'use client'

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Sparkles, MessageCircle, FileQuestion, Layers, FileText, BarChart3, Calendar, Check, ArrowRight } from "lucide-react"

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <main className="min-h-screen bg-bg text-text overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/70 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={26} height={26} />
            <span className="font-semibold tracking-tight">TeraEdu</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features"      className="text-text-muted hover:text-text text-sm transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-text-muted hover:text-text text-sm transition-colors">Como funciona</a>
            <a href="#depoimentos"   className="text-text-muted hover:text-text text-sm transition-colors">Depoimentos</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-lg hover:bg-bg-hover flex items-center justify-center text-text-muted hover:text-text transition-colors"
            >
              {mounted && theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link href="/login" className="text-text-muted hover:text-text text-sm transition-colors">Entrar</Link>
            <Link href="/login" className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──
          Grid de 2 colunas no desktop.
          Coluna esquerda: todo o texto em fluxo normal (z-20).
          Coluna direita: lápis posicionado com margem negativa
          para invadir a coluna de texto e criar o overlap visual.
          O lápis fica em z-10 → entre o watermark (z-0) e o texto (z-20).
      ── */}
      <section className="relative min-h-screen overflow-hidden pt-20">

        {/* Watermark z-0 */}
        <div className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden z-0">
          <span className="text-[22vw] font-black text-text opacity-[0.04] leading-none tracking-tighter whitespace-nowrap pl-2">
            ESTUDE
          </span>
        </div>

        {/* Grid principal */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 min-h-[calc(100vh-80px)] grid lg:grid-cols-[52%_48%] items-center gap-0">

          {/* Coluna esquerda — texto z-20 */}
          <div className="relative z-20 py-20 lg:py-0">
            <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-10 bg-bg/50 backdrop-blur-sm">
              <Sparkles size={11} className="text-brand" />
              <span className="text-text-muted text-xs tracking-widest uppercase">IA para o ENEM e vestibulares</span>
            </div>

            <h1 className="text-[clamp(2.8rem,5.5vw,6rem)] font-black leading-[0.88] tracking-tight mb-10">
              <span className="block text-text-muted font-extralight">Estude mais</span>
              <span className="block text-text">inteligente,</span>
              <span className="block text-brand">não mais</span>
              <span className="block text-brand font-extralight italic">difícil.</span>
            </h1>

            <p className="text-text-muted text-lg leading-relaxed max-w-[380px] mb-10">
              O TeraEdu usa inteligência artificial para criar resumos, flashcards, explicar conteúdos e gerar questões personalizadas para o seu ritmo de estudo.
            </p>

            <div className="flex items-center gap-4 flex-wrap mb-6">
              <Link href="/login" className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-7 py-3.5 rounded-2xl transition-all text-sm hover:gap-3">
                Criar conta grátis <ArrowRight size={14} />
              </Link>
              <a href="#como-funciona" className="text-text-muted hover:text-text text-sm flex items-center gap-1.5 transition-colors">
                Como funciona <ArrowRight size={12} />
              </a>
            </div>
            <p className="text-text-faint text-xs">Grátis para começar · Sem cartão de crédito</p>
          </div>

          {/* Coluna direita — lápis z-10, invade coluna esquerda com margin negativa */}
          <div className="hidden lg:block relative z-10">
            {/* Glow */}
            <div className="absolute inset-0 bg-brand/8 blur-[120px] rounded-full scale-75 translate-x-8" />
            {/* Lápis: -ml-[18%] faz ele invadir o texto criando overlap */}
            <div className="-ml-[18%] relative">
              <Image
                src="/pencil png render.png"
                alt=""
                width={760}
                height={760}
                className="w-full drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Stats bar — fora do grid, na base */}
        <div className="relative z-20 border-t border-border bg-bg/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "10k+", label: "Alunos cadastrados" },
              { num: "98%",  label: "Taxa de aprovação"  },
              { num: "6",    label: "Ferramentas com IA" },
              { num: "2024", label: "Questões de ENEM"   },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black leading-none">{s.num}</p>
                <p className="text-text-muted text-xs mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──
          Átomo posicionado no canto direito do header da seção.
          Usa `absolute` dentro de um container com altura mínima definida
          para não vazar em nenhum tamanho.
      ── */}
      <section id="features" className="py-28 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">

          {/* Header com átomo sobreposto */}
          <div className="relative mb-20 min-h-[200px] lg:min-h-[240px]">
            <p className="text-brand text-xs tracking-widest uppercase mb-5">Funcionalidades</p>

            <h2 className="text-[clamp(2.2rem,5vw,5.5rem)] font-black leading-[0.88] tracking-tight relative z-[5]">
              <span className="block text-text-muted font-extralight">Tudo que você</span>
              <span className="block text-text">precisa para passar.</span>
            </h2>

            {/* Átomo — posicionado no canto superior direito do container */}
            <div className="absolute right-0 top-[-10px] z-[15] pointer-events-none w-[160px] md:w-[220px] lg:w-[260px]">
              <div className="absolute inset-0 bg-brand/10 blur-[60px] rounded-full" />
              <Image
                src="/atom png render.png"
                alt=""
                width={260}
                height={260}
                className="relative z-10 w-full drop-shadow-2xl"
              />
            </div>

            <p className="text-text-muted max-w-sm mt-6 text-sm leading-relaxed relative z-[5]">
              Ferramentas com IA pensadas para o estudante brasileiro conquistar sua vaga.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: MessageCircle, titulo: "IA Tutora",            desc: "Tire dúvidas sobre qualquer conteúdo do ensino médio em tempo real, com explicações claras e exemplos práticos.", tag: "Chat"       },
              { icon: FileQuestion,  titulo: "Banco de Questões",    desc: "Questões do ENEM, FUVEST, UNICAMP e outros vestibulares, organizadas por matéria e assunto.",                    tag: "Questões"  },
              { icon: Layers,        titulo: "Flashcards com IA",    desc: "A IA cria flashcards automaticamente a partir do conteúdo que você estuda, com sistema de revisão espaçada.",   tag: "Revisão"   },
              { icon: FileText,      titulo: "Resumos Automáticos",  desc: "Gere resumos completos de qualquer tema em segundos, ou faça upload do seu material e deixe a IA resumir.",      tag: "Resumo"    },
              { icon: BarChart3,     titulo: "Painel de Desempenho", desc: "Acompanhe seu progresso por matéria, veja seus pontos fracos e receba sugestões personalizadas de estudo.",      tag: "Analytics" },
              { icon: Calendar,      titulo: "Plano de Estudos",     desc: "A IA monta um cronograma personalizado com base na sua prova, tempo disponível e pontos de reforço.",            tag: "Plano"     },
            ].map((f) => (
              <div key={f.titulo} className="group bg-bg-card border border-border rounded-3xl p-8 hover:border-brand transition-all duration-300 hover:bg-brand/[0.02]">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-11 h-11 bg-brand-soft rounded-2xl flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                    <f.icon size={18} className="text-brand" />
                  </div>
                  <span className="text-text-faint text-xs tracking-widest uppercase border border-border rounded-full px-3 py-1">{f.tag}</span>
                </div>
                <h3 className="text-text font-bold text-lg mb-3">{f.titulo}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ──
          Grid de 2 colunas: esquerda = steps, direita = chapéu.
          O chapéu usa `sticky` para flutuar enquanto os steps rolam.
          Sem absolute no texto — layout previsível em qualquer tamanho.
      ── */}
      <section id="como-funciona" className="py-28 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">

          <p className="text-brand text-xs tracking-widest uppercase mb-5">Como funciona</p>
          <h2 className="text-[clamp(2.2rem,5vw,5.5rem)] font-black leading-[0.88] tracking-tight mb-20">
            <span className="block text-text-muted font-extralight">Simples,</span>
            <span className="block text-text">rápido e eficiente.</span>
          </h2>

          <div className="grid lg:grid-cols-[1fr_360px] gap-16 items-start">

            {/* Steps */}
            <div>
              {[
                { num: "01", titulo: "Crie sua conta grátis",           desc: "Cadastre-se em menos de 1 minuto. Sem cartão de crédito, sem burocracia." },
                { num: "02", titulo: "Escolha sua prova e matérias",    desc: "Diga para o TeraEdu qual é o seu objetivo — ENEM, FUVEST, UNICAMP — e quais matérias quer focar." },
                { num: "03", titulo: "A IA monta seu plano",            desc: "Com base na sua prova e disponibilidade, a IA cria um cronograma de estudos personalizado para você." },
                { num: "04", titulo: "Estude com as ferramentas certas",desc: "Use questões, flashcards, resumos e a tutora de IA para absorver o conteúdo de forma eficiente." },
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-8 py-10 border-b border-border last:border-0 group">
                  <span className="text-[5rem] lg:text-[7rem] font-black leading-none text-text-faint group-hover:text-brand/30 transition-colors duration-500 tabular-nums w-28 lg:w-36 flex-shrink-0">
                    {p.num}
                  </span>
                  <div className="pt-3 lg:pt-5">
                    <h3 className="text-text font-bold text-xl mb-3">{p.titulo}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chapéu — sticky na coluna direita */}
            <div className="hidden lg:flex items-center justify-center sticky top-32">
              <div className="relative">
                <div className="absolute inset-0 bg-brand/10 blur-[80px] rounded-full" />
                <Image
                  src="/cap pngc render.png"
                  alt=""
                  width={320}
                  height={320}
                  className="relative z-10 drop-shadow-2xl w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section id="depoimentos" className="py-28 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-brand text-xs tracking-widest uppercase mb-4">Depoimentos</p>
            <h2 className="text-[clamp(2.2rem,5vw,5rem)] font-black leading-[0.88] tracking-tight">
              <span className="block text-text-muted font-extralight">O que os</span>
              <span className="block text-text">alunos dizem.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { nome: "Ana Lima",     curso: "Aprovada em Medicina — FUVEST 2024", texto: "O TeraEdu mudou minha forma de estudar. A IA tutora me salvou em Química Orgânica, explicava de um jeito que eu finalmente entendia." },
              { nome: "Pedro Souza",  curso: "Aprovado em Engenharia — ITA 2024",  texto: "Os flashcards automáticos são incríveis. Nunca conseguia manter consistência na revisão, mas com o sistema de repetição espaçada ficou fácil." },
              { nome: "Carla Mendes", curso: "Aprovada em Direito — USP 2024",     texto: "O banco de questões é enorme e bem organizado. Fiz mais de 500 questões de Português e minha nota no ENEM subiu 80 pontos." },
            ].map((d) => (
              <div key={d.nome} className="bg-bg-card border border-border rounded-3xl p-8 flex flex-col justify-between gap-8 hover:border-brand/40 transition-colors">
                <p className="text-text text-base leading-relaxed">&ldquo;{d.texto}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{d.nome[0]}</div>
                  <div>
                    <p className="text-text text-sm font-semibold">{d.nome}</p>
                    <p className="text-text-faint text-xs mt-0.5">{d.curso}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-28 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl border border-border bg-bg-card overflow-hidden p-12 lg:p-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <p className="text-brand text-xs tracking-widest uppercase mb-6">Comece hoje</p>
              <h2 className="text-[clamp(2rem,5vw,5rem)] font-black leading-[0.88] tracking-tight mb-6">
                <span className="block text-text-muted font-extralight">Pronto para passar</span>
                <span className="block text-text">na sua prova?</span>
              </h2>
              <p className="text-text-muted text-lg max-w-lg mx-auto mb-12">
                Junte-se a milhares de estudantes que já estão usando o TeraEdu para estudar com inteligência.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-10 py-4 rounded-2xl transition-all text-base hover:gap-3">
                Criar conta grátis agora <ArrowRight size={16} />
              </Link>
              <div className="flex items-center justify-center gap-6 mt-8 text-text-faint text-xs flex-wrap">
                <span className="flex items-center gap-1.5"><Check size={11} /> Grátis para começar</span>
                <span className="flex items-center gap-1.5"><Check size={11} /> Cancele quando quiser</span>
                <span className="flex items-center gap-1.5"><Check size={11} /> Sem cartão de crédito</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/TeraEdu-logo-blue.png" alt="TeraEdu" width={22} height={22} />
            <span className="font-semibold tracking-tight">TeraEdu</span>
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
