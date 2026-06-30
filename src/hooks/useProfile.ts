'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export type UserProfile = {
  id: string
  nome: string | null
  universidade: string | null
  curso: string | null
  ano_escolar: string | null
  objetivo: string | null
  onboarding_ok: boolean
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data as UserProfile)
    } else {
      // Cria perfil vazio se não existe ainda
      const nome = (user.user_metadata?.nome as string) ?? user.email?.split('@')[0] ?? null
      const novo = { id: user.id, nome, onboarding_ok: false }
      await supabase.from('user_profiles').upsert(novo)
      setProfile({ ...novo, universidade: null, curso: null, ano_escolar: null, objetivo: null })
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function salvarProfile(campos: Partial<Omit<UserProfile, 'id'>>) {
    if (!profile) return
    const supabase = createClient()
    const { data } = await supabase
      .from('user_profiles')
      .update(campos)
      .eq('id', profile.id)
      .select()
      .single()
    if (data) setProfile(data as UserProfile)
  }

  return { profile, loading, salvarProfile, reload: load }
}
