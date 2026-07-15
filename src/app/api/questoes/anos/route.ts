import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withLogging } from '@/lib/apiHandler'
import { publicOrAuthCategory } from '@/lib/rateLimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Retorna os anos distintos disponíveis para um vestibular + matéria
export const GET = withLogging('questoes/anos', async (req, { log }) => {
  const { searchParams } = new URL(req.url)
  const vestibular = searchParams.get('vestibular')?.toLowerCase()
  const subject    = searchParams.get('subject')

  if (!vestibular || !subject) {
    return NextResponse.json({ anos: [] })
  }

  const { data, error } = await supabase
    .from('banco_questoes')
    .select('exam_year')
    .eq('exam_type', vestibular)
    .eq('subject', subject)
    .not('exam_year', 'is', null)

  if (error) {
    log.error({ vestibular, subject, dbError: error.message }, 'erro ao buscar anos')
    return NextResponse.json({ anos: [] }, { status: 500 })
  }

  const anos = Array.from(new Set((data ?? []).map(r => r.exam_year as number)))
    .sort((a, b) => b - a)

  return NextResponse.json({ anos })
}, { rateLimit: publicOrAuthCategory })
