'use client'

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import {
  motion, useScroll, useSpring, useTransform,
  useMotionValue, useMotionTemplate,
} from "framer-motion"
import {
  Sun, Moon, MessageCircle, FileQuestion, Layers,
  FileText, BarChart3, Calendar, Check, ArrowRight,
  Target, Brain, Trophy, Zap, BookOpen, LayoutDashboard,
  GraduationCap, Flame, ChevronDown,
} from "lucide-react"

/* ═══════════════════════════ helpers ═══════════════════════════ */

const EASE = [0.22, 1, 0.36, 1] as const

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, delay, ease: EASE },
})

/* Título com reveal por linha (máscara) */
function LineReveal({ lines, delay = 0, className = '' }: {
  lines: { text: string; className?: string }[]
  delay?: number
  className?: string
}) {
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`block ${l.className ?? ''}`}
            initial={{ y: '110%', rotate: 2 }}
            whileInView={{ y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.85, delay: delay + i * 0.09, ease: EASE }}
          >
            {l.text}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/* Botão magnético — atrai levemente na direção do cursor */
function Magnetic({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 })

  return (
    <motion.div
      ref={ref}
      className="inline-block"
      style={{ x, y }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.div>
  )
}

/* Card com tilt 3D + glow radial que segue o cursor */
function TiltCard({ children, className = '', tilt = 7, glow = true }: {
  children: React.ReactNode; className?: string; tilt?: number; glow?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 })
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glowBg = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, var(--brand-glow, rgba(249,115,22,0.10)), transparent 65%)`

  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        ref={ref}
        className="relative h-full w-full will-change-transform"
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        onMouseMove={(e) => {
          const r = ref.current!.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width
          const py = (e.clientY - r.top) / r.height
          ry.set((px - 0.5) * tilt * 2)
          rx.set((0.5 - py) * tilt * 2)
          gx.set(px * 100)
          gy.set(py * 100)
        }}
        onMouseLeave={() => { rx.set(0); ry.set(0) }}
      >
        {glow && (
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-[inherit] z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [.group:hover_&]:opacity-100"
            style={{ background: glowBg, borderRadius: 'inherit' }}
          />
        )}
        {children}
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════ dados ═══════════════════════════ */

const CAROUSEL = [
  { icon: FileQuestion, label: "Banco de Questões",    desc: "ENEM + principais vestibulares" },
  { icon: MessageCircle,label: "IA Tutora",            desc: "Dúvidas respondidas em segundos" },
  { icon: FileText,     label: "Resumos Automáticos",  desc: "Qualquer tema em instantes" },
  { icon: Layers,       label: "Flashcards com IA",    desc: "Revisão espaçada inteligente" },
  { icon: Calendar,     label: "Plano de Estudos",     desc: "Cronograma personalizado" },
  { icon: BarChart3,    label: "Painel de Desempenho", desc: "Evolução por matéria" },
  { icon: Target,       label: "Vestibulares",         desc: "FUVEST, UNICAMP, UNESP e mais" },
  { icon: Brain,        label: "IA Adaptativa",        desc: "Aprende com seu ritmo" },
  { icon: Trophy,       label: "Conquistas",           desc: "Gamificação do estudo" },
  { icon: Zap,          label: "+2.000 Questões",      desc: "Sempre atualizadas" },
  { icon: BookOpen,     label: "Conteúdo Completo",    desc: "Todas as matérias do EM" },
]
const DOUBLE = [...CAROUSEL, ...CAROUSEL]

const NAV_LINKS = [
  { name: 'Funcionalidades', url: '#features' },
  { name: 'Como funciona',   url: '#como-funciona' },
  { name: 'Depoimentos',     url: '#depoimentos' },
]

const DEPOIMENTOS = [
  { nome: "Sarah Costa",   papel: "Aprovada em Medicina",   texto: "O TeraEdu mudou minha forma de estudar. A IA tutora me salvou em Química Orgânica, explicava de um jeito que eu finalmente entendia.", tag: "Medicina" },
  { nome: "Miguel Chen",   papel: "Aprovado em Engenharia", texto: "Os flashcards automáticos são incríveis. Nunca conseguia manter consistência na revisão, mas com repetição espaçada ficou fácil.", tag: "Engenharia" },
  { nome: "Emília Alves",  papel: "Aprovada em Direito",    texto: "O banco de questões é enorme e bem organizado. Fiz mais de 500 questões de Português e minha nota no ENEM subiu 80 pontos.", tag: "Direito" },
  { nome: "David Rocha",   papel: "Aprovado em Computação", texto: "Os resumos gerados pela IA economizaram semanas de estudo. O plano de estudos me manteve consistente até a prova.", tag: "Computação" },
  { nome: "Jéssica Nunes", papel: "Aprovada em Psicologia", texto: "O plano de estudos personalizado me ajudou a organizar minha rotina caótica entre escola, cursinho e vida pessoal.", tag: "Psicologia" },
]

/* ═══════════════════ mini-UI (eco do app interno) ═══════════════════ */

function GlassPanel({ children, className = '', style }: {
  children?: React.ReactNode; className?: string; style?: React.CSSProperties
}) {
  return (
    <div
      className={`rounded-2xl border border-border/60 bg-bg-card/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

