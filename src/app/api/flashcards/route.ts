import Anthropic from '@anthropic-ai/sdk'
import { withLogging } from '@/lib/apiHandler'
import { rateLimitResponse } from '@/lib/rateLimit'
import {
  CUSTO_CREDITOS, MODELO, clienteCreditos, saldoAtual,
  registrarUsoSeguro, respostaSemCreditos,
} from '@/lib/creditos'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const POST = withLogging('flashcards', async (request, { log, identifier, authUserId }) => {
  if (!authUserId) {
    return Response.json({ error: 'Faça login para gerar flashcards.' }, { status: 401 })
  }

  const formData = await request.formData()
  const modo = formData.get('modo') as string
  const quantidade = formData.get('quantidade') as string

  // upload de PDF tem um teto próprio, mais apertado, além do limite geral de geração
  if (formData.get('origem') === 'pdf') {
    const blocked = await rateLimitResponse('uploadPdf', identifier)
    if (blocked) return blocked
  }

  // A UI oferece 5/10/15/20 — o clamp evita um "quantidade" absurdo inflar a
  // checagem de saldo ou o débito
  const qtd = Math.min(Math.max(Number(quantidade) || 1, 1), 20)
  const custoPedido = qtd * CUSTO_CREDITOS.flashcard
  const sb = await clienteCreditos()
  const saldo = await saldoAtual(sb)
  if (saldo < custoPedido) {
    log.warn({ saldo, custoPedido, qtd }, 'sem créditos')
    return respostaSemCreditos(saldo, custoPedido)
  }

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
    /* Material e instrução em blocos separados, com o breakpoint no material:
       assim gerar um segundo lote com outra "quantidade" ainda aproveita o
       cache. Num bloco único, o "Crie N" no começo mudaria o prefixo e
       invalidaria tudo — que é justamente o caso de uso do cache aqui. */
    content = [
      {
        type: 'text',
        text: `Conteúdo de referência:

${texto}`,
        cache_control: { type: 'ephemeral' }
      },
      {
        type: 'text',
        text: `Crie ${quantidade} flashcards baseados no conteúdo acima.
As perguntas devem ser curtas e diretas. As respostas claras e objetivas, máximo 2-3 frases.
Cubra os pontos mais importantes do conteúdo.
Responda APENAS o JSON no formato pedido.`
      }
    ]
  } else {
    // PDF chega como 'texto' (extraído no navegador); qualquer outro modo é inválido
    return Response.json({ error: 'Modo inválido.' }, { status: 400 })
  }

  const resposta = await anthropic.messages.create({
    model: MODELO.economico,
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
    await registrarUsoSeguro(sb, log, {
      acao: 'flashcard', model: MODELO.economico, usage: resposta.usage,
      creditos: 0, sucesso: false,
    })
    log.warn({ modo, outputChars: texto.length }, 'resposta da IA não é JSON válido')
    return Response.json({ error: 'A IA retornou um formato inesperado. Tente novamente.' }, { status: 502 })
  }

  // débito pela quantidade REALIZADA, nunca acima do que foi checado
  const gerados = Math.min(dados?.flashcards?.length ?? 0, qtd)
  await registrarUsoSeguro(sb, log, {
    acao: 'flashcard', model: MODELO.economico, usage: resposta.usage,
    creditos: gerados * CUSTO_CREDITOS.flashcard, sucesso: gerados > 0,
  })

  log.info(
    {
      modo, quantidade: qtd, total: gerados, creditos: gerados * CUSTO_CREDITOS.flashcard,
      inputTokens: resposta.usage.input_tokens, outputTokens: resposta.usage.output_tokens,
    },
    'flashcards gerados'
  )
  return Response.json(dados)
}, { rateLimit: 'geracaoConteudo', maxBytes: 300_000 })