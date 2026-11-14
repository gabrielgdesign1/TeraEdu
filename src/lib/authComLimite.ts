import { isAuthRetryableFetchError, type SupabaseClient, type User } from '@supabase/supabase-js'

const LIMITE_AUTH_MS = 5000

type ClienteAuth = { auth: Pick<SupabaseClient['auth'], 'getUser'> }
export type ResultadoAuth = {
  user: User | null
  /** true quando não deu pra saber quem é o usuário porque o Supabase não respondeu */
  indisponivel: boolean
}

/**
 * getUser() com tempo máximo. Sem isso, uma sessão expirada com o Supabase fora do
 * ar fica ~30s retentando renovar o token — e a Vercel derruba o middleware em 25s,
 * o que trava /login e /dashboard com erro em vez de só cair na tela de login.
 *
 * Não importa next/headers de propósito: também é usado no middleware.
 */
export async function getUserComLimite(supabase: ClienteAuth): Promise<ResultadoAuth> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const limite = new Promise<ResultadoAuth>(resolve => {
    timer = setTimeout(() => resolve({ user: null, indisponivel: true }), LIMITE_AUTH_MS)
  })
  const consulta = supabase.auth.getUser()
    .then(({ data, error }): ResultadoAuth => ({
      user: data.user,
      indisponivel: isAuthRetryableFetchError(error),
    }))
    .catch((): ResultadoAuth => ({ user: null, indisponivel: true }))

  try {
    return await Promise.race([consulta, limite])
  } finally {
    clearTimeout(timer)
  }
}
