import Anthropic from '@anthropic-ai/sdk'
import { withLogging } from '@/lib/apiHandler'
import { iaCategoryByPlano } from '@/lib/rateLimit'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const POST = withLogging('tutora', async (request, { log }) => {
  const { mensagens } = await request.json()

  if (!Array.isArray(mensagens) || mensagens.length === 0) {
    log.warn('mensagens ausentes ou vazias')
    return Response.json({ error: 'Nenhuma mensagem enviada.' }, { status: 400 })
  }

  const resposta = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `Você é a tutora de IA do TeraEdu, uma plataforma de estudos para o ENEM e vestibulares brasileiros.
Seu papel é ajudar estudantes do ensino médio a entenderem conteúdos de todas as matérias: Matemática, Física, Química, Biologia, História, Geografia, Português, Literatura, Inglês, Filosofia e Sociologia.
Explique de forma clara, didática e com exemplos práticos. Use analogias quando necessário.
Adapte a linguagem para estudantes do ensino médio.
Quando resolver problemas de Matemática ou Física, mostre o passo a passo.
Responda sempre em português brasileiro.`,
    messages: mensagens.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
  })

  const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : ''
  log.info({ msgCount: mensagens.length, outputChars: texto.length }, 'resposta gerada')
  return Response.json({ resposta: texto })
}, { rateLimit: iaCategoryByPlano })
