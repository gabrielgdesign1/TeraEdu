import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const exam      = searchParams.get('exam')     ?? 'UNESP'
  const subject   = searchParams.get('subject')
  const quantidade = Math.min(50, Math.max(1, Number(searchParams.get('quantidade') ?? '10')))

  if (!subject) {
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const embaralhadas = (data ?? []).sort(() => Math.random() - 0.5)

  return NextResponse.json({ questoes: embaralhadas, total })
}
