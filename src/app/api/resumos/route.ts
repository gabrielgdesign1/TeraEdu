import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  const formData = await request.formData()
  const modo = formData.get('modo') as string
  const tamanho = formData.get('tamanho') as string

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

  const resposta = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content }]
  })

  const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : ''
  return Response.json({ resumo: texto })
}