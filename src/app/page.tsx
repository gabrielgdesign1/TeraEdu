'use client'

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Sun, Moon, Sparkles, MessageCircle, FileQuestion, Layers,
  FileText, BarChart3, Calendar, Check, ArrowRight,
  Target, Brain, Trophy, Zap, BookOpen,
} from "lucide-react"

/* ── animation presets ── */
const up = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
})

/* ── carousel items ── */
const CAROUSEL = [
  { icon: FileQuestion, label: "Banco de Questões",    desc: "ENEM + principais vestibulares" },
  { icon: MessageCircle,label: "IA Tutora",            desc: "Dúvidas respondidas em segundos" },
  { icon: FileText,     label: "Resumos Automáticos", desc: "Qualquer tema em instantes" },
  { icon: Layers,       label: "Flashcards com IA",   desc: "Revisão espaçada inteligente" },
  { icon: Calendar,     label: "Plano de Estudos",    desc: "Cronograma personalizado" },
  { icon: BarChart3,    label: "Painel de Desempenho",desc: "Evolução por matéria" },
  { icon: Target,       label: "Vestibulares",        desc: "FUVEST, UNICAMP, UNESP e mais" },
  { icon: Brain,        label: "IA Adaptativa",       desc: "Aprende com seu ritmo" },
  { icon: Trophy,       label: "Conquistas",          desc: "Gamificação do estudo" },
  { icon: Zap,          label: "+2.000 Questões",     desc: "Sempre atualizadas" },
  { icon: BookOpen,     label: "Conteúdo Completo",   desc: "Todas as matérias do EM" },
]
const DOUBLE = [...CAROUSEL, ...CAROUSEL]

