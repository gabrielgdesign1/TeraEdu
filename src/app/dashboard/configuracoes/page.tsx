'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { Save, LogOut, User, GraduationCap, Target } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { DashboardSidebar } from "@/components/DashboardSidebar"
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

  return (
    <div className="min-h-screen bg-bg flex">
      <DashboardSidebar />

      {/* Main */}
      <main className="flex-1 ml-20 px-10 py-10 max-w-3xl">
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

