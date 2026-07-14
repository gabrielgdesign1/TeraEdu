import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withLogging } from '@/lib/apiHandler'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const GET = withLogging('questoes/vestibular', async (req, { log }) => {
  const { searchParams } = new URL(req.url)
  const vestibular = searchParams.get('vestibular')?.toLowerCase()
  const subject    = searchParams.get('subject')
  const yearParam  = searchParams.get('year')
  const year       = yearParam ? Number(yearParam) : null
  const quantidade = Math.min(50, Math.max(1, Number(searchParams.get('quantidade') ?? '10')))

  if (!vestibular || !subject) {
    log.warn({ vestibular, subject }, 'parâmetros obrigatórios ausentes')
    return NextResponse.json({ error: 'Parâmetros vestibular e subject são obrigatórios' }, { status: 400 })
  }

  // Conta total disponível para esse filtro (com ano opcional)
  let countQuery = supabase
    .from('banco_questoes')
    .select('*', { count: 'exact', head: true })
    .eq('exam_type', vestibular)
    .eq('subject', subject)
  if (year) countQuery = countQuery.eq('exam_year', year)
  const { count, error: countErr } = await countQuery

  if (countErr) {
    log.error({ vestibular, subject, dbError: countErr.message }, 'erro ao contar questões')
    return NextResponse.json({ error: 'Erro ao buscar questões.' }, { status: 500 })
  }

  const total = count ?? 0
  if (total === 0) {
    return NextResponse.json({ questoes: [], total: 0 })
  }

  // Offset aleatório para variedade entre sessões
  const maxOffset = Math.max(0, total - quantidade)
  const offset    = Math.floor(Math.random() * (maxOffset + 1))

  let dataQuery = supabase
    .from('banco_questoes')
    .select('*')
    .eq('exam_type', vestibular)
    .eq('subject', subject)
  if (year) dataQuery = dataQuery.eq('exam_year', year)
  const { data, error } = await dataQuery.range(offset, offset + quantidade - 1)

  if (error) {
    log.error({ vestibular, subject, dbError: error.message }, 'erro ao buscar questões')
    return NextResponse.json({ error: 'Erro ao buscar questões.' }, { status: 500 })
  }

  // Embaralha para misturar anos diferentes
  const embaralhadas = (data ?? []).sort(() => Math.random() - 0.5)

  log.info({ vestibular, subject, year, total, retornadas: embaralhadas.length }, 'questões do banco obtidas')
  return NextResponse.json({
    questoes: embaralhadas,
    total,
    disponivel: total,
  })
})
