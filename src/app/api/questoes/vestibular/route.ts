import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const vestibular = searchParams.get('vestibular')?.toLowerCase()
  const subject    = searchParams.get('subject')
  const quantidade = Math.min(50, Math.max(1, Number(searchParams.get('quantidade') ?? '10')))

  if (!vestibular || !subject) {
    return NextResponse.json({ error: 'Parâmetros vestibular e subject são obrigatórios' }, { status: 400 })
  }

  // Conta total disponível para esse filtro
  const { count, error: countErr } = await supabase
    .from('banco_questoes')
    .select('*', { count: 'exact', head: true })
    .eq('exam_type', vestibular)
    .eq('subject', subject)

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 })
  }

  const total = count ?? 0
  if (total === 0) {
    return NextResponse.json({ questoes: [], total: 0 })
  }

  // Offset aleatório para variedade entre sessões
  const maxOffset = Math.max(0, total - quantidade)
  const offset    = Math.floor(Math.random() * (maxOffset + 1))

  const { data, error } = await supabase
    .from('banco_questoes')
    .select('*')
    .eq('exam_type', vestibular)
    .eq('subject', subject)
    .range(offset, offset + quantidade - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Embaralha para misturar anos diferentes
  const embaralhadas = (data ?? []).sort(() => Math.random() - 0.5)

  return NextResponse.json({
    questoes: embaralhadas,
    total,
    disponivel: total,
  })
}
