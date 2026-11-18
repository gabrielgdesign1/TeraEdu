import Anthropic from '@anthropic-ai/sdk'
import { withLogging } from '@/lib/apiHandler'
import { iaCategoryByPlano } from '@/lib/rateLimit'
import {
  CUSTO_CREDITOS, MODELO, clienteCreditos, saldoAtual,
  registrarUsoSeguro, respostaSemCreditos,
} from '@/lib/creditos'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

type Mensagem = { role: string; content: string }

/* Só as últimas N mensagens são enviadas pra Anthropic. O histórico completo
   continua salvo no banco e visível pro usuário — isto não apaga nada. */
const JANELA_MENSAGENS = 16

export const POST = withLogging('tutora', async (request, { log, authUserId }) => {
  // Créditos exigem usuário identificado (o middleware não cobre /api/*)
  if (!authUserId) {
    return Response.json({ error: 'Faça login para usar a IA Tutora.' }, { status: 401 })
  }

  const { mensagens } = await request.json()

  if (!Array.isArray(mensagens) || mensagens.length === 0) {
    log.warn('mensagens ausentes ou vazias')
    return Response.json({ error: 'Nenhuma mensagem enviada.' }, { status: 400 })
  }

  /* O corte pode cair num turno 'assistant', mas a API exige que a primeira
     mensagem seja 'user' — descartamos o que sobrar na frente. */
  const janela: Mensagem[] = mensagens.slice(-JANELA_MENSAGENS)
  while (janela.length > 0 && janela[0].role !== 'user') janela.shift()

  if (janela.length === 0) {
    log.warn({ msgCount: mensagens.length }, 'janela vazia após truncamento')
    return Response.json({ error: 'Nenhuma mensagem enviada.' }, { status: 400 })
  }

  const messages: Anthropic.MessageParam[] = janela.map((m, i) => ({
    role: m.role as 'user' | 'assistant',
    content:
      i === janela.length - 1
        ? [{ type: 'text' as const, text: m.content, cache_control: { type: 'ephemeral' as const } }]
        : m.content,
  }))

  const custo = CUSTO_CREDITOS.tutora
  const sb = await clienteCreditos()
  const saldo = await saldoAtual(sb)
  if (saldo < custo) {
    log.warn({ saldo, custo }, 'sem créditos')
    return respostaSemCreditos(saldo, custo)
  }

  const resposta = await anthropic.messages.create({
    model: MODELO.raciocinio,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: `Você é a tutora de IA do TeraEdu, uma plataforma de estudos para o ENEM e vestibulares brasileiros.
Seu papel é ajudar estudantes do ensino médio a entenderem conteúdos de todas as matérias: Matemática, Física, Química, Biologia, História, Geografia, Português, Literatura, Inglês, Filosofia e Sociologia.
Explique de forma clara, didática e com exemplos práticos. Use analogias quando necessário.
Adapte a linguagem para estudantes do ensino médio.
Quando resolver problemas de Matemática ou Física, mostre o passo a passo.
Responda sempre em português brasileiro.`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  })

  const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : ''

  // Resposta vazia é geração inválida: registra o uso mas não debita
  const sucesso = texto.length > 0
  await registrarUsoSeguro(sb, log, {
    acao: 'tutora', model: MODELO.raciocinio, usage: resposta.usage,
    creditos: custo, sucesso,
  })
  if (!sucesso) {
    log.warn('resposta vazia da Anthropic — sem débito')
    return Response.json({ error: 'A IA não retornou resposta. Tente novamente.' }, { status: 502 })
  }

  log.info(
    {
      msgCount: mensagens.length, msgEnviadas: janela.length, outputChars: texto.length,
      inputTokens: resposta.usage.input_tokens, outputTokens: resposta.usage.output_tokens,
      creditos: custo,
    },
    'resposta gerada'
  )
  return Response.json({ resposta: texto })
}, { rateLimit: iaCategoryByPlano, maxBytes: 64_000 })
