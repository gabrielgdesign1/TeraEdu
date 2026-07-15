import Anthropic from '@anthropic-ai/sdk'
import { withLogging } from '@/lib/apiHandler'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const POST = withLogging('questoes/gerar', async (request, { log }) => {
  const { vestibular, materia, conteudo, dificuldade, quantidade } = await request.json()

  const nivelMap = {
    facil:   'fácil, com conceitos básicos e diretamente explícitos no conteúdo',
    medio:   'médio, exigindo compreensão e aplicação do conteúdo',
    dificil: 'difícil, com situações-problema que exigem análise e síntese',
  }

  const system = `Você é um especialista em criação de questões para vestibulares brasileiros.
Crie questões no estilo exato do ${vestibular}: linguagem formal, contexto real, 5 alternativas (A a E), apenas uma correta.
Você DEVE responder APENAS com JSON válido, sem markdown, sem texto adicional.
Formato exato:
{
  "questoes": [
    {
      "enunciado": "texto completo da questão com contexto",
      "alternativas": [
        { "letra": "A", "texto": "..." },
        { "letra": "B", "texto": "..." },
        { "letra": "C", "texto": "..." },
        { "letra": "D", "texto": "..." },
        { "letra": "E", "texto": "..." }
      ],
      "resposta": "A",
      "explicacao": "explicação do porquê a alternativa correta é a certa e por que as outras estão erradas"
    }
  ]
}`

  const prompt = `Crie ${quantidade} questões de ${materia} sobre o conteúdo "${conteudo}" no estilo ${vestibular}.
Nível de dificuldade: ${nivelMap[dificuldade as keyof typeof nivelMap]}.
As questões devem testar domínio real do conteúdo "${conteudo}", com enunciados contextualizados como no ${vestibular}.
Para "explicacao", seja claro e direto (3 a 5 frases): por que a alternativa correta está certa e por que as demais estão erradas, sem enrolação.
Responda APENAS o JSON no formato pedido.`

  // teto proporcional à quantidade pedida, evita reservar mais do que o necessário
  const maxTokens = Math.min(8000, 300 + Number(quantidade || 1) * 850)

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  })

  const encoder = new TextEncoder()
  let totalChars = 0
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            totalChars += event.delta.text.length
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        log.info({ vestibular, materia, conteudo, dificuldade, outputChars: totalChars }, 'questões geradas (stream)')
      } catch (error) {
        log.error(
          { vestibular, materia, err: error instanceof Error ? { name: error.name, message: error.message } : String(error) },
          'falha ao gerar questões (stream)'
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}, { rateLimit: 'geracaoConteudo' })
