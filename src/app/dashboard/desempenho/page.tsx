'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Lock } from 'lucide-react'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { createClient } from '@/lib/supabase'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DesempenhoRow = {
  id: number
  data: string
  materia: string | null
  vestibular: string | null
  acertos: number
  total: number
}

type Activity = { tipo: string; criado_em: string }

type Stats = {
  questoes_total: number
  flashcards_total: number
  minutos_total: number
  sequencia_dias: number
  sequencia_maxima: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(a: number, t: number) {
  return t === 0 ? 0 : Math.round((a / t) * 100)
}

function corHex(p: number) {
  if (p >= 70) return '#22c55e'
  if (p >= 50) return '#f59e0b'
  return '#ef4444'
}

function corTexto(p: number) {
  if (p >= 70) return 'text-green-600 dark:text-green-400'
  if (p >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function corHeatmap(count: number) {
  if (count === 0) return 'bg-bg-hover'
  if (count === 1) return 'bg-brand/30'
  if (count <= 3) return 'bg-brand/60'
  return 'bg-brand'
}

function gerarSemanas(atividades: Map<string, number>) {
  const hoje = new Date()
  const inicio = new Date(hoje)
  inicio.setDate(inicio.getDate() - 363)
  const dow = inicio.getDay()
  inicio.setDate(inicio.getDate() - (dow === 0 ? 6 : dow - 1))

  const semanas: { date: string; count: number }[][] = []
  const cur = new Date(inicio)

  while (cur <= hoje) {
    const semana: { date: string; count: number }[] = []
    for (let d = 0; d < 7; d++) {
      const iso = cur.toISOString().slice(0, 10)
      semana.push({ date: iso, count: atividades.get(iso) ?? 0 })
      cur.setDate(cur.getDate() + 1)
    }
    semanas.push(semana)
  }
  return semanas
}

// ─── Gráfico de linha ─────────────────────────────────────────────────────────

function LineChart({ data }: { data: { label: string; valor: number }[] }) {
  if (data.length < 2) {
    return (
      <div className="h-36 flex items-center justify-center">
        <p className="text-text-faint text-sm text-center">
          Dados insuficientes — responda questões em semanas diferentes para ver sua evolução.
        </p>
      </div>
    )
  }

  const W = 560, H = 160
  const PL = 36, PR = 12, PT = 12, PB = 28
  const iW = W - PL - PR
  const iH = H - PT - PB

  const pts = data.map((d, i) => ({
    x: PL + (i / (data.length - 1)) * iW,
    y: PT + ((100 - d.valor) / 100) * iH,
    ...d,
  }))

  const line = pts.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  ).join(' ')

  const area = [
    `M ${pts[0].x.toFixed(1)} ${(PT + iH).toFixed(1)}`,
    ...pts.map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
    `L ${pts[pts.length - 1].x.toFixed(1)} ${(PT + iH).toFixed(1)} Z`,
  ].join(' ')

  // Mostra até 5 labels no eixo X
  const labelIndices = new Set<number>()
  labelIndices.add(0)
  labelIndices.add(pts.length - 1)
  if (pts.length > 4) {
    const mid = Math.floor(pts.length / 2)
    labelIndices.add(mid)
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Linhas de grade */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = PT + ((100 - v) / 100) * iH
        return (
          <g key={v}>
            <line x1={PL} y1={y} x2={PL + iW} y2={y} stroke="var(--border)" strokeWidth={0.5} />
            <text x={PL - 5} y={y + 4} textAnchor="end" fontSize={9} fill="var(--text-faint)">{v}%</text>
          </g>
        )
      })}
      {/* Área */}
      <path d={area} fill="var(--brand)" fillOpacity={0.12} />
      {/* Linha */}
      <path d={line} fill="none" stroke="var(--brand)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Pontos */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--brand)" />
      ))}
      {/* Labels do eixo X */}
      {pts.map((p, i) => labelIndices.has(i) && (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize={9} fill="var(--text-faint)">{p.label}</text>
      ))}
    </svg>
  )
}


