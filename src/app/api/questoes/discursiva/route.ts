import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withLogging } from '@/lib/apiHandler'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const GET = withLogging('questoes/discursiva', async (req, { log }) => {
  const { searchParams } = new URL(req.url)
  const exam      = searchParams.get('exam')     ?? 'UNESP'
  const subject   = searchParams.get('subject')
  const quantidade = Math.min(50, Math.max(1, Number(searchParams.get('quantidade') ?? '10')))

  if (!subject) {
    log.warn('parâmetro subject ausente')
    return NextResponse.json({ error: 'Parâmetro subject é obrigatório' }, { status: 400 })
  }

  const { count } = await supabase
    .from('questoes_discursivas')
    .select('*', { count: 'exact', head: true })
    .eq('exam', exam)
    .eq('subject', subject)

  const total = count ?? 0
  if (total === 0) return NextResponse.json({ questoes: [], total: 0 })

  const maxOffset = Math.max(0, total - quantidade)
  const offset    = Math.floor(Math.random() * (maxOffset + 1))

  const { data, error } = await supabase
    .from('questoes_discursivas')
    .select('id, question_id, exam, year, subject, question, supporting_texts, image_descriptions, has_images, difficulty')
    .eq('exam', exam)
    .eq('subject', subject)
    .range(offset, offset + quantidade - 1)

  if (error) {
    log.error({ exam, subject, dbError: error.message }, 'erro ao buscar questões discursivas')
    return NextResponse.json({ error: 'Erro ao buscar questões.' }, { status: 500 })
  }

  const embaralhadas = (data ?? []).sort(() => Math.random() - 0.5)

  log.info({ exam, subject, total, retornadas: embaralhadas.length }, 'questões discursivas obtidas')
  return NextResponse.json({ questoes: embaralhadas, total })
})
