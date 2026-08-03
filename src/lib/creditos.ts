import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from './supabaseServer'

export type AcaoIA =
  | 'flashcard' | 'questao' | 'tutora' | 'resumo'
  | 'resumo_pergunta' | 'plano' | 'questao_corrigir'

/**
 * Sonnet onde a qualidade de raciocínio importa pro produto; Haiku no resto
 * (3x mais barato). A escolha de cada rota está documentada onde é usada.
 */
export const MODELO = {
  raciocinio: 'claude-sonnet-4-6',
  economico:  'claude-haiku-4-5-20251001',
} as const

/**
 * Acima deste número de blocos (semanas × dias × matérias por dia), o Haiku
 * passa a omitir a segunda matéria em alguns dias do plano — falha silenciosa,
 * porque o JSON continua estruturalmente válido. Medido em scripts/eval-plano.mjs:
 * falhou em 3 de 6 execuções com 180 blocos, e passou 100% com 56 e 70.
 */
export const LIMITE_BLOCOS_HAIKU = 100

/** Custo em créditos por unidade gerada. */
export const CUSTO_CREDITOS: Record<AcaoIA, number> = {
  flashcard:        2,    // por card
  questao:          30,   // por questão
  tutora:           65,   // por mensagem
  resumo:           60,   // por resumo
  resumo_pergunta:  65,   // mesma tarifa da tutora — fecha o bypass
  plano:            300,  // por plano gerado
  questao_corrigir: 0,    // grátis, mas registrado para visibilidade de custo
}

/** Preço da Anthropic em USD por 1M de tokens. */
const PRECO_MODELO: Record<string, { input: number; output: number }> = {
  [MODELO.raciocinio]: { input: 3, output: 15 },
  [MODELO.economico]:  { input: 1, output: 5  },
}

export type UsageAnthropic = {
  input_tokens: number
  output_tokens: number
  cache_creation_input_tokens?: number | null
  cache_read_input_tokens?: number | null
}

/**
 * Custo real da chamada. Inclui os tokens de cache: escrita custa 1.25x o preço
 * de input e leitura 0.1x. Ignorá-los subestimaria o custo, porque
 * usage.input_tokens conta só o que NÃO veio do cache.
 */
export function calcularCustoUsd(model: string, usage: UsageAnthropic): number {
  const p = PRECO_MODELO[model] ?? { input: 3, output: 15 }
  const escrita = usage.cache_creation_input_tokens ?? 0
  const leitura = usage.cache_read_input_tokens ?? 0
  const usd = (usage.input_tokens * p.input
             + escrita * p.input * 1.25
             + leitura * p.input * 0.1
             + usage.output_tokens * p.output) / 1_000_000
  return Number(usd.toFixed(6))
}

/**
 * O cliente precisa nascer DENTRO do escopo do request (usa cookies()).
 * Em /api/questoes/gerar o débito roda dentro do ReadableStream, depois que a
 * Response já foi devolvida — por isso o cliente é criado antes e repassado.
 */
export async function clienteCreditos(): Promise<SupabaseClient> {
  return createServerSupabaseClient()
}

export async function saldoAtual(sb: SupabaseClient): Promise<number> {
  const { data, error } = await sb.rpc('saldo_creditos')
  if (error) throw error
  return Number(data ?? 0)
}

/** Grava o uso e debita — o débito só ocorre quando sucesso = true. */
export async function registrarUso(sb: SupabaseClient, params: {
  acao: AcaoIA
  model: string
  usage: UsageAnthropic | null
  creditos: number
  sucesso: boolean
}): Promise<void> {
  const u = params.usage
  const { error } = await sb.rpc('registrar_uso_ia', {
    p_acao:                  params.acao,
    p_model:                 params.model,
    p_input_tokens:          u?.input_tokens ?? 0,
    p_output_tokens:         u?.output_tokens ?? 0,
    p_cache_creation_tokens: u?.cache_creation_input_tokens ?? 0,
    p_cache_read_tokens:     u?.cache_read_input_tokens ?? 0,
    p_custo_usd:             u ? calcularCustoUsd(params.model, u) : 0,
    p_creditos:              params.creditos,
    p_sucesso:               params.sucesso,
  })
  if (error) throw error
}

/**
 * Igual a registrarUso, mas nunca lança: a contabilidade não pode derrubar uma
 * geração que já foi entregue ao usuário. A falha vai pro log estruturado.
 */
export async function registrarUsoSeguro(
  sb: SupabaseClient,
  log: { error: (obj: object, msg: string) => void },
  params: Parameters<typeof registrarUso>[1]
): Promise<void> {
  try {
    await registrarUso(sb, params)
  } catch (err) {
    log.error(
      { acao: params.acao, err: err instanceof Error ? err.message : String(err) },
      'falha ao registrar uso de créditos'
    )
  }
}

/** 402 padronizado para saldo insuficiente. */
export function respostaSemCreditos(saldo: number, necessario: number): Response {
  return Response.json({
    error: `Créditos insuficientes. Esta ação custa ${necessario} créditos e você tem ${saldo}.`,
    saldo,
    necessario,
  }, { status: 402 })
}
