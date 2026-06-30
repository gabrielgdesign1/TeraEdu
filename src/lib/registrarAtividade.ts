import { createClient } from '@/lib/supabase'

type Tipo = 'questao' | 'flashcard' | 'resumo' | 'tutora' | 'simulado'

export async function registrarAtividade(params: {
  tipo: Tipo
  descricao: string
  materia?: string
  quantidade?: number
  minutos?: number
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 1. Registra no log de atividades
  await supabase.from('user_activities').insert({
    user_id:    user.id,
    tipo:       params.tipo,
    descricao:  params.descricao,
    materia:    params.materia ?? null,
    quantidade: params.quantidade ?? null,
  })

  // 2. Busca stats atuais
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('id', user.id)
    .single()

  const hoje       = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const segunda    = getLunaDaSemana()
  const mesmaSemanana = stats?.semana_referencia === segunda

  // Calcula sequência
  let sequencia = stats?.sequencia_dias ?? 0
  const ultimaAtiv = stats?.ultima_atividade
  if (ultimaAtiv) {
    const diff = diffDias(ultimaAtiv, hoje)
    if (diff === 0)        sequencia = sequencia          // mesmo dia, mantém
    else if (diff === 1)   sequencia = sequencia + 1      // dia seguinte, incrementa
    else                   sequencia = 1                  // quebrou, reinicia
  } else {
    sequencia = 1
  }

  const update = {
    id:              user.id,
    // Questões
    questoes_total:  (stats?.questoes_total ?? 0)  + (params.tipo === 'questao'    ? (params.quantidade ?? 1) : 0),
    questoes_semana: (mesmaSemanana ? (stats?.questoes_semana ?? 0) : 0) + (params.tipo === 'questao'    ? (params.quantidade ?? 1) : 0),
    // Flashcards
    flashcards_total:  (stats?.flashcards_total ?? 0)  + (params.tipo === 'flashcard' ? (params.quantidade ?? 1) : 0),
    flashcards_semana: (mesmaSemanana ? (stats?.flashcards_semana ?? 0) : 0) + (params.tipo === 'flashcard' ? (params.quantidade ?? 1) : 0),
    // Minutos
    minutos_total:  (stats?.minutos_total ?? 0)  + (params.minutos ?? 0),
    minutos_semana: (mesmaSemanana ? (stats?.minutos_semana ?? 0) : 0) + (params.minutos ?? 0),
    // Sequência
    sequencia_dias:    sequencia,
    ultima_atividade:  hoje,
    semana_referencia: segunda,
    atualizado_em:     new Date().toISOString(),
  }

  await supabase.from('user_stats').upsert(update, { onConflict: 'id' })
}

function getLunaDaSemana(): string {
  const d = new Date()
  const dia = d.getDay()           // 0=dom, 1=seg…
  const diff = (dia === 0 ? -6 : 1 - dia)
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function diffDias(a: string, b: string): number {
  const da = new Date(a).getTime()
  const db = new Date(b).getTime()
  return Math.round((db - da) / 86400000)
}