/* Cena 3D do hero: mini-dashboard que ecoa o app, inclinando com o mouse */
function HeroScene() {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useSpring(useMotionValue(-4), { stiffness: 60, damping: 16 })
  const ry = useSpring(useMotionValue(8),  { stiffness: 60, damping: 16 })

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const w = window.innerWidth, h = window.innerHeight
      ry.set(((e.clientX / w) - 0.5) * 16 + 6)
      rx.set((0.5 - (e.clientY / h)) * 12 - 3)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [rx, ry])

  return (
    <div ref={ref} className="relative" style={{ perspective: 1600 }}>
      <motion.div
        className="relative will-change-transform"
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
      >
        {/* glow de fundo */}
        <div className="absolute -inset-16 bg-brand/15 blur-[110px] rounded-full pointer-events-none" style={{ transform: 'translateZ(-80px)' }} />

        {/* painel principal — mini dashboard */}
        <GlassPanel className="relative w-[420px] max-w-full p-0 overflow-hidden !rounded-3xl" style={{ transform: 'translateZ(0px)' }}>
          <div className="flex">
            {/* mini sidebar glass — eco da sidebar do app */}
            <div className="w-14 border-r border-border/50 py-4 flex flex-col items-center gap-1 bg-bg/40">
              <Image src="/TeraEdu-logo-orange.png" alt="" width={20} height={20} className="mb-3" />
              {[LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle, GraduationCap].map((Icon, i) => (
                <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-brand/15 text-brand' : 'text-text-faint'}`}>
                  <Icon size={14} />
                </div>
              ))}
              <div className="mt-auto w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-[10px] font-bold">A</div>
            </div>

            {/* conteúdo */}
            <div className="flex-1 p-5">
              <p className="text-text-faint text-[10px] mb-0.5">Boa noite</p>
              <p className="text-text font-bold text-lg leading-tight mb-4">Ana 👋</p>

              <div className="flex gap-1.5 mb-4">
                {['Questões', 'Flashcards', 'Resumos'].map((t, i) => (
                  <span key={t} className={`text-[9px] font-medium px-2.5 py-1 rounded-full ${i === 0 ? 'bg-brand text-white' : 'bg-bg-hover text-text-muted'}`}>{t}</span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-xl border border-border/60 p-3">
                  <p className="text-text-faint text-[9px] mb-1">Questões resolvidas</p>
                  <p className="text-text font-bold text-xl leading-none">128</p>
                  <p className="text-brand text-[9px] mt-1 font-medium">+12 essa semana</p>
                </div>
                <div className="rounded-xl border border-border/60 p-3">
                  <p className="text-text-faint text-[9px] mb-1">Sequência atual</p>
                  <p className="text-text font-bold text-xl leading-none flex items-center gap-1">7 <Flame size={13} className="text-brand" /></p>
                  <p className="text-brand text-[9px] mt-1 font-medium">Continue assim!</p>
                </div>
              </div>

              {[
                { m: 'Matemática', p: 72 },
                { m: 'Química',    p: 45 },
                { m: 'História',   p: 88 },
              ].map((b, i) => (
                <div key={b.m} className="mb-2.5 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-text text-[10px] font-medium">{b.m}</span>
                    <span className="text-text-faint text-[10px]">{b.p}%</span>
                  </div>
                  <div className="h-1 bg-bg-hover rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${b.p}%` }}
                      transition={{ duration: 1.2, delay: 1 + i * 0.15, ease: EASE }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        {/* chip flutuante — IA Tutora */}
        <motion.div
          className="absolute -right-16 -top-10 w-56"
          style={{ transform: 'translateZ(90px)' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <GlassPanel className="p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 bg-brand rounded-lg flex items-center justify-center"><MessageCircle size={11} className="text-white" /></div>
              <span className="text-text text-[11px] font-semibold">IA Tutora</span>
              <span className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="bg-bg-hover rounded-xl rounded-tr-sm px-3 py-2 text-[10px] text-text mb-2 ml-6">Como resolvo função do 2° grau?</div>
            <div className="border border-border/60 rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-text-muted mr-6">
              Vamos por partes! Primeiro identifique os coeficientes a, b e c…
            </div>
          </GlassPanel>
        </motion.div>

        {/* chip flutuante — flashcard */}
        <motion.div
          className="absolute -left-20 bottom-8 w-48"
          style={{ transform: 'translateZ(70px)' }}
          animate={{ y: [0, 9, 0], rotate: [-2, 1, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <GlassPanel className="p-4 text-center">
            <p className="text-text-faint text-[8px] uppercase tracking-widest mb-1.5">Flashcard · Biologia</p>
            <p className="text-text text-[11px] font-semibold leading-snug">O que é fotossíntese?</p>
            <p className="text-brand text-[9px] mt-2">Toque para revelar →</p>
          </GlassPanel>
        </motion.div>

        {/* chip flutuante — conquista */}
        <motion.div
          className="absolute -right-8 bottom-0"
          style={{ transform: 'translateZ(110px)' }}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <GlassPanel className="px-3.5 py-2.5 flex items-center gap-2">
            <Trophy size={13} className="text-brand" />
            <span className="text-text text-[10px] font-semibold whitespace-nowrap">+80 pts no ENEM</span>
          </GlassPanel>
        </motion.div>

        {/* capelo 3D flutuando acima */}
        <motion.div
          className="absolute -top-32 -left-24 w-44 pointer-events-none"
          style={{ transform: 'translateZ(140px)' }}
          animate={{ y: [0, -14, 0], rotate: [-6, 2, -6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/cap pngc render.png" alt="" width={280} height={280} className="w-full drop-shadow-2xl" priority />
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ═════════════════ mini-mocks das feature cards ═════════════════ */

function MockChat() {
  return (
    <div className="mt-auto space-y-2">
      <div className="bg-bg-hover rounded-xl rounded-tr-sm px-3 py-2 text-[11px] text-text w-fit ml-auto">Me explica mitose?</div>
      <div className="border border-border/60 rounded-xl rounded-tl-sm px-3 py-2 text-[11px] text-text-muted w-fit max-w-[85%]">
        Claro! Mitose é a divisão celular em que uma célula gera duas idênticas. Vamos ver as fases…
      </div>
      <div className="flex gap-1 pl-3 pt-0.5">
        {[0, 1, 2].map(i => (
          <motion.span key={i} className="w-1 h-1 bg-brand rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </div>
    </div>
  )
}

function MockQuestao() {
  return (
    <div className="mt-auto space-y-1.5">
      {['A', 'B', 'C'].map((l) => (
        <div key={l} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[10px] ${
          l === 'B' ? 'border-green-500/60 bg-green-500/10 text-text' : 'border-border/60 text-text-muted'
        }`}>
          <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-bold ${l === 'B' ? 'bg-green-500 text-white' : 'bg-bg-hover'}`}>{l}</span>
          {l === 'B' ? 'Alternativa correta ✓' : 'Alternativa'}
        </div>
      ))}
    </div>
  )
}

function MockFlashcard() {
  return (
    <div className="mt-auto" style={{ perspective: 500 }}>
      <motion.div
        className="relative h-20 w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: [0, 0, 180, 180, 360] }}
        transition={{ duration: 7, repeat: Infinity, times: [0, 0.4, 0.5, 0.9, 1], ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 rounded-xl border border-border/60 bg-bg-hover/50 flex items-center justify-center text-[11px] font-semibold text-text px-3 text-center" style={{ backfaceVisibility: 'hidden' }}>
          Capital da Revolução Francesa?
        </div>
        <div className="absolute inset-0 rounded-xl border border-brand/40 bg-brand/10 flex items-center justify-center text-[11px] font-semibold text-brand" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          Paris 🇫🇷
        </div>
      </motion.div>
    </div>
  )
}

function MockResumo() {
  return (
    <div className="mt-auto space-y-1.5">
      <div className="h-2 rounded bg-text/15 w-3/4" />
      <div className="h-2 rounded bg-text/10 w-full" />
      <div className="h-2 rounded bg-text/10 w-5/6" />
      <div className="h-2 rounded bg-brand/40 w-1/2" />
    </div>
  )
}

function MockChart() {
  const bars = [40, 65, 50, 85, 70, 95]
  return (
    <div className="mt-auto flex items-end gap-1.5 h-20">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className={`flex-1 rounded-t-md ${i === bars.length - 1 ? 'bg-brand' : 'bg-text/15'}`}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 + i * 0.07, ease: EASE }}
        />
      ))}
    </div>
  )
}

function MockPlano() {
  const dias = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const mats = ['Mat', 'Fís', 'Quí', 'His', 'Bio', 'Red', '—']
  return (
    <div className="mt-auto grid grid-cols-7 gap-1.5 w-full max-w-sm">
      {dias.map((d, i) => (
        <div key={i} className={`rounded-lg border px-1 py-2 text-center ${i === 2 ? 'border-brand/50 bg-brand/10' : 'border-border/60'}`}>
          <p className="text-text-faint text-[8px]">{d}</p>
          <p className={`text-[9px] font-semibold ${i === 2 ? 'text-brand' : 'text-text-muted'}`}>{mats[i]}</p>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════ página ═══════════════════════════ */

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeNav, setActiveNav] = useState('')

  useEffect(() => setMounted(true), [])

  /* progresso global de scroll */
  const { scrollYProgress } = useScroll()
  const progressScale = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })

  /* como funciona — trilho de progresso */
  const stepsRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: stepsProgress } = useScroll({ target: stepsRef, offset: ['start 0.75', 'end 0.45'] })
  const railScale = useSpring(stepsProgress, { stiffness: 90, damping: 22 })
  const pencilRotate = useTransform(stepsProgress, [0, 1], [-10, 12])
  const pencilY = useTransform(stepsProgress, [0, 1], [30, -30])

  return (
    <main className="min-h-screen bg-bg text-text overflow-x-hidden [--brand-glow:rgba(249,115,22,0.10)]">

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        .animate-marquee { animation: marquee 36s linear infinite }
        .animate-marquee:hover { animation-play-state: paused }
        @keyframes spin-slow { to { transform: translate(-50%,-50%) rotate(360deg) } }
        .hero-grid {
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%);
        }
      `}</style>

      {/* barra de progresso de leitura */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-brand z-[60] origin-left"
        style={{ scaleX: progressScale }}
      />

      {/* ── NAVBAR — pill de vidro flutuante (eco da sidebar do app) ── */}
      <motion.nav
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1080px,calc(100vw-24px))]"
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
      >
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-bg-card/75 backdrop-blur-2xl px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 pl-1">
            <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={24} height={24} />
            <span className="font-bold tracking-tight text-sm">TeraEdu</span>
          </Link>

          {/* tubelight */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => {
              const isActive = activeNav === item.name
              return (
                <a
                  key={item.name}
                  href={item.url}
                  onClick={() => setActiveNav(item.name)}
                  className="relative px-4 py-2 rounded-full text-[13px] font-medium transition-colors text-text-muted hover:text-text select-none"
                >
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="tubelight"
                      className="absolute inset-0 rounded-full bg-brand/8 -z-0"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    >
                      <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-7 h-[3px] bg-brand rounded-t-full">
                        <div className="absolute w-12 h-5 bg-brand/25 rounded-full blur-md -top-1.5 -left-2.5" />
                        <div className="absolute w-7 h-4 bg-brand/20 rounded-full blur-sm -top-1" />
                      </div>
                    </motion.div>
                  )}
                </a>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl hover:bg-bg-hover flex items-center justify-center text-text-muted hover:text-text transition-colors"
            >
              {mounted && theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Link href="/login" className="text-text-muted hover:text-text text-[13px] transition-colors hidden sm:block px-2">Entrar</Link>
            <Magnetic strength={0.25}>
              <Link
                href="/login"
                className="bg-brand hover:bg-brand-hover text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors inline-block"
              >
                Começar grátis
              </Link>
            </Magnetic>
          </div>
        </div>
      </motion.nav>

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden pt-36 pb-0 flex flex-col">

        {/* grid de fundo + orbes */}
        <div className="hero-grid absolute inset-0 opacity-60 pointer-events-none" />
        <motion.div
          className="absolute top-[8%] left-[12%] w-72 h-72 bg-brand/10 rounded-full blur-[100px] pointer-events-none"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[8%] w-96 h-96 bg-brand/8 rounded-full blur-[120px] pointer-events-none"
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full flex-1 grid lg:grid-cols-[46%_54%] items-center gap-12">

          {/* esquerda — texto */}
          <div className="relative z-20 py-14 lg:py-0">
            <motion.div
              className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-9 bg-bg-card/60 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand" />
              </span>
              <span className="text-text-muted text-xs tracking-widest uppercase">IA para o ENEM e vestibulares</span>
            </motion.div>

            <h1 className="text-[clamp(2.9rem,5.8vw,5.6rem)] font-black leading-[0.92] tracking-tight mb-9">
              <LineReveal
                delay={0.4}
                lines={[
                  { text: 'Estude mais',  className: 'text-text-muted font-extralight' },
                  { text: 'inteligente,', className: 'text-text' },
                  { text: 'não mais',     className: 'text-brand' },
                  { text: 'difícil.',     className: 'text-brand font-extralight italic' },
                ]}
              />
            </h1>

            <motion.p
              className="text-text-muted text-lg leading-relaxed max-w-[400px] mb-10"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
            >
              O TeraEdu usa inteligência artificial para criar resumos, flashcards, explicar conteúdos e gerar questões personalizadas para o seu ritmo de estudo.
            </motion.p>

            <motion.div
              className="flex items-center gap-5 flex-wrap mb-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.95, ease: EASE }}
            >
              <Magnetic>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-4 rounded-2xl transition-all text-sm shadow-[0_12px_32px_-8px_rgba(249,115,22,0.55)]"
                >
                  Criar conta grátis
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <a href="#como-funciona" className="text-text-muted hover:text-text text-sm flex items-center gap-1.5 transition-colors">
                Como funciona <ArrowRight size={12} />
              </a>
            </motion.div>

            <motion.p
              className="text-text-faint text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1.1 }}
            >
              Grátis para começar · Sem cartão de crédito
            </motion.p>
          </div>

          {/* direita — cena 3D */}
          <div className="hidden lg:flex items-center justify-center relative z-10 pr-6">
            <HeroScene />
          </div>
        </div>

        {/* indicador de scroll */}
        <motion.div
          className="relative z-20 flex justify-center pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={18} className="text-text-faint" />
          </motion.div>
        </motion.div>

        {/* ── carrossel de features ── */}
        <div className="relative z-20 border-t border-border bg-bg/60 backdrop-blur-md overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-bg to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-bg to-transparent" />
          <div className="animate-marquee flex">
            {DOUBLE.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-8 py-5 border-r border-border/50 flex-shrink-0 group">
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

      {/* ══════════════════════ FEATURES — bento 3D ══════════════════════ */}
      <section id="features" className="py-28 px-6 lg:px-10 border-t border-border relative">
        <div className="max-w-7xl mx-auto">

          <div className="relative mb-16 lg:mb-20">
            <motion.p className="text-brand text-xs tracking-widest uppercase mb-5" {...inView()}>Funcionalidades</motion.p>
            <h2 className="text-[clamp(2.2rem,5vw,5.2rem)] font-black leading-[0.9] tracking-tight relative z-[5]">
              <LineReveal lines={[
                { text: 'Tudo que você',       className: 'text-text-muted font-extralight' },
                { text: 'precisa para passar.', className: 'text-text' },
              ]} />
            </h2>

            <motion.div
              className="absolute right-0 top-[-30px] z-[15] pointer-events-none w-[150px] md:w-[210px] lg:w-[250px]"
              initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <div className="absolute inset-0 bg-brand/10 blur-[60px] rounded-full" />
              <motion.div animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
                <Image src="/atom png render.png" alt="" width={260} height={260} className="relative z-10 w-full drop-shadow-2xl" />
              </motion.div>
            </motion.div>

            <motion.p className="text-text-muted max-w-sm mt-6 text-sm leading-relaxed relative z-[5]" {...inView(0.24)}>
              Ferramentas com IA pensadas para o estudante brasileiro conquistar sua vaga.
            </motion.p>
          </div>

          {/* bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 [grid-auto-rows:minmax(240px,auto)]">
            {[
              { icon: MessageCircle, titulo: "IA Tutora",            tag: "Chat",      span: "md:col-span-4", mock: <MockChat />,
                desc: "Tire dúvidas sobre qualquer conteúdo do ensino médio em tempo real, com explicações claras e exemplos práticos." },
              { icon: FileQuestion,  titulo: "Banco de Questões",    tag: "Questões",  span: "md:col-span-2", mock: <MockQuestao />,
                desc: "Questões do ENEM, FUVEST, UNICAMP e outros vestibulares, organizadas por matéria e assunto." },
              { icon: Layers,        titulo: "Flashcards com IA",    tag: "Revisão",   span: "md:col-span-2", mock: <MockFlashcard />,
                desc: "A IA cria flashcards automaticamente a partir do conteúdo que você estuda, com revisão espaçada." },
              { icon: FileText,      titulo: "Resumos Automáticos",  tag: "Resumo",    span: "md:col-span-2", mock: <MockResumo />,
                desc: "Gere resumos completos de qualquer tema em segundos, ou envie seu material e deixe a IA resumir." },
              { icon: BarChart3,     titulo: "Painel de Desempenho", tag: "Analytics", span: "md:col-span-2", mock: <MockChart />,
                desc: "Acompanhe seu progresso por matéria, veja pontos fracos e receba sugestões personalizadas." },
              { icon: Calendar,      titulo: "Plano de Estudos",     tag: "Plano",     span: "md:col-span-6", mock: <MockPlano />,
                desc: "A IA monta um cronograma personalizado com base na sua prova, tempo disponível e pontos de reforço — e reagenda quando a vida acontece." },
            ].map((f, i) => (
              <motion.div
                key={f.titulo}
                className={`group ${f.span}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: EASE }}
              >
                <TiltCard className="h-full" tilt={5}>
                  <div className="relative h-full flex flex-col bg-bg-card border border-border rounded-3xl p-7 overflow-hidden transition-colors duration-300 group-hover:border-brand/50">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-11 h-11 bg-brand-soft rounded-2xl flex items-center justify-center group-hover:bg-brand/20 transition-colors" style={{ transform: 'translateZ(30px)' }}>
                        <f.icon size={18} className="text-brand" />
                      </div>
                      <span className="text-text-faint text-xs tracking-widest uppercase border border-border rounded-full px-3 py-1">{f.tag}</span>
                    </div>
                    <h3 className="text-text font-bold text-lg mb-2" style={{ transform: 'translateZ(20px)' }}>{f.titulo}</h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-6">{f.desc}</p>
                    {f.mock}
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ COMO FUNCIONA ══════════════════════ */}
      <section id="como-funciona" className="py-28 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">

          <motion.p className="text-brand text-xs tracking-widest uppercase mb-5" {...inView()}>Como funciona</motion.p>
          <h2 className="text-[clamp(2.2rem,5vw,5.2rem)] font-black leading-[0.9] tracking-tight mb-20">
            <LineReveal lines={[
              { text: 'Simples,',            className: 'text-text-muted font-extralight' },
              { text: 'rápido e eficiente.', className: 'text-text' },
            ]} />
          </h2>

          <div className="grid lg:grid-cols-[1fr_360px] gap-16 items-start">
            {/* trilho + passos */}
            <div ref={stepsRef} className="relative pl-8 lg:pl-12">
              {/* trilho */}
              <div className="absolute left-0 top-6 bottom-6 w-px bg-border">
                <motion.div className="absolute inset-x-0 top-0 bg-brand origin-top w-full h-full" style={{ scaleY: railScale }} />
              </div>

              {[
                { num: "01", titulo: "Crie sua conta grátis",            desc: "Cadastre-se em menos de 1 minuto. Sem cartão de crédito, sem burocracia." },
                { num: "02", titulo: "Escolha sua prova e matérias",     desc: "Diga para o TeraEdu qual é o seu objetivo — ENEM, FUVEST, UNICAMP — e quais matérias quer focar." },
                { num: "03", titulo: "A IA monta seu plano",             desc: "Com base na sua prova e disponibilidade, a IA cria um cronograma de estudos personalizado para você." },
                { num: "04", titulo: "Estude com as ferramentas certas", desc: "Use questões, flashcards, resumos e a tutora de IA para absorver o conteúdo de forma eficiente." },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  className="relative flex items-start gap-6 lg:gap-10 py-9 border-b border-border last:border-0 group"
                  initial={{ opacity: 0, x: -32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                >
                  {/* nó no trilho */}
                  <div className="absolute -left-8 lg:-left-12 top-12 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-brand bg-bg group-hover:bg-brand transition-colors" />

                  <span className="text-[4.5rem] lg:text-[6.5rem] font-black leading-none text-text-faint group-hover:text-brand/30 transition-colors duration-500 tabular-nums w-24 lg:w-32 flex-shrink-0">
                    {p.num}
                  </span>
                  <div className="pt-2 lg:pt-4">
                    <h3 className="text-text font-bold text-xl mb-3">{p.titulo}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* lápis 3D dirigido pelo scroll */}
            <div className="hidden lg:flex items-center justify-center sticky top-40">
              <motion.div className="relative" style={{ rotate: pencilRotate, y: pencilY }}>
                <div className="absolute inset-0 bg-brand/10 blur-[80px] rounded-full" />
                <Image src="/pencil png render.png" alt="" width={320} height={320} className="relative z-10 drop-shadow-2xl w-full" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ DEPOIMENTOS ══════════════════════ */}
      <section id="depoimentos" className="py-28 px-6 lg:px-10 border-t border-border overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <motion.p className="text-brand text-xs tracking-widest uppercase mb-4" {...inView()}>Depoimentos</motion.p>
            <h2 className="text-[clamp(2.2rem,5vw,5rem)] font-black leading-[0.9] tracking-tight">
              <LineReveal lines={[
                { text: 'O que os',      className: 'text-text-muted font-extralight' },
                { text: 'alunos dizem.', className: 'text-text' },
              ]} />
            </h2>
          </div>

          {/* leque de cards */}
          <div className="hidden md:flex justify-center items-center px-10" style={{ perspective: 1400 }}>
            {DEPOIMENTOS.map((d, i, arr) => {
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
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                  whileHover={{
                    y: dy - 36, rotate: 0, scale: 1.08, zIndex: 50,
                    transition: { duration: 0.35, ease: EASE },
                  }}
                  animate={{ scale: scaleAt }}
                >
                  <motion.div
                    className="pointer-events-none absolute -inset-px rounded-3xl opacity-0"
                    style={{ background: 'radial-gradient(120% 120% at 50% 0%, rgba(249,115,22,0.25), transparent 60%)' }}
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

          {/* mobile */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {DEPOIMENTOS.slice(0, 3).map((d, i) => (
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

      {/* ══════════════════════ CTA FINAL ══════════════════════ */}
      <section className="py-28 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="relative rounded-[2rem] overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {/* borda cônica animada */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
              <div
                className="absolute left-1/2 top-1/2 h-[250%] w-[250%] -translate-x-1/2 -translate-y-1/2"
                style={{
                  background: 'conic-gradient(rgba(249,115,22,0) 0deg, rgba(249,115,22,0.9) 40deg, rgba(249,115,22,0) 110deg)',
                  animation: 'spin-slow 7s linear infinite',
                }}
              />
            </div>

            <div className="relative m-[1.5px] rounded-[calc(2rem-1.5px)] bg-bg-card overflow-hidden p-12 lg:p-24 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />

              {/* capelo flutuando */}
              <motion.div
                className="absolute -left-8 bottom-[-40px] w-52 opacity-90 pointer-events-none hidden lg:block"
                animate={{ y: [0, -16, 0], rotate: [-8, 0, -8] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image src="/cap pngc render.png" alt="" width={280} height={280} className="w-full drop-shadow-2xl" />
              </motion.div>
              {/* átomo flutuando */}
              <motion.div
                className="absolute -right-6 top-[-30px] w-44 opacity-90 pointer-events-none hidden lg:block"
                animate={{ y: [0, 14, 0], rotate: [6, -4, 6] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image src="/atom png render.png" alt="" width={240} height={240} className="w-full drop-shadow-2xl" />
              </motion.div>

              <div className="relative z-10">
                <motion.p className="text-brand text-xs tracking-widest uppercase mb-6" {...inView()}>Comece hoje</motion.p>
                <h2 className="text-[clamp(2rem,5vw,5rem)] font-black leading-[0.9] tracking-tight mb-6">
                  <LineReveal lines={[
                    { text: 'Pronto para passar', className: 'text-text-muted font-extralight' },
                    { text: 'na sua prova?',      className: 'text-text' },
                  ]} />
                </h2>
                <motion.p className="text-text-muted text-lg max-w-lg mx-auto mb-12" {...inView(0.24)}>
                  Junte-se a milhares de estudantes que já estão usando o TeraEdu para estudar com inteligência.
                </motion.p>
                <motion.div {...inView(0.32)}>
                  <Magnetic>
                    <Link
                      href="/login"
                      className="group inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-10 py-4 rounded-2xl transition-all text-base shadow-[0_16px_40px_-10px_rgba(249,115,22,0.6)]"
                    >
                      Criar conta grátis agora
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Magnetic>
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="py-10 px-6 lg:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={22} height={22} />
            <span className="font-semibold tracking-tight">TeraEdu</span>
          </div>
          <p className="text-text-faint text-xs">© 2026 TeraEdu · Todos os direitos reservados</p>
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
