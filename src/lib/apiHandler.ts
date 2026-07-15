import type { Logger } from 'pino'
import { logger, newRequestId, getUserIdFromRequest } from './logger'
import { rateLimitResponse, getClientIp, type RateLimitCategory } from './rateLimit'
import { getServerUser, getUserPlano } from './supabaseServer'

export type RouteContext = {
  log: Logger
  requestId: string
  /** best-effort, decodificado do cookie sem verificar assinatura — só para log */
  userId: string | null
  /** usuário autenticado validado (Supabase Auth) — só resolvido quando a rota usa `rateLimit`. null se anônimo ou se a rota não pediu rate limit. */
  authUserId: string | null
  /** identidade usada no rate limit ("user:<id>" ou "ip:<ip>") — reaproveitável para checagens extras dentro do handler (ex: limite de upload de PDF dentro de /resumos) */
  identifier: string
}

type Handler = (req: Request, ctx: RouteContext) => Promise<Response>

type RateLimitResolver =
  | RateLimitCategory
  | ((ctx: { userId: string | null; getPlano: () => Promise<string> }) => RateLimitCategory | Promise<RateLimitCategory>)

export type RouteOptions = {
  /** categoria fixa, ou função que resolve a categoria (ex: por plano do usuário) */
  rateLimit?: RateLimitResolver
}

/**
 * Envolve um handler de rota adicionando:
 * - requestId único (correlação de logs)
 * - userId (best-effort, do cookie de sessão)
 * - rate limiting opcional (identidade real: usuário autenticado via Supabase Auth,
 *   com IP como fallback para visitantes) — responde 429 com Retry-After quando excede
 * - log estruturado de início / sucesso / erro com duração e status
 * - captura de QUALQUER erro → resposta 500 tratada (nunca vaza stack ao cliente)
 *
 * O handler recebe um child logger já com contexto (action/requestId/userId).
 */
export function withLogging(action: string, handler: Handler, options?: RouteOptions) {
  return async (req: Request): Promise<Response> => {
    const requestId = newRequestId()
    const userId = getUserIdFromRequest(req)
    const log = logger.child({ action, requestId, userId })
    const start = Date.now()

    log.info({ method: req.method }, 'request.start')

    try {
      let authUserId: string | null = null
      let identifier = `ip:${getClientIp(req)}`

      if (options?.rateLimit) {
        const authedUser = await getServerUser()
        authUserId = authedUser?.id ?? null
        if (authUserId) identifier = `user:${authUserId}`

        let planoCache: string | null = null
        const getPlano = async () => {
          if (planoCache) return planoCache
          planoCache = authUserId ? await getUserPlano(authUserId) : 'gratuito'
          return planoCache
        }

        const category = typeof options.rateLimit === 'function'
          ? await options.rateLimit({ userId: authUserId, getPlano })
          : options.rateLimit

        const blocked = await rateLimitResponse(category, identifier)
        if (blocked) {
          log.warn({ category }, 'rate limit exceeded')
          return blocked
        }
      }

      const res = await handler(req, { log, requestId, userId, authUserId, identifier })
      log.info({ status: res.status, durationMs: Date.now() - start }, 'request.success')
      return res
    } catch (err) {
      log.error(
        {
          durationMs: Date.now() - start,
          err: err instanceof Error
            ? { name: err.name, message: err.message, stack: err.stack }
            : { message: String(err) },
        },
        'request.error'
      )
      return Response.json(
        { error: 'Erro interno ao processar a requisição. Tente novamente.', requestId },
        { status: 500 }
      )
    }
  }
}
