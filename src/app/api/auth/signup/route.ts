import { NextResponse } from 'next/server'
import { withLogging } from '@/lib/apiHandler'
import { rateLimitResponse, getClientIp } from '@/lib/rateLimit'
import { createServerSupabaseClient } from '@/lib/supabaseServer'

export const POST = withLogging('auth/signup', async (req, { log }) => {
  const { email, password, nome } = await req.json().catch(() => ({}))

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 })
  }

  const identifier = `ip:${getClientIp(req)}`
  const blocked = await rateLimitResponse('signup', identifier)
  if (blocked) return blocked

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome } },
  })

  if (error) {
    log.warn({ email }, 'cadastro falhou')
    return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 400 })
  }

  log.info({ authUserId: data.user?.id }, 'cadastro bem-sucedido')
  return NextResponse.json({ ok: true })
})
