import type { Logger } from 'pino'
import { logger, newRequestId, getUserIdFromRequest } from './logger'

export type RouteContext = {
  log: Logger
  requestId: string
  userId: string | null
}

type Handler = (req: Request, ctx: RouteContext) => Promise<Response>

/**
 * Envolve um handler de rota adicionando:
 * - requestId único (correlação de logs)
 * - userId (best-effort, do cookie de sessão)
 * - log estruturado de início / sucesso / erro com duração e status
 * - captura de QUALQUER erro → resposta 500 tratada (nunca vaza stack ao cliente)
 *
 * O handler recebe um child logger já com contexto (action/requestId/userId).
 */
export function withLogging(action: string, handler: Handler) {
  return async (req: Request): Promise<Response> => {
    const requestId = newRequestId()
    const userId = getUserIdFromRequest(req)
    const log = logger.child({ action, requestId, userId })
    const start = Date.now()

    log.info({ method: req.method }, 'request.start')

    try {
      const res = await handler(req, { log, requestId, userId })
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
