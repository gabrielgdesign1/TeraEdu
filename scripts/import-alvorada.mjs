/**
 * Importa questões do Alvorada-Bench (HuggingFace) para o Supabase.
 * Ignora completamente o ENEM (já atendido pela api.enem.dev).
 *
 * Uso: node scripts/import-alvorada.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const HF_BASE =
  'https://datasets-server.huggingface.co/rows' +
  '?dataset=HenriqueGodoy%2FAlvorada-bench&config=questions&split=train'

const PAGE_SIZE = 100
const BATCH_SIZE = 50   // upserts por chamada ao Supabase

// ──────────────────────────────────────────────────────────────────────────────

async function fetchPage(offset) {
  const url = `${HF_BASE}&offset=${offset}&length=${PAGE_SIZE}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HF API error ${res.status} at offset ${offset}`)
  return res.json()
}

function mapRow(row) {
  return {
    question_id:        row.question_id,
    exam_type:          row.exam_type,
    exam_name:          row.exam_name,
    exam_year:          row.exam_year ?? null,
    subject:            row.subject    ?? null,
    question_statement: row.question_statement,
    correct_answer:     row.correct_answer,
    alternative_a:      row.alternative_a ?? null,
    alternative_b:      row.alternative_b ?? null,
    alternative_c:      row.alternative_c ?? null,
    alternative_d:      row.alternative_d ?? null,
    alternative_e:      row.alternative_e ?? null,
    source:             'alvorada-bench',
  }
}

async function upsertBatch(rows) {
  const { error } = await supabase
    .from('banco_questoes')
    .upsert(rows, { onConflict: 'question_id', ignoreDuplicates: true })
  if (error) throw new Error(`Supabase upsert error: ${error.message}`)
}

// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍  Iniciando importação do Alvorada-Bench…\n')

  // Primeira chamada para saber o total
  const first = await fetchPage(0)
  const total = first.num_rows_total ?? 4515
  console.log(`📊  Total de rows no dataset: ${total}`)

  const stats = { importadas: 0, ignoradas_enem: 0, duplicatas: 0 }
  const examTypes  = new Set()
  const examNames  = new Set()
  const subjects   = new Set()

  let batch = []

  // Processa a primeira página
  for (const { row } of first.rows) {
    examTypes.add(row.exam_type)
    examNames.add(row.exam_name)
    if (row.subject) subjects.add(`${row.exam_type}::${row.subject}`)

    if (row.exam_type === 'enem') { stats.ignoradas_enem++; continue }
    batch.push(mapRow(row))
  }

  // Pagina o restante
  for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) {
    process.stdout.write(`\r  ⏳  Buscando offset ${offset}/${total}…`)
    const page = await fetchPage(offset)

    for (const { row } of page.rows) {
      examTypes.add(row.exam_type)
      examNames.add(row.exam_name)
      if (row.subject) subjects.add(`${row.exam_type}::${row.subject}`)

      if (row.exam_type === 'enem') { stats.ignoradas_enem++; continue }
      batch.push(mapRow(row))

      if (batch.length >= BATCH_SIZE) {
        await upsertBatch(batch)
        stats.importadas += batch.length
        batch = []
      }
    }

    // Pequena pausa para não estourar rate limit do HF
    await new Promise(r => setTimeout(r, 200))
  }

  // Flush restante
  if (batch.length > 0) {
    await upsertBatch(batch)
    stats.importadas += batch.length
  }

  console.log('\n\n✅  Importação concluída!\n')
  console.log('📋  Valores únicos encontrados:')
  console.log('  exam_type:', [...examTypes].join(', '))
  console.log('  exam_name (sample):', [...examNames].slice(0, 10).join(', '), '…')
  console.log('  subject por exam_type:')
  for (const s of [...subjects].sort()) console.log('   ', s)
  console.log('\n📈  Stats:')
  console.log(`   Importadas: ${stats.importadas}`)
  console.log(`   ENEM ignorado: ${stats.ignoradas_enem}`)
}

main().catch(err => { console.error('\n❌ ', err.message); process.exit(1) })
