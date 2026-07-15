import { NextResponse } from 'next/server'
import { withLogging } from '@/lib/apiHandler'
import { rateLimitResponse } from '@/lib/rateLimit'
import { createServerSupabaseClient } from '@/lib/supabaseServer'

export const POST = withLogging('auth/recuperar-senha', async (req, { log }) => {
  const { email } = await req.json().catch(() => ({}))

  if (!email) {
    return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 })
  }

  const identifier = `email:${String(email).toLowerCase().trim()}`
  const blocked = await rateLimitResponse('passwordRecovery', identifier)
  if (blocked) return blocked

  // origem derivada da própria requisição (não confia em URL vinda do corpo)
  const origin = req.headers.get('origin') ?? new URL(req.url).origin
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/redefinir-senha`,
  })

  if (error) {
    log.warn({ email }, 'falha ao enviar e-mail de redefinição')
    return NextResponse.json(
      { error: 'Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.' },
      { status: 400 }
    )
  }

  log.info({ email }, 'e-mail de redefinição enviado')
  return NextResponse.json({ ok: true })
})
