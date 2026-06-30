'use client'

import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle,
  BarChart3, Calendar, Sun, Moon, Settings, Save, LogOut, User, GraduationCap, Target
} from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const UNIVERSIDADES = [
  'USP', 'UNICAMP', 'UNESP', 'ITA', 'IME', 'FUVEST (USP)',
  'UERJ', 'UFMG', 'UFRJ', 'UnB', 'UFPR', 'Outra federal', 'Particular',
]
const CURSOS = [
  'Medicina', 'Engenharia', 'Direito', 'Administração', 'Psicologia',
  'Arquitetura', 'Computação / TI', 'Biologia', 'Física', 'Matemática',
  'Química', 'Letras / Jornalismo', 'Economia', 'Outro',
]
const ANOS = [
  '1° ano do Ensino Médio', '2° ano do Ensino Médio', '3° ano do Ensino Médio',
  'Cursinho / Pré-vestibular', 'Já formado no EM',
]
const OBJETIVOS = [
  'Passar no vestibular esse ano',
  'Me preparar com antecedência',
  'Melhorar minhas notas na escola',
  'Aprender por conta própria',
]

export default function Configuracoes() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { profile, loading, salvarProfile } = useProfile()
  const router = useRouter()

  const [nome,        setNome       ] = useState('')
  const [universidade,setUniv       ] = useState('')
  const [curso,       setCurso      ] = useState('')
  const [ano,         setAno        ] = useState('')
  const [objetivo,    setObjetivo   ] = useState('')
  const [salvando,    setSalvando   ] = useState(false)
  const [salvo,       setSalvo      ] = useState(false)

  useEffect(() => {
    if (profile) {
      setNome(profile.nome ?? '')
      setUniv(profile.universidade ?? '')
      setCurso(profile.curso ?? '')
      setAno(profile.ano_escolar ?? '')
      setObjetivo(profile.objetivo ?? '')
    }
  }, [profile])

  async function salvar() {
    setSalvando(true)
    await salvarProfile({ nome, universidade, curso, ano_escolar: ano, objetivo })
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const primeiroNome = profile?.nome?.split(' ')[0] ?? null

  return (
    <div className="min-h-screen bg-bg flex">

      {/* Sidebar */}
      <aside className="w-64 bg-bg border-r border-border/60 flex flex-col fixed h-full">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <Image src="/TeraEdu-logo-orange.png" alt="TeraEdu" width={26} height={26} />
          <span className="text-text font-bold tracking-tight">TeraEdu</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 flex-1 pt-1">
          <SidebarLink href="/dashboard"                  icon={LayoutDashboard} label="Início" />
          <SidebarLink href="/dashboard/questoes"         icon={FileQuestion}    label="Questões" />
          <SidebarLink href="/dashboard/flashcards"       icon={Layers}          label="Flashcards" />
          <SidebarLink href="/dashboard/resumos"          icon={FileText}        label="Resumos" />
          <SidebarLink href="/dashboard/tutora"           icon={MessageCircle}   label="IA Tutora" />
          <SidebarLink href="/dashboard/vestibulares"    icon={GraduationCap}   label="Vestibulares" />
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
          <Link href="/dashboard/configuracoes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-bg-hover cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {primeiroNome ? primeiroNome[0].toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text text-sm font-semibold truncate">{profile?.nome ?? '...'}</p>
            </div>
            <Settings size={13} className="text-brand" />
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 px-10 py-10 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-text text-2xl font-bold tracking-tight mb-1">Configurações</h1>
          <p className="text-text-muted text-sm">Suas preferências e informações de perfil.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <div className="w-4 h-4 border-2 border-border border-t-brand rounded-full animate-spin" />
            Carregando...
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Informações pessoais */}
            <section className="bg-bg-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <User size={16} className="text-brand" />
                <h2 className="text-text font-semibold">Informações pessoais</h2>
              </div>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Nome completo</span>
                  <input
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors"
                  />
                </label>
              </div>
            </section>

            {/* Objetivo vestibular */}
            <section className="bg-bg-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap size={16} className="text-brand" />
                <h2 className="text-text font-semibold">Objetivo vestibular</h2>
              </div>
              <div className="flex flex-col gap-5">

                <label className="flex flex-col gap-2">
                  <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Universidade alvo</span>
                  <div className="flex flex-wrap gap-2">
                    {UNIVERSIDADES.map(u => (
                      <button
                        key={u}
                        onClick={() => setUniv(universidade === u ? '' : u)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          universidade === u
                            ? 'bg-brand text-white border-brand'
                            : 'border-border text-text-muted hover:border-brand hover:text-text'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                  {!UNIVERSIDADES.includes(universidade) && (
                    <input
                      value={universidade}
                      onChange={e => setUniv(e.target.value)}
                      placeholder="Ou escreva outra..."
                      className="bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors mt-1"
                    />
                  )}
                  {!UNIVERSIDADES.includes(universidade) && universidade && (
                    <p className="text-brand text-xs">Personalizado: {universidade}</p>
                  )}
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Curso desejado</span>
                  <div className="flex flex-wrap gap-2">
                    {CURSOS.map(c => (
                      <button
                        key={c}
                        onClick={() => setCurso(curso === c ? '' : c)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          curso === c
                            ? 'bg-brand text-white border-brand'
                            : 'border-border text-text-muted hover:border-brand hover:text-text'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {(!CURSOS.includes(curso) || curso === 'Outro') && (
                    <input
                      value={CURSOS.includes(curso) ? '' : curso}
                      onChange={e => setCurso(e.target.value)}
                      placeholder="Ou escreva outro..."
                      className="bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors mt-1"
                    />
                  )}
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Etapa escolar</span>
                  <div className="flex flex-wrap gap-2">
                    {ANOS.map(a => (
                      <button
                        key={a}
                        onClick={() => setAno(ano === a ? '' : a)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          ano === a
                            ? 'bg-brand text-white border-brand'
                            : 'border-border text-text-muted hover:border-brand hover:text-text'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
            </section>

            {/* Objetivo */}
            <section className="bg-bg-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Target size={16} className="text-brand" />
                <h2 className="text-text font-semibold">Objetivo principal</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {OBJETIVOS.map(o => (
                  <button
                    key={o}
                    onClick={() => setObjetivo(objetivo === o ? '' : o)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      objetivo === o
                        ? 'bg-brand text-white border-brand'
                        : 'border-border text-text-muted hover:border-brand hover:text-text'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </section>

            {/* Botões */}
            <div className="flex items-center justify-between">
              <button
                onClick={sair}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-text-muted hover:text-red-500 hover:border-red-400 text-sm transition-colors"
              >
                <LogOut size={14} /> Sair da conta
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex items-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
              >
                {salvando
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
                  : salvo
                  ? <><span>✓</span> Salvo!</>
                  : <><Save size={14} /> Salvar alterações</>
                }
              </button>
            </div>

          </div>
        )}
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
