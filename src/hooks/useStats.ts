'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export type UserStats = {
  questoes_total: number
  questoes_semana: number
  flashcards_total: number
  flashcards_semana: number
  minutos_total: number
  minutos_semana: number
  sequencia_dias: number
  ultima_atividade: string | null
}

const EMPTY: UserStats = {
  questoes_total: 0, questoes_semana: 0,
  flashcards_total: 0, flashcards_semana: 0,
  minutos_total: 0, minutos_semana: 0,
  sequencia_dias: 0, ultima_atividade: null,
}

export function useStats() {
  const [stats, setStats] = useState<UserStats>(EMPTY)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) setStats(data as UserStats)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { stats, loading, reload: load }
}

export type ActivityItem = {
  id: number
  tipo: 'questao' | 'flashcard' | 'resumo' | 'tutora' | 'simulado'
  descricao: string
  materia: string | null
  quantidade: number | null
  criado_em: string
}

export function useActivities(limit = 5) {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('user_activities')
        .select('id, tipo, descricao, materia, quantidade, criado_em')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(limit)
      if (data) setActivities(data as ActivityItem[])
    })
  }, [limit])

  return activities
}
