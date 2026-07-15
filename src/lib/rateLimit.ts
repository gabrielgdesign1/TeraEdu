import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from './logger'

/**
 * Rate limiting central da API.
 *
 * Backend:
 * - Se UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN estiverem configurados,
 *   usa Upstash Redis (sliding window) — funciona corretamente entre múltiplas
 *   instâncias/regiões da Vercel, é o backend usado em produção.
 * - Se não estiverem configurados, cai para um limitador em memória do processo
 *   (mesmo algoritmo de sliding window). Só vale para UMA instância — serve para
 *   rodar localmente sem depender do Upstash, nunca para produção multi-instância.
 *
 * Falha aberta: qualquer erro de infraestrutura (Redis fora do ar, etc.) libera
 * a requisição em vez de derrubar a rota — rate limit nunca deve ser a causa de
 * uma indisponibilidade maior do que aquilo que ele protege.
 */

export type RateLimitCategory =
  | 'apiAuthenticated'
  | 'apiPublic'
  | 'login'
  | 'signup'
  | 'passwordRecovery'
  | 'iaGratuito'
  | 'iaPlus'
  | 'iaPremium'
  | 'geracaoConteudo'
  | 'uploadPdf'
  | 'checkout'
  | 'respostasQuestoes'

type JanelaLimite = { limit: number; windowSec: number }

// Categorias com mais de uma janela (ex: "N por minuto" + "M em 10s") precisam
// passar em TODAS as janelas — a mais restritiva que falhar decide a resposta.
const CATEGORY_LIMITS: Record<RateLimitCategory, JanelaLimite[]> = {
  apiAuthenticated:  [{ limit: 120, windowSec: 60 }],
  apiPublic:         [{ limit: 40,  windowSec: 60 }],
  login:             [{ limit: 5,   windowSec: 600 }],
  signup:            [{ limit: 3,   windowSec: 3600 }],
  passwordRecovery:  [{ limit: 3,   windowSec: 3600 }],
  iaGratuito:        [{ limit: 6,   windowSec: 60 }, { limit: 2, windowSec: 10 }],
  iaPlus:            [{ limit: 10,  windowSec: 60 }, { limit: 3, windowSec: 10 }],
  iaPremium:         [{ limit: 15,  windowSec: 60 }, { limit: 4, windowSec: 10 }],
  geracaoConteudo:   [{ limit: 3,   windowSec: 60 }],
  uploadPdf:         [{ limit: 5,   windowSec: 600 }],
  checkout:          [{ limit: 5,   windowSec: 600 }],
  respostasQuestoes: [{ limit: 30,  windowSec: 60 }],
}

const MENSAGENS: Record<RateLimitCategory, string> = {
  apiAuthenticated:  'Muitas requisições. Aguarde um instante e tente novamente.',
  apiPublic:         'Muitas requisições deste endereço. Aguarde um instante e tente novamente.',
  login:             'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
  signup:            'Muitas tentativas de cadastro. Aguarde antes de tentar novamente.',
  passwordRecovery:  'Muitos pedidos de redefinição de senha para este e-mail. Aguarde antes de tentar novamente.',
  iaGratuito:        'Você atingiu o limite de uso da IA do plano Gratuito. Aguarde um instante ou considere um upgrade.',
  iaPlus:            'Você atingiu o limite de uso da IA do plano Plus. Aguarde um instante e tente novamente.',
  iaPremium:         'Você atingiu o limite de uso da IA do plano Premium. Aguarde um instante e tente novamente.',
  geracaoConteudo:   'Limite de gerações atingido. Aguarde um minuto antes de gerar novamente.',
  uploadPdf:         'Limite de uploads de PDF atingido. Aguarde alguns minutos antes de enviar outro arquivo.',
  checkout:          'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
  respostasQuestoes: 'Você está respondendo rápido demais! Aguarde um instante.',
}

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  /** timestamp unix (ms) de quando a janela mais restritiva libera de novo */
  reset: number
}

// A integração da Vercel com Upstash pode criar os nomes padrão do SDK ou os
// nomes legados do Vercel KV, dependendo do prefixo escolhido na instalação.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.UPSTASH_REDIS_REST_KV_REST_API_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN
const redisConfigured = !!(redisUrl && redisToken)

const redis = redisConfigured
  ? new Redis({
      url: redisUrl!,
      token: redisToken!,
    })
  : null

