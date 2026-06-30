/**
 * Importa questões discursivas da UNESP do dataset EduBench (HuggingFace).
 * Ignora: USP, UNICAMP e outros — apenas UNESP.
 * Ignora questões sem resposta oficial (campo answer vazio).
 *
 * Uso: node scripts/import-edubench-unesp.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const HF_BASE =
  'https://datasets-server.huggingface.co/rows' +
  '?dataset=recogna-nlp%2FEduBench&config=default&split=test'

const PAGE_SIZE = 100
const BATCH_SIZE = 50

async function fetchPage(offset) {
  const url = `${HF_BASE}&offset=${offset}&length=${PAGE_SIZE}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HF API error ${res.status} at offset ${offset}`)
  return res.json()
}

function mapRow(row) {
  return {
    question_id:        row.question_id,
    exam:               row.exam,
    year:               row.year ?? null,
    year_version:       row.year_version ?? null,
    subject:            row.subject ?? null,
    question:           row.question,
    supporting_texts:   row.supporting_texts || null,
    answer:             row.answer,
    short_answer:       row.short_answer || null,
    guidelines:         row.guidelines || null,
    image_descriptions: row.image_descriptions ?? [],
    has_images:         row.has_images ?? false,
    difficulty:         row.difficulty ?? null,
    source:             'edubench',
  }
}

async function upsertBatch(rows) {
  const { error } = await supabase
    .from('questoes_discursivas')
    .upsert(rows, { onConflict: 'question_id', ignoreDuplicates: true })
  if (error) throw new Error(`Supabase upsert error: ${error.message}`)
}

async function main() {
  console.log('🔍  Iniciando importação EduBench → UNESP discursiva…\n')

  const first = await fetchPage(0)
  const total = first.num_rows_total ?? 3149
  console.log(`📊  Total de rows no dataset: ${total}`)

  const stats = { importadas: 0, sem_resposta: 0, outros_exams: 0 }
  const examsVistos  = new Set()
  const subjectsUNESP = new Set()

  let batch = []

  function processRow(row) {
    examsVistos.add(row.exam)
    if (row.exam !== 'UNESP') { stats.outros_exams++; return }
    if (!row.answer?.trim())  { stats.sem_resposta++;  return }
    if (row.subject) subjectsUNESP.add(row.subject)
    batch.push(mapRow(row))
  }

  for (const { row } of first.rows) processRow(row)

  for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) {
    process.stdout.write(`\r  ⏳  Offset ${offset}/${total}…`)
    const page = await fetchPage(offset)
    for (const { row } of page.rows) {
      processRow(row)
      if (batch.length >= BATCH_SIZE) {
        await upsertBatch(batch)
        stats.importadas += batch.length
        batch = []
      }
    }
    await new Promise(r => setTimeout(r, 150))
  }

  if (batch.length > 0) {
    await upsertBatch(batch)
    stats.importadas += batch.length
  }

  console.log('\n\n✅  Importação concluída!\n')
  console.log('📋  Exams encontrados no dataset:', [...examsVistos].join(', '))
  console.log('📚  Subjects UNESP importados:',   [...subjectsUNESP].join(', '))
  console.log('\n📈  Stats:')
  console.log(`   Importadas (UNESP com resposta): ${stats.importadas}`)
  console.log(`   Sem resposta oficial (ignoradas): ${stats.sem_resposta}`)
  console.log(`   Outros vestibulares (ignorados):  ${stats.outros_exams}`)
}

main().catch(err => { console.error('\n❌ ', err.message); process.exit(1) })
