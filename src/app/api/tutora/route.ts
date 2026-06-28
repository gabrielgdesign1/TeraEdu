import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  const { mensagens } = await request.json()

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
      role: m.role,
      content: m.content
    }))
  })

  const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : ''
  return Response.json({ resposta: texto })
}