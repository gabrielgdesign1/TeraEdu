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

export const POST = withLogging('resumos', async (request, { log, identifier, authUserId }) => {
  if (!authUserId) {
    return Response.json({ error: 'Faça login para gerar resumos.' }, { status: 401 })
  }

  const formData = await request.formData()
  const modo = formData.get('modo') as string
  const tamanho = formData.get('tamanho') as string

  // upload de PDF tem um teto próprio, mais apertado, além do limite geral de geração
  // ("origem" vem do cliente, que extrai o texto do PDF no navegador antes de enviar)
  if (formData.get('origem') === 'pdf') {
    const blocked = await rateLimitResponse('uploadPdf', identifier)
    if (blocked) return blocked
  }

  const instrucaoTamanho = {
    curto: 'Faça um resumo CURTO, focando apenas nos pontos mais importantes (cerca de 200-300 palavras).',
    medio: 'Faça um resumo de tamanho MÉDIO, equilibrado entre conciso e detalhado (cerca de 500-700 palavras).',
    completo: 'Faça um resumo COMPLETO e detalhado, cobrindo todos os aspectos importantes (cerca de 1000-1500 palavras).'
  }[tamanho] || ''

  const systemPrompt = `Você cria resumos didáticos para estudantes brasileiros do ensino médio se preparando para o ENEM e vestibulares.
Seus resumos são bem estruturados em Markdown, com:
- Títulos e subtítulos hierarquizados
- Listas e tópicos quando apropriado
- Tabelas quando útil para comparar
- Negrito nos termos importantes
- Fórmulas matemáticas em LaTeX quando necessário (use $ para inline e $$ para bloco)
- Linguagem clara e adaptada ao ensino médio
- Exemplos práticos quando ajudar a entender`

  let content: Anthropic.MessageParam['content']

  if (modo === 'tema') {
    const tema = formData.get('tema') as string
    content = `Crie um resumo sobre: ${tema}.

${instrucaoTamanho}

Estruture bem em Markdown com títulos, subtítulos e listas. Cubra os pontos mais cobrados no ENEM.`
  } else if (modo === 'texto') {
    const texto = formData.get('texto') as string
    content = `Crie um resumo baseado no seguinte conteúdo:

${texto}

${instrucaoTamanho}

Estruture bem em Markdown. Destaque os pontos mais importantes.`
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
        text: `Crie um resumo do conteúdo deste PDF.

${instrucaoTamanho}

Estruture bem em Markdown com títulos, subtítulos e listas. Destaque os pontos mais importantes.`
      }
    ]
  }

  const custo = CUSTO_CREDITOS.resumo
  const sb = await clienteCreditos()
  const saldo = await saldoAtual(sb)
  if (saldo < custo) {
    log.warn({ saldo, custo }, 'sem créditos')
    return respostaSemCreditos(saldo, custo)
  }

  const resposta = await anthropic.messages.create({
    model: MODELO.economico,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content }]
  })

  const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : ''

  const sucesso = texto.length > 0
  await registrarUsoSeguro(sb, log, {
    acao: 'resumo', model: MODELO.economico, usage: resposta.usage,
    creditos: custo, sucesso,
  })
  if (!sucesso) {
    log.warn('resposta vazia da Anthropic — sem débito')
    return Response.json({ error: 'A IA não retornou resposta. Tente novamente.' }, { status: 502 })
  }

  log.info(
    {
      modo, tamanho, outputChars: texto.length, creditos: custo,
      inputTokens: resposta.usage.input_tokens, outputTokens: resposta.usage.output_tokens,
    },
    'resumo gerado'
  )
  return Response.json({ resumo: texto })
}, { rateLimit: 'geracaoConteudo' })