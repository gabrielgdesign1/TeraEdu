import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

/**
 * Cliente Supabase para uso server-side (Route Handlers) — lê/escreve a sessão
 * via cookies (next/headers), igual ao middleware.ts. Necessário para validar
 * de verdade quem está chamando a API (ao contrário do decode não-verificado
 * usado só para log em getUserIdFromRequest).
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // chamado a partir de um Server Component (sem permissão de escrita) — ok ignorar
          }
        },
      },
    }
  )
}

/** Usuário autenticado (validado contra o Supabase Auth) ou null. */
export async function getServerUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/** Plano do usuário (gratuito/plus/premium), com fallback seguro para 'gratuito'. */
export async function getUserPlano(userId: string): Promise<string> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('plano')
    .eq('id', userId)
    .single()
  return data?.plano ?? 'gratuito'
}
