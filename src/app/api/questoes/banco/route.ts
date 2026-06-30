import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year       = searchParams.get('year')       ?? '2023'
  const discipline = searchParams.get('discipline') ?? ''
  const limit      = searchParams.get('limit')      ?? '5'
  const offset     = searchParams.get('offset')     ?? '0'

  const url = new URL(`https://api.enem.dev/v1/exams/${year}/questions`)
  url.searchParams.set('limit', limit)
  url.searchParams.set('offset', offset)
  if (discipline) url.searchParams.set('discipline', discipline)

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } })
    if (!res.ok) {
      return NextResponse.json({ error: 'Falha ao buscar questões' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erro de conexão com a API do ENEM' }, { status: 502 })
  }
}
