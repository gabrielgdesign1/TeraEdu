'use client'

import { useState } from 'react'
import { GraduationCap, BookOpen, Calendar, Target, ChevronRight, Check } from 'lucide-react'
import type { UserProfile } from '@/hooks/useProfile'

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
  '1° ano do Ensino Médio',
  '2° ano do Ensino Médio',
  '3° ano do Ensino Médio',
  'Cursinho / Pré-vestibular',
  'Já formado no EM',
]

const OBJETIVOS = [
  'Passar no vestibular esse ano',
  'Me preparar com antecedência',
  'Melhorar minhas notas na escola',
  'Aprender por conta própria',
]

type Step = 'universidade' | 'curso' | 'ano' | 'objetivo' | 'fim'

const STEPS: Step[] = ['universidade', 'curso', 'ano', 'objetivo', 'fim']

export function Onboarding({
  nome,
  onConcluir,
}: {
  nome: string | null
  onConcluir: (dados: Partial<UserProfile>) => Promise<void>
}) {
  const [step, setStep]             = useState<Step>('universidade')
  const [universidade, setUniv]     = useState('')
  const [univCustom, setUnivCustom] = useState('')
  const [curso, setCurso]           = useState('')
  const [cursoCustom, setCursoC]    = useState('')
  const [ano, setAno]               = useState('')
  const [objetivo, setObjetivo]     = useState('')
  const [salvando, setSalvando]     = useState(false)

  const stepIdx = STEPS.indexOf(step)
  const progresso = (stepIdx / (STEPS.length - 1)) * 100

  async function concluir() {
    setSalvando(true)
    await onConcluir({
      universidade: universidade === 'Outra federal' || universidade === 'Particular' || universidade === 'FUVEST (USP)'
        ? universidade
        : (univCustom || universidade),
      curso: curso === 'Outro' ? cursoCustom : curso,
      ano_escolar: ano,
      objetivo,
      onboarding_ok: true,
    })
    setSalvando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">

        {/* Barra de progresso */}
        <div className="h-1 bg-border">
          <div
            className="h-full bg-brand transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>

        <div className="p-8">

          {/* Saudação */}
          {step === 'universidade' && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">👋</span>
              <p className="text-text-muted text-sm">
                Olá{nome ? `, ${nome.split(' ')[0]}` : ''}! Vamos personalizar sua experiência.
              </p>
            </div>
          )}

          {/* ── Etapa 1: universidade ─────────────────────────────── */}
          {step === 'universidade' && (
            <>
              <h2 className="text-text text-xl font-bold mb-1 mt-3">Qual universidade você pretende?</h2>
              <p className="text-text-muted text-sm mb-6">Você pode mudar isso depois nas configurações.</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {UNIVERSIDADES.map(u => (
                  <button
                    key={u}
                    onClick={() => { setUniv(u); setUnivCustom('') }}
                    className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                      universidade === u
                        ? 'bg-brand text-white border-brand font-medium'
                        : 'border-border text-text-muted hover:border-brand hover:text-text bg-bg'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              {!universidade && (
                <input
                  placeholder="Ou escreva outra..."
                  value={univCustom}
                  onChange={e => { setUnivCustom(e.target.value); setUniv('') }}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors"
                />
              )}
              <button
                onClick={() => setStep('curso')}
                disabled={!universidade && !univCustom.trim()}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-40 text-white font-semibold py-3 rounded-full text-sm transition-colors"
              >
                Continuar <ChevronRight size={15} />
              </button>
            </>
          )}

          {/* ── Etapa 2: curso ───────────────────────────────────── */}
          {step === 'curso' && (
            <>
              <div className="flex items-center gap-2 mb-1 mt-1">
                <BookOpen size={18} className="text-brand" />
                <h2 className="text-text text-xl font-bold">Qual curso você quer fazer?</h2>
              </div>
              <p className="text-text-muted text-sm mb-6">Vamos focar o conteúdo no que importa pra você.</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {CURSOS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCurso(c); setCursoC('') }}
                    className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                      curso === c
                        ? 'bg-brand text-white border-brand font-medium'
                        : 'border-border text-text-muted hover:border-brand hover:text-text bg-bg'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {curso === 'Outro' && (
                <input
                  placeholder="Qual curso?"
                  value={cursoCustom}
                  onChange={e => setCursoC(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-brand transition-colors"
                />
              )}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('universidade')} className="px-5 py-3 rounded-full border border-border text-text-muted hover:text-text text-sm transition-colors">
                  ← Voltar
                </button>
                <button
                  onClick={() => setStep('ano')}
                  disabled={!curso || (curso === 'Outro' && !cursoCustom.trim())}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-40 text-white font-semibold py-3 rounded-full text-sm transition-colors"
                >
                  Continuar <ChevronRight size={15} />
                </button>
              </div>
            </>
          )}

          {/* ── Etapa 3: ano ─────────────────────────────────────── */}
          {step === 'ano' && (
            <>
              <div className="flex items-center gap-2 mb-1 mt-1">
                <Calendar size={18} className="text-brand" />
                <h2 className="text-text text-xl font-bold">Em que etapa você está?</h2>
              </div>
              <p className="text-text-muted text-sm mb-6">Isso ajuda a calibrar o ritmo do conteúdo.</p>
              <div className="flex flex-col gap-2 mb-4">
                {ANOS.map(a => (
                  <button
                    key={a}
                    onClick={() => setAno(a)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      ano === a
                        ? 'bg-brand text-white border-brand font-medium'
                        : 'border-border text-text-muted hover:border-brand hover:text-text bg-bg'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      ano === a ? 'border-white' : 'border-border'
                    }`}>
                      {ano === a && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    {a}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('curso')} className="px-5 py-3 rounded-full border border-border text-text-muted hover:text-text text-sm transition-colors">
                  ← Voltar
                </button>
                <button
                  onClick={() => setStep('objetivo')}
                  disabled={!ano}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-40 text-white font-semibold py-3 rounded-full text-sm transition-colors"
                >
                  Continuar <ChevronRight size={15} />
                </button>
              </div>
            </>
          )}

          {/* ── Etapa 4: objetivo ────────────────────────────────── */}
          {step === 'objetivo' && (
            <>
              <div className="flex items-center gap-2 mb-1 mt-1">
                <Target size={18} className="text-brand" />
                <h2 className="text-text text-xl font-bold">Qual é seu principal objetivo?</h2>
              </div>
              <p className="text-text-muted text-sm mb-6">Prometemos não te julgar. 😄</p>
              <div className="flex flex-col gap-2 mb-4">
                {OBJETIVOS.map(o => (
                  <button
                    key={o}
                    onClick={() => setObjetivo(o)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      objetivo === o
                        ? 'bg-brand text-white border-brand font-medium'
                        : 'border-border text-text-muted hover:border-brand hover:text-text bg-bg'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      objetivo === o ? 'border-white' : 'border-border'
                    }`}>
                      {objetivo === o && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    {o}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('ano')} className="px-5 py-3 rounded-full border border-border text-text-muted hover:text-text text-sm transition-colors">
                  ← Voltar
                </button>
                <button
                  onClick={concluir}
                  disabled={!objetivo || salvando}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-40 text-white font-semibold py-3 rounded-full text-sm transition-colors"
                >
                  {salvando
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
                    : <><Check size={15} /> Tudo certo!</>
                  }
                </button>
              </div>
            </>
          )}

          {/* Indicador de etapas */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {(['universidade', 'curso', 'ano', 'objetivo'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  STEPS.indexOf(step) > i
                    ? 'w-4 bg-brand'
                    : STEPS.indexOf(step) === i
                    ? 'w-6 bg-brand'
                    : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
