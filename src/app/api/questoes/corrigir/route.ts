import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { withLogging } from '@/lib/apiHandler'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export const POST = withLogging('questoes/corrigir', async (req, { log }) => {
  const { question_id, resposta_usuario } = await req.json()

  if (!question_id) {
    log.warn('question_id ausente')
    return NextResponse.json({ error: 'question_id obrigatório' }, { status: 400 })
  }

  if (!resposta_usuario?.trim()) {
    return NextResponse.json({
      nota: 0,
      acertos: [],
      faltas: ['Resposta em branco.'],
      explicacao: 'Nenhuma resposta foi fornecida.',
      resposta_oficial: null,
    })
  }

  // Busca a resposta oficial no banco (não exposta ao cliente)
  const { data, error } = await supabase
    .from('questoes_discursivas')
    .select('question, answer, short_answer, guidelines, subject')
    .eq('question_id', question_id)
    .single()

  if (error || !data) {
    log.warn({ question_id, dbError: error?.message }, 'questão não encontrada')
    return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 })
  }

  const gabarito = [data.answer, data.short_answer, data.guidelines]
    .filter(Boolean)
    .join('\n\n---\n\n')

  const prompt = `Você é um professor corretor de vestibular (UNESP). Corrija a resposta do aluno comparando com o gabarito oficial.

ENUNCIADO DA QUESTÃO:
${data.question}

GABARITO OFICIAL DA BANCA:
${gabarito}

RESPOSTA DO ALUNO:
${resposta_usuario}

Avalie se a IDEIA/CONCEITO da resposta do aluno está equivalente ao que o gabarito pede — não exija palavras exatas.

Responda APENAS com JSON válido, sem markdown, neste formato exato:
{
  "nota": <número inteiro de 0 a 100>,
  "acertos": [<lista de strings com o que o aluno acertou>],
  "faltas": [<lista de strings com o que faltou ou está errado>],
  "explicacao": "<parágrafo curto explicando a avaliação e como melhorar>"
}`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (msg.content[0] as { text: string }).text.trim()
  // Remove possível bloco ```json``` se o modelo incluir
  const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let resultado
  try {
    resultado = JSON.parse(jsonStr)
  } catch {
    log.warn({ question_id, outputChars: raw.length }, 'correção da IA não é JSON válido')
    return NextResponse.json({ error: 'A IA retornou um formato inesperado. Tente novamente.' }, { status: 502 })
  }

  log.info({ question_id, subject: data.subject, nota: Number(resultado.nota) || 0 }, 'correção concluída')
  return NextResponse.json({
    nota:            Math.max(0, Math.min(100, Number(resultado.nota) || 0)),
    acertos:         Array.isArray(resultado.acertos)  ? resultado.acertos  : [],
    faltas:          Array.isArray(resultado.faltas)   ? resultado.faltas   : [],
    explicacao:      resultado.explicacao ?? '',
    resposta_oficial: data.answer,
  })
})
