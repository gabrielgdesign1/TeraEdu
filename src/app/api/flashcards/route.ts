import Anthropic from '@anthropic-ai/sdk'
import { withLogging } from '@/lib/apiHandler'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const POST = withLogging('flashcards', async (request, { log }) => {
  const formData = await request.formData()
  const modo = formData.get('modo') as string
  const quantidade = formData.get('quantidade') as string

  const systemPrompt = `Você cria flashcards de estudo para estudantes brasileiros do ensino médio se preparando para o ENEM e vestibulares.
Cada flashcard tem uma pergunta curta e uma resposta clara e direta.
Você DEVE responder APENAS com um JSON válido, sem nenhum texto adicional, sem markdown, sem explicações.
Formato exato: {"flashcards": [{"pergunta": "...", "resposta": "..."}, ...]}`

  let content: Anthropic.MessageParam['content']

  if (modo === 'tema') {
    const tema = formData.get('tema') as string
    content = `Crie ${quantidade} flashcards sobre: ${tema}. 
As perguntas devem ser curtas e diretas. As respostas claras e objetivas, máximo 2-3 frases.
Cubra os pontos mais importantes do tema para o ENEM.
Responda APENAS o JSON no formato pedido.`
  } else if (modo === 'texto') {
    const texto = formData.get('texto') as string
    content = `Crie ${quantidade} flashcards baseados no seguinte conteúdo:

${texto}

As perguntas devem ser curtas e diretas. As respostas claras e objetivas, máximo 2-3 frases.
Cubra os pontos mais importantes do conteúdo.
Responda APENAS o JSON no formato pedido.`
  } else {
    const arquivo = formData.get('arquivo') as File
    const buffer = await arquivo.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    content = [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64
        }
      },
      {
        type: 'text',
        text: `Crie ${quantidade} flashcards baseados no conteúdo deste PDF.
As perguntas devem ser curtas e diretas. As respostas claras e objetivas, máximo 2-3 frases.
Cubra os pontos mais importantes do conteúdo.
Responda APENAS o JSON no formato: {"flashcards": [{"pergunta": "...", "resposta": "..."}, ...]}`
      }
    ]
  }

  const resposta = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content }]
  })

  const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : '{}'
  const jsonLimpo = texto.replace(/```json|```/g, '').trim()

  let dados
  try {
    dados = JSON.parse(jsonLimpo)
  } catch {
    // A IA retornou algo que não é JSON válido — antes isso virava um 500 cru (falha silenciosa)
    log.warn({ modo, outputChars: texto.length }, 'resposta da IA não é JSON válido')
    return Response.json({ error: 'A IA retornou um formato inesperado. Tente novamente.' }, { status: 502 })
  }

  log.info({ modo, quantidade, total: dados?.flashcards?.length ?? 0 }, 'flashcards gerados')
  return Response.json(dados)
})