import { NextResponse } from 'next/server'
import { withLogging } from '@/lib/apiHandler'
import { publicOrAuthCategory } from '@/lib/rateLimit'

type EnemQuestao = { discipline?: string | null; language?: string | null }

// api.enem.dev ignora o filtro `discipline` e limita a 50 por página:
// busca a prova inteira (cache de 1 dia) e filtra a área aqui.
const POR_PAGINA = 50
const PAGINAS = 4 // provas têm ~185 questões

export const GET = withLogging('questoes/banco', async (req, { log }) => {
  const { searchParams } = new URL(req.url)
  const year       = searchParams.get('year')       ?? '2023'
  const discipline = searchParams.get('discipline') ?? ''
  const limit      = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '5') || 5))

  if (!/^\d{4}$/.test(year)) {
    return NextResponse.json({ error: 'Ano inválido' }, { status: 400 })
  }

  const paginas = await Promise.all(
    Array.from({ length: PAGINAS }, async (_, i) => {
      const url = `https://api.enem.dev/v1/exams/${year}/questions?limit=${POR_PAGINA}&offset=${i * POR_PAGINA}`
      const res = await fetch(url, { next: { revalidate: 86400 } })
      if (!res.ok) return null
      return ((await res.json()).questions ?? []) as EnemQuestao[]
    })
  )
  if (paginas.every(p => p === null)) {
    log.warn({ year, discipline }, 'API do ENEM respondeu com erro')
    return NextResponse.json({ error: 'Falha ao buscar questões do ENEM' }, { status: 502 })
  }

  const daArea = paginas.flatMap(p => p ?? []).filter(q =>
    (!discipline || q.discipline === discipline) &&
    q.language !== 'espanhol' // questões 1-5 vêm duplicadas (inglês/espanhol): fica só inglês
  )
  const questions = daArea.sort(() => Math.random() - 0.5).slice(0, limit)

  log.info({ year, discipline, total: questions.length }, 'questões ENEM obtidas')
  return NextResponse.json({ questions })
}, { rateLimit: publicOrAuthCategory })
