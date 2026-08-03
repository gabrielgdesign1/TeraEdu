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

export const POST = withLogging('resumos/pergunta', async (request, { log, authUserId }) => {
  if (!authUserId) {
    return Response.json({ error: 'Faça login para perguntar sobre o resumo.' }, { status: 401 })
  }

  const { resumo, pergunta, historico } = await request.json()

  if (!resumo || !pergunta) {
    log.warn('resumo ou pergunta ausentes')
    return Response.json({ error: 'Resumo e pergunta são obrigatórios.' }, { status: 400 })
  }
  const historicoSeguro = Array.isArray(historico) ? historico : []

  const mensagens: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Aqui está um resumo de estudo:\n\n${resumo}\n\n---\n\nA partir de agora, responda às minhas perguntas sobre esse conteúdo.`
    },
    {
      role: 'assistant',
      content: 'Entendi o resumo! Pode me perguntar qualquer coisa sobre ele que vou explicar de forma clara.'
    }
  ]

  // Adiciona histórico de perguntas anteriores
  for (const item of historicoSeguro) {
    mensagens.push({ role: 'user', content: item.pergunta })
    mensagens.push({ role: 'assistant', content: item.resposta })
  }

  // Adiciona a pergunta atual
  mensagens.push({ role: 'user', content: pergunta })

  // Mesma tarifa da tutora: mesmo modelo, mesma natureza. Cobrar menos aqui
  // faria desta rota um bypass barato da IA Tutora.
  const custo = CUSTO_CREDITOS.resumo_pergunta
  const sb = await clienteCreditos()
  const saldo = await saldoAtual(sb)
  if (saldo < custo) {
    log.warn({ saldo, custo }, 'sem créditos')
    return respostaSemCreditos(saldo, custo)
  }

  const resposta = await anthropic.messages.create({
    model: MODELO.raciocinio,
    max_tokens: 2048,
    system: `Você é a tutora de IA do TeraEdu. Responde perguntas de estudantes do ensino médio sobre o conteúdo do resumo apresentado.
Responde de forma clara, didática e adaptada ao ensino médio.
Use Markdown para formatar (negrito, listas, fórmulas LaTeX com $ ou $$).
Seja conciso mas completo.`,
    messages: mensagens
  })

  const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : ''

  const sucesso = texto.length > 0
  await registrarUsoSeguro(sb, log, {
    acao: 'resumo_pergunta', model: MODELO.raciocinio, usage: resposta.usage,
    creditos: custo, sucesso,
  })
  if (!sucesso) {
    log.warn('resposta vazia da Anthropic — sem débito')
    return Response.json({ error: 'A IA não retornou resposta. Tente novamente.' }, { status: 502 })
  }

  log.info(
    {
      historicoLen: historicoSeguro.length, outputChars: texto.length,
      inputTokens: resposta.usage.input_tokens, outputTokens: resposta.usage.output_tokens,
      creditos: custo,
    },
    'pergunta respondida'
  )
  return Response.json({ resposta: texto })
}, { rateLimit: iaCategoryByPlano })