import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Retorna os anos distintos disponíveis para um vestibular + matéria
export async function GET(req: NextRequest) {
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
    return NextResponse.json({ anos: [], error: error.message }, { status: 500 })
  }

  const anos = Array.from(new Set((data ?? []).map(r => r.exam_year as number)))
    .sort((a, b) => b - a)

  return NextResponse.json({ anos })
}
