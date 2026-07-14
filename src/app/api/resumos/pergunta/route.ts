import Anthropic from '@anthropic-ai/sdk'
import { withLogging } from '@/lib/apiHandler'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const POST = withLogging('resumos/pergunta', async (request, { log }) => {
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

  const resposta = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `Você é a tutora de IA do TeraEdu. Responde perguntas de estudantes do ensino médio sobre o conteúdo do resumo apresentado.
Responde de forma clara, didática e adaptada ao ensino médio.
Use Markdown para formatar (negrito, listas, fórmulas LaTeX com $ ou $$).
Seja conciso mas completo.`,
    messages: mensagens
  })

  const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : ''
  log.info({ historicoLen: historicoSeguro.length, outputChars: texto.length }, 'pergunta respondida')
  return Response.json({ resposta: texto })
})