'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, FileQuestion, Layers, FileText, MessageCircle,
  BarChart3, Calendar, Sun, Moon, Settings, GraduationCap,
  TrendingUp, TrendingDown, Lock,
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
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

// ─── SidebarLink ──────────────────────────────────────────────────────────────