/* ── nav links ── */
const NAV_LINKS = [
  { name: 'Funcionalidades', url: '#features' },
  { name: 'Como funciona',   url: '#como-funciona' },
  { name: 'Depoimentos',     url: '#depoimentos' },
]

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeNav, setActiveNav] = useState('')

  useEffect(() => setMounted(true), [])

  return (
    <main className="min-h-screen bg-bg text-text overflow-x-hidden">

      {/* ── MARQUEE KEYFRAME ── */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 36s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/70 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <motion.div
            className="flex items-center gap-2.5 flex-shrink-0"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={26} height={26} />
            <span className="font-semibold tracking-tight">TeraEdu</span>
          </motion.div>

          {/* Center — tubelight pill */}
          <motion.div
            className="hidden md:flex items-center gap-1 bg-bg-card/60 border border-border rounded-full px-1 py-1"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {NAV_LINKS.map((item) => {
              const isActive = activeNav === item.name
              return (
                <a
                  key={item.name}
                  href={item.url}
                  onClick={() => setActiveNav(item.name)}
                  className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors text-text-muted hover:text-text select-none"
                >
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="tubelight"
                      className="absolute inset-0 rounded-full bg-brand/8 -z-0"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    >
                      {/* lamp glow */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-[3px] bg-brand rounded-t-full overflow-visible">
                        <div className="absolute w-12 h-5 bg-brand/25 rounded-full blur-md -top-1.5 -left-2.5" />
                        <div className="absolute w-7 h-4 bg-brand/20 rounded-full blur-sm -top-1" />
                      </div>
                    </motion.div>
                  )}
                </a>
              )
            })}
          </motion.div>

          {/* Right */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-lg hover:bg-bg-hover flex items-center justify-center text-text-muted hover:text-text transition-colors"
            >
              {mounted && theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link href="/login" className="text-text-muted hover:text-text text-sm transition-colors hidden sm:block">Entrar</Link>
            <Link
              href="/login"
              className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              Começar grátis
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen overflow-hidden pt-20">

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden z-0">
          <motion.span
            className="text-[22vw] font-black text-text opacity-[0.04] leading-none tracking-tighter whitespace-nowrap pl-2"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 0.04, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            ESTUDE
          </motion.span>
        </div>

        {/* Grid */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 min-h-[calc(100vh-80px)] grid lg:grid-cols-[52%_48%] items-center gap-0">

          {/* Left — text */}
          <div className="relative z-20 py-20 lg:py-0">
            <motion.div
              className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-10 bg-bg/50 backdrop-blur-sm"
              {...up(0.2)}
            >
              <Sparkles size={11} className="text-brand" />
              <span className="text-text-muted text-xs tracking-widest uppercase">IA para o ENEM e vestibulares</span>
            </motion.div>

            <h1 className="text-[clamp(2.8rem,5.5vw,6rem)] font-black leading-[0.88] tracking-tight mb-10">
              <motion.span className="block text-text-muted font-extralight" {...up(0.3)}>Estude mais</motion.span>
              <motion.span className="block text-text" {...up(0.38)}>inteligente,</motion.span>
              <motion.span className="block text-brand" {...up(0.46)}>não mais</motion.span>
              <motion.span className="block text-brand font-extralight italic" {...up(0.54)}>difícil.</motion.span>
            </h1>

            <motion.p
              className="text-text-muted text-lg leading-relaxed max-w-[380px] mb-10"
              {...up(0.62)}
            >
              O TeraEdu usa inteligência artificial para criar resumos, flashcards, explicar conteúdos e gerar questões personalizadas para o seu ritmo de estudo.
            </motion.p>

            <motion.div className="flex items-center gap-4 flex-wrap mb-6" {...up(0.7)}>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-7 py-3.5 rounded-full transition-all text-sm hover:gap-3 hover:scale-[1.03] active:scale-[0.97]"
              >
                Criar conta grátis <ArrowRight size={14} />
              </Link>
              <a href="#como-funciona" className="text-text-muted hover:text-text text-sm flex items-center gap-1.5 transition-colors">
                Como funciona <ArrowRight size={12} />
              </a>
            </motion.div>

            <motion.p className="text-text-faint text-xs" {...up(0.76)}>
              Grátis para começar · Sem cartão de crédito
            </motion.p>
          </div>

          {/* Right — pencil image */}
          <div className="hidden lg:block relative z-10">
            <div className="absolute inset-0 bg-brand/8 blur-[120px] rounded-full scale-75 translate-x-8" />
            <motion.div
              className="-ml-[18%] relative"
              initial={{ opacity: 0, x: 60, rotate: 4 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/cap pngc render.png"
                alt=""
                width={760}
                height={760}
                className="w-full drop-shadow-2xl"
                priority
              />
            </motion.div>
          </div>
        </div>

        {/* ── FEATURE CAROUSEL (replaces stats bar) ── */}
        <div className="relative z-20 border-t border-border bg-bg/60 backdrop-blur-md overflow-hidden">
          {/* fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-bg to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-bg to-transparent" />

          <div className="animate-marquee flex">
            {DOUBLE.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-8 py-5 border-r border-border/50 flex-shrink-0 group"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-soft flex items-center justify-center flex-shrink-0 group-hover:bg-brand/20 transition-colors">
                  <item.icon size={14} className="text-brand" />
                </div>
                <div>
                  <p className="text-text text-sm font-semibold whitespace-nowrap leading-tight">{item.label}</p>
                  <p className="text-text-faint text-xs whitespace-nowrap">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">

          <div className="relative mb-20 min-h-[200px] lg:min-h-[240px]">
            <motion.p className="text-brand text-xs tracking-widest uppercase mb-5" {...inView()}>Funcionalidades</motion.p>

            <h2 className="text-[clamp(2.2rem,5vw,5.5rem)] font-black leading-[0.88] tracking-tight relative z-[5]">
              <motion.span className="block text-text-muted font-extralight" {...inView(0.08)}>Tudo que você</motion.span>
              <motion.span className="block text-text" {...inView(0.16)}>precisa para passar.</motion.span>
            </h2>

            {/* Atom */}
            <motion.div
              className="absolute right-0 top-[-10px] z-[15] pointer-events-none w-[160px] md:w-[220px] lg:w-[260px]"
              initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 bg-brand/10 blur-[60px] rounded-full" />
              <Image src="/atom png render.png" alt="" width={260} height={260} className="relative z-10 w-full drop-shadow-2xl" />
            </motion.div>

            <motion.p className="text-text-muted max-w-sm mt-6 text-sm leading-relaxed relative z-[5]" {...inView(0.24)}>
              Ferramentas com IA pensadas para o estudante brasileiro conquistar sua vaga.
            </motion.p>
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
            ].map((f, i) => (
              <motion.div
                key={f.titulo}
                className="group bg-bg-card border border-border rounded-3xl p-8 hover:border-brand transition-all duration-300 hover:bg-brand/[0.02] cursor-default"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
              >
                <div className="flex items-start justify-between mb-8">
                  <motion.div
                    className="w-11 h-11 bg-brand-soft rounded-2xl flex items-center justify-center group-hover:bg-brand/20 transition-colors"
                    whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
                  >
                    <f.icon size={18} className="text-brand" />
                  </motion.div>
                  <span className="text-text-faint text-xs tracking-widest uppercase border border-border rounded-full px-3 py-1">{f.tag}</span>
                </div>
                <h3 className="text-text font-bold text-lg mb-3">{f.titulo}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="py-28 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">

          <motion.p className="text-brand text-xs tracking-widest uppercase mb-5" {...inView()}>Como funciona</motion.p>
          <h2 className="text-[clamp(2.2rem,5vw,5.5rem)] font-black leading-[0.88] tracking-tight mb-20">
            <motion.span className="block text-text-muted font-extralight" {...inView(0.08)}>Simples,</motion.span>
            <motion.span className="block text-text" {...inView(0.16)}>rápido e eficiente.</motion.span>
          </h2>

          <div className="grid lg:grid-cols-[1fr_360px] gap-16 items-start">
            <div>
              {[
                { num: "01", titulo: "Crie sua conta grátis",            desc: "Cadastre-se em menos de 1 minuto. Sem cartão de crédito, sem burocracia." },
                { num: "02", titulo: "Escolha sua prova e matérias",     desc: "Diga para o TeraEdu qual é o seu objetivo — ENEM, FUVEST, UNICAMP — e quais matérias quer focar." },
                { num: "03", titulo: "A IA monta seu plano",             desc: "Com base na sua prova e disponibilidade, a IA cria um cronograma de estudos personalizado para você." },
                { num: "04", titulo: "Estude com as ferramentas certas", desc: "Use questões, flashcards, resumos e a tutora de IA para absorver o conteúdo de forma eficiente." },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-8 py-10 border-b border-border last:border-0 group"
                  initial={{ opacity: 0, x: -32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-[5rem] lg:text-[7rem] font-black leading-none text-text-faint group-hover:text-brand/30 transition-colors duration-500 tabular-nums w-28 lg:w-36 flex-shrink-0">
                    {p.num}
                  </span>
                  <div className="pt-3 lg:pt-5">
                    <h3 className="text-text font-bold text-xl mb-3">{p.titulo}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sticky pencil */}
            <div className="hidden lg:flex items-center justify-center sticky top-32">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute inset-0 bg-brand/10 blur-[80px] rounded-full" />
                <Image src="/pencil png render.png" alt="" width={320} height={320} className="relative z-10 drop-shadow-2xl w-full" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section id="depoimentos" className="py-28 px-6 lg:px-10 border-t border-border overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <motion.p className="text-brand text-xs tracking-widest uppercase mb-4" {...inView()}>Depoimentos</motion.p>
            <h2 className="text-[clamp(2.2rem,5vw,5rem)] font-black leading-[0.88] tracking-tight">
              <motion.span className="block text-text-muted font-extralight" {...inView(0.08)}>O que os</motion.span>
              <motion.span className="block text-text" {...inView(0.16)}>alunos dizem.</motion.span>
            </h2>
          </div>

          {/* Leque de cards */}
          <div className="hidden md:flex justify-center items-center px-10" style={{ perspective: 1400 }}>
            {[
              { nome: "Sarah Costa",   papel: "Aprovada em Medicina",     info: "FUVEST 2024",   texto: "O TeraEdu mudou minha forma de estudar. A IA tutora me salvou em Química Orgânica, explicava de um jeito que eu finalmente entendia.", tag: "Medicina" },
              { nome: "Miguel Chen",   papel: "Aprovado em Engenharia",   info: "ITA 2024",       texto: "Os flashcards automáticos são incríveis. Nunca conseguia manter consistência na revisão, mas com repetição espaçada ficou fácil.", tag: "Engenharia" },
              { nome: "Emília Alves",  papel: "Aprovada em Direito",      info: "USP 2024",       texto: "O banco de questões é enorme e bem organizado. Fiz mais de 500 questões de Português e minha nota no ENEM subiu 80 pontos.", tag: "Direito" },
              { nome: "David Rocha",   papel: "Aprovado em Computação",   info: "UNICAMP 2024",   texto: "Os resumos gerados pela IA economizaram semanas de estudo. O plano de estudos me manteve consistente até a prova.", tag: "Computação" },
              { nome: "Jéssica Nunes", papel: "Aprovada em Psicologia",   info: "UFMG 2024",      texto: "O plano de estudos personalizado me ajudou a organizar minha rotina caótica entre escola, cursinho e vida pessoal.", tag: "Psicologia" },
            ].map((d, i, arr) => {
              const centro  = (arr.length - 1) / 2
              const offset  = i - centro
              const rotate  = offset * 7
              const dy      = Math.abs(offset) * 20
              const scaleAt = 1 - Math.abs(offset) * 0.06
              const zBase   = 10 - Math.abs(offset)

              return (
                <motion.div
                  key={d.nome}
                  className="relative w-64 flex-shrink-0 bg-bg-card border border-border rounded-3xl p-6 cursor-default shadow-sm"
                  style={{ marginLeft: i === 0 ? 0 : -36, zIndex: zBase, transformOrigin: 'bottom center' }}
                  initial={{ opacity: 0, y: 60, rotate: 0 }}
                  whileInView={{ opacity: 1, y: dy, rotate }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{
                    y: dy - 36,
                    rotate: 0,
                    scale: 1.08,
                    zIndex: 50,
                    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                  }}
                  animate={{ scale: scaleAt }}
                >
                  {/* glow ao redor no hover */}
                  <motion.div
                    className="pointer-events-none absolute -inset-px rounded-3xl opacity-0"
                    style={{ background: 'radial-gradient(120% 120% at 50% 0%, rgba(249,115,22,0.25), transparent 60%)' }}
                    whileHover={{ opacity: 1 }}
                  />
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-3xl shadow-2xl opacity-0"
                    style={{ boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5)' }}
                    whileHover={{ opacity: 1 }}
                  />

                  <div className="relative z-10 flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-bold text-xs flex-shrink-0">
                      {d.nome[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-text text-sm font-semibold leading-tight truncate">{d.nome}</p>
                      <p className="text-text-faint text-[11px] leading-tight truncate">{d.papel}</p>
                    </div>
                  </div>

                  <p className="relative z-10 text-text-muted text-[13px] leading-relaxed mb-5">{d.texto}</p>

                  <p className="relative z-10 text-brand text-xs font-semibold">{d.tag}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Mobile: coluna simples */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {[
              { nome: "Sarah Costa",   papel: "Aprovada em Medicina — FUVEST 2024", texto: "O TeraEdu mudou minha forma de estudar. A IA tutora me salvou em Química Orgânica." },
              { nome: "Miguel Chen",   papel: "Aprovado em Engenharia — ITA 2024",  texto: "Os flashcards automáticos são incríveis. Nunca conseguia manter consistência na revisão." },
              { nome: "Emília Alves",  papel: "Aprovada em Direito — USP 2024",     texto: "O banco de questões é enorme e bem organizado. Minha nota no ENEM subiu 80 pontos." },
            ].map((d, i) => (
              <motion.div
                key={d.nome}
                className="bg-bg-card border border-border rounded-3xl p-6 flex flex-col gap-5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <p className="text-text text-sm leading-relaxed">&ldquo;{d.texto}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {d.nome[0]}
                  </div>
                  <div>
                    <p className="text-text text-sm font-semibold">{d.nome}</p>
                    <p className="text-text-faint text-xs mt-0.5">{d.papel}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-28 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="relative rounded-3xl border border-border bg-bg-card overflow-hidden p-12 lg:p-20 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <motion.p className="text-brand text-xs tracking-widest uppercase mb-6" {...inView()}>Comece hoje</motion.p>
              <h2 className="text-[clamp(2rem,5vw,5rem)] font-black leading-[0.88] tracking-tight mb-6">
                <motion.span className="block text-text-muted font-extralight" {...inView(0.08)}>Pronto para passar</motion.span>
                <motion.span className="block text-text" {...inView(0.16)}>na sua prova?</motion.span>
              </h2>
              <motion.p className="text-text-muted text-lg max-w-lg mx-auto mb-12" {...inView(0.24)}>
                Junte-se a milhares de estudantes que já estão usando o TeraEdu para estudar com inteligência.
              </motion.p>
              <motion.div {...inView(0.32)}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-10 py-4 rounded-full transition-all text-base hover:gap-3 hover:scale-[1.04] active:scale-[0.97]"
                >
                  Criar conta grátis agora <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div
                className="flex items-center justify-center gap-6 mt-8 text-text-faint text-xs flex-wrap"
                {...inView(0.4)}
              >
                <span className="flex items-center gap-1.5"><Check size={11} /> Grátis para começar</span>
                <span className="flex items-center gap-1.5"><Check size={11} /> Cancele quando quiser</span>
                <span className="flex items-center gap-1.5"><Check size={11} /> Sem cartão de crédito</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={22} height={22} />
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
