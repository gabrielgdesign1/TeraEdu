import { NextResponse } from 'next/server'
import { withLogging } from '@/lib/apiHandler'
import { publicOrAuthCategory } from '@/lib/rateLimit'

export const GET = withLogging('questoes/banco', async (req, { log }) => {
  const { searchParams } = new URL(req.url)
  const year       = searchParams.get('year')       ?? '2023'
  const discipline = searchParams.get('discipline') ?? ''
  const limit      = searchParams.get('limit')      ?? '5'
  const offset     = searchParams.get('offset')     ?? '0'

  const url = new URL(`https://api.enem.dev/v1/exams/${year}/questions`)
  url.searchParams.set('limit', limit)
  url.searchParams.set('offset', offset)
  if (discipline) url.searchParams.set('discipline', discipline)

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } })
  if (!res.ok) {
    log.warn({ year, discipline, upstreamStatus: res.status }, 'API do ENEM respondeu com erro')
    return NextResponse.json({ error: 'Falha ao buscar questões do ENEM' }, { status: res.status })
  }
  const data = await res.json()
  log.info({ year, discipline, total: data?.questions?.length ?? 0 }, 'questões ENEM obtidas')
  return NextResponse.json(data)
}, { rateLimit: publicOrAuthCategory })