if (!redisConfigured) {
  logger.warn(
    'Variáveis do Upstash não configuradas — rate limiting rodando com backend em memória (não funciona entre múltiplas instâncias, use apenas em dev)'
  )
}

// Uma instância de Ratelimit por (categoria, janela) — @upstash/ratelimit já
// cuida do sliding window de forma atômica via Lua script no Redis.
const redisLimiters = new Map<string, Ratelimit>()
function getRedisLimiter(category: RateLimitCategory, janela: JanelaLimite, idx: number): Ratelimit {
  const key = `${category}:${idx}`
  let rl = redisLimiters.get(key)
  if (!rl) {
    rl = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(janela.limit, `${janela.windowSec} s`),
      prefix: `ratelimit:${category}:${idx}`,
      analytics: false,
    })
    redisLimiters.set(key, rl)
  }
  return rl
}

// Fallback em memória — sliding window log simples (array de timestamps por chave).
const memoryStore = new Map<string, number[]>()
let lastCleanup = Date.now()
function checkMemory(category: RateLimitCategory, idx: number, identifier: string, janela: JanelaLimite): RateLimitResult {
  const now = Date.now()
  const windowMs = janela.windowSec * 1000
  const key = `${category}:${idx}:${identifier}`

  // limpeza periódica pra não vazar memória indefinidamente em dev
  if (now - lastCleanup > 60_000) {
    lastCleanup = now
    for (const [k, timestamps] of memoryStore) {
      const fresh = timestamps.filter(t => now - t < windowMs)
      if (fresh.length === 0) memoryStore.delete(k)
      else memoryStore.set(k, fresh)
    }
  }

  const windowStart = now - windowMs
  const timestamps = (memoryStore.get(key) ?? []).filter(t => t > windowStart)
  const success = timestamps.length < janela.limit
  if (success) timestamps.push(now)
  memoryStore.set(key, timestamps)

  const reset = timestamps.length > 0 ? timestamps[0] + windowMs : now + windowMs
  return { success, limit: janela.limit, remaining: Math.max(0, janela.limit - timestamps.length), reset }
}

/**
 * Verifica todas as janelas da categoria para o identificador dado.
 * Retorna o resultado da janela mais restritiva que falhar (ou sucesso se todas passarem).
 */
export async function checkRateLimit(category: RateLimitCategory, identifier: string): Promise<RateLimitResult> {
  const janelas = CATEGORY_LIMITS[category]

  try {
    const resultados = await Promise.all(
      janelas.map(async (janela, idx) => {
        if (redis) {
          const rl = getRedisLimiter(category, janela, idx)
          const r = await rl.limit(identifier)
          return { success: r.success, limit: r.limit, remaining: r.remaining, reset: r.reset }
        }
        return checkMemory(category, idx, identifier, janela)
      })
    )

    const falhou = resultados.find(r => !r.success)
    return falhou ?? resultados[resultados.length - 1]
  } catch (err) {
    // Falha aberta: erro de infra no rate limiter não deve derrubar a rota
    logger.error(
      { category, err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
      'erro ao checar rate limit — liberando requisição (fail open)'
    )
    return { success: true, limit: 0, remaining: 0, reset: Date.now() }
  }
}

/** Extrai o IP do cliente a partir dos headers padrão da Vercel/proxies. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

/**
 * Roda o check e, se excedido, retorna a Response 429 pronta (com Retry-After
 * e mensagem amigável). Retorna null quando a requisição pode prosseguir.
 */
export async function rateLimitResponse(category: RateLimitCategory, identifier: string): Promise<Response | null> {
  const result = await checkRateLimit(category, identifier)
  if (result.success) return null

  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
  return Response.json(
    { error: MENSAGENS[category], retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

/** Resolver pronto para rotas de leitura sem categoria específica: autenticado usa o teto maior, visitante usa o teto por IP. */
export function publicOrAuthCategory({ userId }: { userId: string | null }): RateLimitCategory {
  return userId ? 'apiAuthenticated' : 'apiPublic'
}

/** Resolver pronto para endpoints de IA conversacional (tutora, perguntas sobre resumo), com teto por plano. */
export async function iaCategoryByPlano({
  userId,
  getPlano,
}: {
  userId: string | null
  getPlano: () => Promise<string>
}): Promise<RateLimitCategory> {
  if (!userId) return 'iaGratuito'
  const plano = await getPlano()
  if (plano === 'premium') return 'iaPremium'
  if (plano === 'plus') return 'iaPlus'
  return 'iaGratuito'
}
