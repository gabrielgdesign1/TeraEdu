'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function useNome() {
  const [nome, setNome] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const raw = data.user?.user_metadata?.nome as string | undefined
      setNome(raw ?? data.user?.email?.split('@')[0] ?? null)
    })
  }, [])

  const primeiroNome = nome?.split(' ')[0] ?? null

  return { nome, primeiroNome }
}