// ─── Sub-componentes ──────────────────────────────────────────────────────────

function OverviewCard({ label, value, icon, corClasse }: {
  label: string; value: string; icon: string; corClasse?: string
}) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <p className="text-text-muted text-xs font-medium leading-snug">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${corClasse ?? 'text-text'}`}>{value}</p>
    </div>
  )
}

function EmptyState({ mensagem }: { mensagem: string }) {
  return (
    <div className="bg-bg-card border border-dashed border-border rounded-2xl p-8 text-center">
      <p className="text-text-muted text-sm">{mensagem}</p>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

const STATS_VAZIO: Stats = {
  questoes_total: 0, flashcards_total: 0,
  minutos_total: 0, sequencia_dias: 0, sequencia_maxima: 0,
}

export default function DesempenhoPage() {

  const [stats,      setStats     ] = useState<Stats>(STATS_VAZIO)
  const [desempenho, setDesempenho] = useState<DesempenhoRow[]>([])
  const [atividades, setAtividades ] = useState<Activity[]>([])
  const [loading,    setLoading   ] = useState(true)

  const carregar = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const anoAtras = new Date()
    anoAtras.setFullYear(anoAtras.getFullYear() - 1)

    const [{ data: s }, { data: d }, { data: a }] = await Promise.all([
      supabase
        .from('user_stats')
        .select('questoes_total, flashcards_total, minutos_total, sequencia_dias, sequencia_maxima')
        .eq('id', user.id)
        .single(),
      supabase
        .from('desempenho_questoes')
        .select('id, data, materia, vestibular, acertos, total')
        .eq('user_id', user.id)
        .order('data', { ascending: true }),
      supabase
        .from('user_activities')
        .select('tipo, criado_em')
        .eq('user_id', user.id)
        .gte('criado_em', anoAtras.toISOString()),
    ])

    if (s) setStats(s as Stats)
    setDesempenho((d ?? []) as DesempenhoRow[])
    setAtividades((a ?? []) as Activity[])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ── Computações ──────────────────────────────────────────────────────────────

  const porMateria = (() => {
    const m = new Map<string, { a: number; t: number }>()
    for (const r of desempenho) {
      if (!r.materia) continue
      const prev = m.get(r.materia) ?? { a: 0, t: 0 }
      m.set(r.materia, { a: prev.a + r.acertos, t: prev.t + r.total })
    }
    return Array.from(m.entries())
      .map(([mat, { a, t }]) => ({ mat, a, t, p: pct(a, t) }))
      .sort((x, y) => y.p - x.p)
  })()

  const porVestibular = (() => {
    const m = new Map<string, number>()
    for (const r of desempenho) {
      if (!r.vestibular) continue
      m.set(r.vestibular, (m.get(r.vestibular) ?? 0) + r.total)
    }
    return Array.from(m.entries())
      .map(([v, t]) => ({ v, t }))
      .sort((a, b) => b.t - a.t)
  })()

  const evolucaoSemanal = (() => {
    const m = new Map<string, { a: number; t: number }>()
    for (const r of desempenho) {
      const d = new Date(r.data + 'T00:00:00')
      const dow = d.getDay()
      const mon = new Date(d)
      mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
      const sem = mon.toISOString().slice(0, 10)
      const prev = m.get(sem) ?? { a: 0, t: 0 }
      m.set(sem, { a: prev.a + r.acertos, t: prev.t + r.total })
    }
    return Array.from(m.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sem, { a, t }]) => ({ label: sem.slice(5), valor: pct(a, t) }))
  })()

  const heatmapMap = (() => {
    const m = new Map<string, number>()
    for (const a of atividades) {
      const d = a.criado_em.slice(0, 10)
      m.set(d, (m.get(d) ?? 0) + 1)
    }
    return m
  })()

  const semanas = gerarSemanas(heatmapMap)

  const acertosTotal = desempenho.reduce((s, r) => s + r.acertos, 0)
  const totalTotal   = desempenho.reduce((s, r) => s + r.total,   0)
  const taxaAcerto   = pct(acertosTotal, totalTotal)
  const temDados     = desempenho.length > 0
  const horasEstudadas = (stats.minutos_total / 60).toFixed(1)

  const fortes   = porMateria.filter(m => m.t >= 5 && m.p >= 70)
  const fracos   = porMateria.filter(m => m.t >= 5 && m.p < 50)
  const maisFraco = porMateria.length
    ? [...porMateria].sort((a, b) => a.p - b.p)[0]
    : null

  const tiposCount = atividades.reduce((acc, a) => {
    acc[a.tipo] = (acc[a.tipo] ?? 0) + 1; return acc
  }, {} as Record<string, number>)

  const conquistas = [
    { id: 'first_quest', emoji: '🎯', titulo: 'Primeira questão',    desc: 'Respondeu a primeira questão',                ok: stats.questoes_total >= 1   },
    { id: 'q100',        emoji: '💯', titulo: '100 questões',         desc: 'Respondeu 100 questões no total',             ok: stats.questoes_total >= 100  },
    { id: 'q500',        emoji: '🚀', titulo: '500 questões',         desc: 'Respondeu 500 questões no total',             ok: stats.questoes_total >= 500  },
    { id: 'streak7',     emoji: '🔥', titulo: '7 dias seguidos',      desc: 'Manteve sequência de 7 dias',                 ok: stats.sequencia_maxima >= 7  },
    { id: 'streak30',    emoji: '⚡', titulo: '30 dias seguidos',     desc: 'Manteve sequência de 30 dias',                ok: stats.sequencia_maxima >= 30 },
    { id: 'flashcard',   emoji: '🃏', titulo: 'Primeiro deck',        desc: 'Completou o primeiro deck de flashcards',     ok: stats.flashcards_total >= 1  },
    { id: 'resumo',      emoji: '📄', titulo: 'Primeiro resumo',      desc: 'Gerou o primeiro resumo com IA',              ok: (tiposCount['resumo']  ?? 0) >= 1 },
    { id: 'tutora',      emoji: '🤖', titulo: 'IA Tutora',            desc: 'Primeira conversa com a IA Tutora',           ok: (tiposCount['tutora']  ?? 0) >= 1 },
    { id: 'acc80',       emoji: '🏆', titulo: 'Excelência',           desc: 'Taxa de acerto geral acima de 80%',           ok: taxaAcerto >= 80 && totalTotal >= 20 },
    { id: 'poly',        emoji: '📚', titulo: 'Generalista',          desc: 'Praticou questões em 5+ matérias',            ok: porMateria.length >= 5       },
    { id: 'h10',         emoji: '⏰', titulo: '10 horas estudadas',   desc: 'Mais de 10 horas de estudo registradas',      ok: stats.minutos_total >= 600   },
    { id: 'h24',         emoji: '🌙', titulo: '24 horas estudadas',   desc: 'Mais de 24 horas de estudo registradas',      ok: stats.minutos_total >= 1440  },
  ]

  const conquistadas = conquistas.filter(c => c.ok).length

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex app-atmosphere">

      <DashboardSidebar />

      {/* ── Main ── */}
      <main className="flex-1 ml-20 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-10 py-10 space-y-12">

          {/* Cabeçalho */}
          <div>
            <h1 className="text-text text-2xl font-bold tracking-tight mb-1">Desempenho</h1>
            <p className="text-text-muted text-sm">Acompanhe sua evolução e identifique oportunidades de melhoria.</p>
          </div>

          {/* ── 1. Visão geral ── */}
          <section>
            <h2 className="text-text font-semibold text-sm uppercase tracking-wider text-text-muted mb-4">Visão geral</h2>
            <div className="grid grid-cols-3 gap-4">
              <OverviewCard label="Questões respondidas" value={stats.questoes_total.toLocaleString('pt-BR')} icon="📝" />
              <OverviewCard label="Taxa de acerto" value={totalTotal > 0 ? `${taxaAcerto}%` : '—'} icon="🎯" corClasse={totalTotal > 0 ? corTexto(taxaAcerto) : 'text-text-faint'} />
              <OverviewCard label="Horas estudadas" value={`${horasEstudadas}h`} icon="⏱️" />
              <OverviewCard label="Sequência atual" value={`${stats.sequencia_dias} dia${stats.sequencia_dias !== 1 ? 's' : ''}`} icon="🔥" />
              <OverviewCard label="Recorde de sequência" value={`${stats.sequencia_maxima ?? 0} dia${(stats.sequencia_maxima ?? 0) !== 1 ? 's' : ''}`} icon="⚡" />
              <OverviewCard label="Flashcards estudados" value={stats.flashcards_total.toLocaleString('pt-BR')} icon="🃏" />
            </div>
          </section>

          {/* ── 2. Por matéria ── */}
          <section>
            <h2 className="text-text font-semibold text-sm uppercase tracking-wider text-text-muted mb-4">Desempenho por matéria</h2>
            {!temDados ? (
              <EmptyState mensagem="Responda questões para ver seu desempenho por matéria." />
            ) : porMateria.length === 0 ? (
              <EmptyState mensagem="Nenhum dado de matéria registrado ainda." />
            ) : (
              <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-5">
                {porMateria.map(({ mat, a, t, p }) => (
                  <div key={mat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-text text-sm font-medium">{mat}</span>
                      <span className={`text-sm font-bold ${corTexto(p)}`}>{p}%</span>
                    </div>
                    <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p}%`, backgroundColor: corHex(p) }} />
                    </div>
                    <p className="text-text-faint text-xs mt-1">{a} de {t} acerto{t !== 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── 3. Evolução ── */}
          <section>
            <h2 className="text-text font-semibold text-sm uppercase tracking-wider text-text-muted mb-4">Evolução semanal</h2>
            <div className="bg-bg-card border border-border rounded-2xl p-6">
              <p className="text-text-faint text-xs mb-5">Taxa de acerto por semana (%)</p>
              <LineChart data={evolucaoSemanal} />
            </div>
          </section>

          {/* ── 4. Heatmap ── */}
          <section>
            <h2 className="text-text font-semibold text-sm uppercase tracking-wider text-text-muted mb-4">Atividade nos últimos 12 meses</h2>
            <div className="bg-bg-card border border-border rounded-2xl p-6">
              <div className="flex gap-[3px] overflow-x-auto pb-1">
                {semanas.map((sem, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px] flex-shrink-0">
                    {sem.map((dia, di) => (
                      <div
                        key={di}
                        title={`${dia.date}: ${dia.count} atividade${dia.count !== 1 ? 's' : ''}`}
                        className={`w-[11px] h-[11px] rounded-sm ${corHeatmap(dia.count)}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-4">
                <span className="text-text-faint text-xs">Menos</span>
                {[0, 1, 2, 4].map(v => (
                  <div key={v} className={`w-[11px] h-[11px] rounded-sm ${corHeatmap(v)}`} />
                ))}
                <span className="text-text-faint text-xs">Mais</span>
                <span className="ml-auto text-text-faint text-xs">
                  {heatmapMap.size} dia{heatmapMap.size !== 1 ? 's' : ''} com atividade no último ano
                </span>
              </div>
            </div>
          </section>

          {/* ── 5. Por banca ── */}
          <section>
            <h2 className="text-text font-semibold text-sm uppercase tracking-wider text-text-muted mb-4">Questões por banca</h2>
            {!temDados || porVestibular.length === 0 ? (
              <EmptyState mensagem="Responda questões do banco para ver a distribuição por banca." />
            ) : (
              <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
                {porVestibular.map(({ v, t }) => {
                  const maxT = porVestibular[0].t
                  const w = Math.round((t / maxT) * 100)
                  return (
                    <div key={v}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-text text-sm font-medium">{v}</span>
                        <span className="text-text-muted text-sm tabular-nums">{t} questão{t !== 1 ? 'ões' : ''}</span>
                      </div>
                      <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full transition-all duration-700" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── 6. Fortes e fracos ── */}
          <section>
            <h2 className="text-text font-semibold text-sm uppercase tracking-wider text-text-muted mb-4">Pontos fortes e fracos</h2>
            {!temDados || porMateria.every(m => m.t < 5) ? (
              <EmptyState mensagem="Responda ao menos 5 questões de cada matéria para ver sua análise." />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={15} className="text-green-500" />
                    <h3 className="text-text font-semibold text-sm">Pontos fortes</h3>
                    <span className="text-text-faint text-xs ml-auto">≥ 70%</span>
                  </div>
                  {fortes.length === 0 ? (
                    <p className="text-text-faint text-sm">Nenhuma matéria acima de 70% ainda.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {fortes.map(({ mat, p }) => (
                        <li key={mat} className="flex items-center justify-between">
                          <span className="text-text text-sm">{mat}</span>
                          <span className="text-green-500 font-bold text-sm">{p}%</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="bg-bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown size={15} className="text-red-500" />
                    <h3 className="text-text font-semibold text-sm">Pontos fracos</h3>
                    <span className="text-text-faint text-xs ml-auto">&lt; 50%</span>
                  </div>
                  {fracos.length === 0 ? (
                    <p className="text-text-faint text-sm">Nenhuma matéria abaixo de 50%. Continue assim! 🎉</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {fracos.map(({ mat, p }) => (
                        <li key={mat} className="flex items-center justify-between">
                          <span className="text-text text-sm">{mat}</span>
                          <span className="text-red-500 font-bold text-sm">{p}%</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            {maisFraco && maisFraco.t >= 5 && maisFraco.p < 70 && (
              <div className="mt-4 bg-brand-soft border border-brand/20 rounded-2xl p-5">
                <p className="text-brand font-semibold text-sm mb-2">💡 Sugestão personalizada</p>
                <p className="text-text text-sm leading-relaxed">
                  Você está com <strong>{maisFraco.p}%</strong> de aproveitamento em{' '}
                  <strong>{maisFraco.mat}</strong>. Recomendamos revisar os conteúdos com a{' '}
                  <Link href="/dashboard/tutora" className="text-brand underline underline-offset-2 hover:no-underline">IA Tutora</Link>{' '}
                  ou gerar um{' '}
                  <Link href="/dashboard/resumos" className="text-brand underline underline-offset-2 hover:no-underline">resumo focado</Link>.
                </p>
              </div>
            )}
          </section>

          {/* ── 7. Conquistas ── */}
          <section className="pb-10">
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-text font-semibold text-sm uppercase tracking-wider text-text-muted">Conquistas</h2>
              <span className="text-text-faint text-xs">{conquistadas} de {conquistas.length} desbloqueadas</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {conquistas.map(c => (
                <div
                  key={c.id}
                  title={c.desc}
                  className={`bg-bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-all ${
                    c.ok ? 'shadow-sm' : 'opacity-40 grayscale'
                  }`}
                >
                  <span className="text-3xl leading-none">{c.emoji}</span>
                  <p className="text-text text-xs font-semibold leading-snug">{c.titulo}</p>
                  {c.ok ? (
                    <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Conquistado</span>
                  ) : (
                    <span className="text-[10px] text-text-faint flex items-center gap-1"><Lock size={9} /> Bloqueado</span>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
