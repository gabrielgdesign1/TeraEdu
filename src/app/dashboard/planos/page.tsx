'use client'

import { useState } from 'react'
import { Check, X, Sparkles } from 'lucide-react'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { useProfile } from '@/hooks/useProfile'
import { PLANOS, type PlanoId } from '@/lib/planos'

function fmtPreco(v: number) {
  return v === 0 ? 'R$ 0' : `R$ ${v.toFixed(2).replace('.', ',')}`
}

export default function PlanosPage() {
  const { profile, salvarProfile } = useProfile()
  const [anual, setAnual] = useState(false)
  const [assinando, setAssinando] = useState<PlanoId | null>(null)

  async function escolherPlano(id: PlanoId) {
    if (id === profile?.plano) return
    setAssinando(id)
    await salvarProfile({ plano: id })
    setAssinando(null)
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <DashboardSidebar />

      <main className="flex-1 ml-20 px-10 py-16">
        <div className="max-w-5xl mx-auto">

          {/* Cabeçalho */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-5 bg-bg-card">
              <Sparkles size={12} className="text-brand" />
              <span className="text-text-muted text-xs tracking-widest uppercase">Fazer upgrade</span>
            </div>
            <h1 className="text-text text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] mb-4">
              Preços simples para<br className="hidden sm:block" /> quem quer estudar sem limites.
            </h1>
            <p className="text-text-muted text-base">Comece grátis. Evolua quando fizer sentido. Sem surpresas.</p>
          </div>

          {/* Toggle mensal/anual */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-1 bg-bg-card border border-border rounded-full p-1">
              <button
                onClick={() => setAnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  !anual ? 'bg-bg shadow-sm text-text border border-border' : 'text-text-muted hover:text-text'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setAnual(true)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  anual ? 'bg-bg shadow-sm text-text border border-border' : 'text-text-muted hover:text-text'
                }`}
              >
                Anual
                <span className="text-[10px] bg-green-500/15 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
                  Economize até 28%
                </span>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {PLANOS.map(p => {
              const ehAtual = profile?.plano === p.id
              const preco = anual ? p.precoAnual : p.precoMensal
              const periodo = p.precoMensal === 0 ? 'para sempre' : anual ? '/ano' : '/mês'

              return (
                <div
                  key={p.id}
                  className={`relative bg-bg-card rounded-3xl p-7 flex flex-col border transition-colors ${
                    p.popular ? 'border-brand shadow-lg shadow-brand/5' : 'border-border'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 right-6 text-[11px] bg-brand text-white px-3 py-1 rounded-full font-semibold">
                      Popular
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl leading-none">{p.emoji}</span>
                    <h3 className="text-text font-bold text-lg">{p.nome}</h3>
                  </div>
                  <p className="text-text-faint text-xs mb-5 leading-relaxed min-h-[2.2em]">{p.tagline}</p>

                  <div className="mb-2">
                    <span className="text-text text-4xl font-black tracking-tight">{fmtPreco(preco)}</span>
                    <span className="text-text-muted text-sm ml-1">{periodo}</span>
                  </div>
                  {anual && p.economiaAnual && (
                    <p className="text-green-600 dark:text-green-400 text-xs font-semibold mb-5">
                      Economize {p.economiaAnual}% no plano anual
                    </p>
                  )}
                  {(!anual || !p.economiaAnual) && <div className="mb-5" />}

                  <button
                    onClick={() => escolherPlano(p.id)}
                    disabled={ehAtual || assinando !== null}
                    className={`w-full py-3 rounded-full text-sm font-semibold transition-all mb-6 flex items-center justify-center gap-2 ${
                      ehAtual
                        ? 'bg-bg-hover text-text-muted cursor-default border border-border'
                        : p.popular
                        ? 'bg-brand hover:bg-brand-hover text-white'
                        : 'bg-bg-hover hover:bg-border text-text border border-border'
                    } disabled:opacity-60`}
                  >
                    {assinando === p.id ? (
                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : ehAtual ? (
                      <><Check size={14} /> Plano atual</>
                    ) : p.id === 'gratuito' ? p.cta : p.cta}
                  </button>

                  <ul className="flex flex-col gap-2.5">
                    {p.features.map(f => (
                      <li key={f.texto} className="flex items-start gap-2.5">
                        {f.ok
                          ? <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                          : <X size={14} className="text-text-faint flex-shrink-0 mt-0.5" />}
                        <span className={`text-sm leading-snug ${f.ok ? 'text-text-muted' : 'text-text-faint'}`}>
                          {f.texto}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
