import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
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
      "explicacao": "explicação detalhada do porquê a alternativa correta é a certa e por que as outras estão erradas"
    }
  ]
}`

  const prompt = `Crie ${quantidade} questões de ${materia} sobre o conteúdo "${conteudo}" no estilo ${vestibular}.
Nível de dificuldade: ${nivelMap[dificuldade as keyof typeof nivelMap]}.
As questões devem testar domínio real do conteúdo "${conteudo}", com enunciados contextualizados como no ${vestibular}.
Responda APENAS o JSON no formato pedido.`

  try {
    const resposta = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system,
      messages: [{ role: 'user', content: prompt }],
    })

    const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : '{}'
    const jsonMatch = texto.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON não encontrado na resposta')
    const dados = JSON.parse(jsonMatch[0])

    return Response.json(dados)
  } catch (error) {
    console.error('[questoes/gerar]', error)
    return Response.json({ error: 'Erro ao gerar questões' }, { status: 500 })
  }
}
