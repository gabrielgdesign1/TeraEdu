import { NextResponse } from 'next/server'
import { withLogging } from '@/lib/apiHandler'
import { rateLimitResponse, getClientIp } from '@/lib/rateLimit'
import { createServerSupabaseClient } from '@/lib/supabaseServer'

export const POST = withLogging('auth/login', async (req, { log }) => {
  const { email, password } = await req.json().catch(() => ({}))

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 })
  }

  // limite por combinação de IP + e-mail (não pelo identifier padrão do wrapper,
  // que não conhece o e-mail antes do corpo da requisição ser lido)
  const identifier = `${getClientIp(req)}:${String(email).toLowerCase().trim()}`
  const blocked = await rateLimitResponse('login', identifier)
  if (blocked) return blocked

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    log.warn({ email }, 'login falhou')
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 })
  }

  log.info({ authUserId: data.user.id }, 'login bem-sucedido')
  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } })
})
