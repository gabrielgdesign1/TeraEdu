import pino from 'pino'

/**
 * Logger estruturado (JSON) para toda a aplicação.
 *
 * - Níveis: trace < debug < info < warn < error < fatal (LOG_LEVEL controla o mínimo)
 * - Saída JSON em stdout (capturada pela Vercel/observabilidade)
 * - Redaction rigorosa: senhas, tokens, chaves, cookies, e-mails e conteúdo
 *   do usuário NUNCA são gravados (substituídos por [REDACTED])
 *
 * IMPORTANTE: não usamos transports/workers (quebram em serverless).
 * O pino base escreve JSON direto no stdout — ideal para Vercel Functions.
 */

// Caminhos sensíveis mascarados em qualquer objeto logado (incluindo aninhados via '*.')
const REDACT_PATHS = [
  // credenciais
  'password', '*.password', 'senha', '*.senha', 'senhaNova', 'senhaConfirma',
  'token', '*.token', 'access_token', 'refresh_token', '*.access_token', '*.refresh_token',
  'authorization', 'Authorization', 'headers.authorization', 'headers.cookie',
  'apiKey', 'api_key', 'ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'cookie', 'Cookie', 'set-cookie',
  // dados pessoais (PII)
  'email', '*.email', 'nome', '*.nome',
  // conteúdo do usuário / IA (pode conter dados pessoais)
  'mensagens', '*.mensagens', 'texto', '*.texto', 'content', '*.content',
  'resposta', '*.resposta', 'enunciado', '*.enunciado', 'resumo', '*.resumo',
  'pergunta', '*.pergunta', 'resposta_usuario', '*.resposta_usuario',
]

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { app: 'teraedu', env: process.env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    // nível como string legível ("info","error") em vez do número
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]',
  },
})

/** Gera um requestId único para correlacionar todos os logs de uma requisição. */
export function newRequestId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  }
}

/**
 * Extrai o userId (sub do JWT) do access_token nos cookies do Supabase,
 * de forma best-effort e SEM lançar erro. Retorna null se não houver sessão.
 * Decodifica só o payload do JWT (não valida assinatura — é apenas para contexto de log).
 */
export function getUserIdFromRequest(req: Request): string | null {
  try {
    const cookie = req.headers.get('cookie')
    if (!cookie) return null
    // Cookies do Supabase ssr: sb-<ref>-auth-token(.N) contendo o JSON da sessão (às vezes base64-)
    const match = cookie.match(/sb-[^=]+-auth-token(?:\.\d+)?=([^;]+)/)
    if (!match) return null
    let raw = decodeURIComponent(match[1])
    if (raw.startsWith('base64-')) {
      raw = Buffer.from(raw.slice(7), 'base64').toString('utf8')
    }
    const session = JSON.parse(raw)
    const accessToken: string | undefined = session?.access_token ?? session?.[0]
    if (!accessToken || typeof accessToken !== 'string') return null
    const payload = accessToken.split('.')[1]
    if (!payload) return null
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    const claims = JSON.parse(json)
    return typeof claims?.sub === 'string' ? claims.sub : null
  } catch {
    return null
  }
}
