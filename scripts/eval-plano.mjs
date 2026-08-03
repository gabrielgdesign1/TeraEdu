/**
 * eval-plano.mjs — avaliação do endpoint /api/plano/gerar
 * ============================================================================
 *
 * O QUE ISTO TESTA
 * ----------------
 * Roda o prompt REAL de /api/plano/gerar (replicado abaixo, verbatim) contra um
 * modelo e valida o cronograma gerado com uma rubrica objetiva:
 *
 *   - nº de semanas bate com o solicitado
 *   - todas as semanas têm o nº certo de dias
 *   - só aparecem os dias da semana que o aluno informou
 *   - fases (Base/Aprofundamento/Revisão/Final) na distribuição correta
 *   - semanas numeradas em ordem
 *   - TODOS os dias têm materia2/topico2 quando o aluno pediu 2 matérias/dia
 *   - horas2/questoes2 presentes
 *   - materia != materia2 no mesmo dia
 *   - tópicos específicos (não genéricos)
 *
 * POR QUE ELE EXISTE
 * ------------------
 * O Haiku 4.5 é ~3x mais barato e ~2x mais rápido que o Sonnet nesta rota, mas
 * acima de ~100 blocos (semanas × dias × matérias/dia) ele OMITE a segunda
 * matéria em alguns dias. É uma falha silenciosa: o JSON continua
 * estruturalmente válido, a validação da rota não pega, e o aluno recebe um
 * cronograma com metade do estudo em alguns dias.
 *
 * Medições que motivaram o roteamento condicional atual:
 *   - 70 blocos  (ENEM 14x5x1):    Haiku 100% ok
 *   - 56 blocos  (UNICAMP 7x4x2):  Haiku 100% ok
 *   - 180 blocos (FUVEST 15x6x2):  Haiku falhou em 3 de 6 execuções
 *                                  (18, 15 e 2 dias sem materia2)
 *   - 180 blocos, Sonnet:          100% ok
 *
 * Daí LIMITE_BLOCOS_HAIKU = 100 em src/lib/creditos.ts.
 *
 * CRITÉRIO DE ACEITE
 * ------------------
 * Para promover um modelo mais barato ao caso grande:
 *   ZERO omissões em 3 repetições do caso >= 100 blocos (CASO=1 REPS=3).
 * Uma única omissão reprova — não é taxa aceitável, porque a falha é silenciosa.
 *
 * COMO RODAR
 * ----------
 *   node scripts/eval-plano.mjs                      # 3 casos, Haiku, 1 rep
 *   CASO=1 REPS=3 node scripts/eval-plano.mjs        # critério de aceite
 *   MODEL=claude-sonnet-4-6 CASO=1 node scripts/eval-plano.mjs
 *
 * Lê ANTHROPIC_API_KEY de .env.local. Consome créditos reais da Anthropic
 * (~US$0,06 por execução do caso FUVEST no Haiku).
 *
 * MANTENHA SINCRONIZADO com src/app/api/plano/gerar/route.ts — se o prompt
 * mudar lá e não aqui, este eval deixa de medir o que roda em produção.
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

const env = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const key = env.match(/ANTHROPIC_API_KEY\s*=\s*(.+)/)[1].trim().replace(/^["']|["']$/g, '')
const anthropic = new Anthropic({ apiKey: key })

// ── réplica verbatim da construção de prompt da rota ───────────────────────
function montar({ vestibular, dataProva, curso, horasPorDia, materiasPorDia, diasSemana, materiasBoas, materiasDificeis }) {
  const duasMaterias = Number(materiasPorDia) >= 2
  const hoje = new Date()
  const dow = hoje.getDay()
  const monday = new Date(hoje)
  monday.setDate(hoje.getDate() + (dow === 0 ? 1 : 8 - dow))
  monday.setHours(0, 0, 0, 0)
  const provaDate = new Date(dataProva + 'T12:00:00')
  const semanasTotal = Math.max(4, Math.min(20, Math.round((provaDate - monday) / (7 * 24 * 60 * 60 * 1000))))
  const semBase  = Math.max(2, Math.round(semanasTotal * 0.40))
  const semApro  = Math.max(1, Math.round(semanasTotal * 0.30))
  const semRev   = Math.max(1, Math.round(semanasTotal * 0.20))
  const semFinal = Math.max(1, semanasTotal - semBase - semApro - semRev)
  const questoesPorDia = Math.round(horasPorDia * 7)
  const horasBloco    = duasMaterias ? Math.max(1, Math.round(horasPorDia / 2)) : horasPorDia
  const questoesBloco = duasMaterias ? Math.max(1, Math.round(questoesPorDia / 2)) : questoesPorDia

  const system = `Você é um especialista em planos de estudos para vestibulares brasileiros.
Crie planos personalizados e progressivos. Priorize matérias difíceis nas primeiras fases.
Responda APENAS com JSON válido, sem markdown, sem texto adicional.`

  const prompt = `Crie um plano de estudos completo para ${vestibular}.

Dados do aluno:
- Curso desejado: ${curso || 'Não especificado'}
- Data da prova: ${dataProva}
- Horas por dia: ${horasPorDia}h
- Dias disponíveis por semana: ${diasSemana.join(', ')}
- Matérias que domina bem: ${materiasBoas.length ? materiasBoas.join(', ') : 'Nenhuma especificada'}
- Matérias com dificuldade: ${materiasDificeis.length ? materiasDificeis.join(', ') : 'Nenhuma especificada'}

Número total de semanas: ${semanasTotal}
Distribuição das fases:
- Fase "Base": semanas 1 a ${semBase} (${semBase} semanas)
- Fase "Aprofundamento": semanas ${semBase + 1} a ${semBase + semApro} (${semApro} semanas)
- Fase "Revisão": semanas ${semBase + semApro + 1} a ${semBase + semApro + semRev} (${semRev} semanas)
- Fase "Final": semanas ${semBase + semApro + semRev + 1} a ${semanasTotal} (${semFinal} semana${semFinal > 1 ? 's' : ''})

Regras:
- Use APENAS os dias: ${diasSemana.join(', ')} em cada semana
- ${duasMaterias
    ? `DUAS matérias por dia, em DOIS blocos, cada bloco com ${horasBloco}h e ${questoesBloco} questões. Os dois blocos são obrigatórios em TODOS os dias, e as matérias dos dois blocos devem ser DIFERENTES entre si`
    : `${horasPorDia}h e ${questoesPorDia} questões por sessão`}
- Na Fase Base: priorize matérias difíceis (aparecerão mais vezes), matérias fáceis menos
- Na Fase Aprofundamento: aprofunde os tópicos, mais questões complexas
- Na Fase Revisão: revise todas as matérias, foco nas difíceis
- Na Fase Final: revisão leve, manutenção mental
- Tópicos devem ser específicos (ex: "Geometria plana: áreas e perímetros")

Retorne SOMENTE este JSON (${semanasTotal} semanas, cada semana com ${diasSemana.length} dias):
{
  "semanas": [
    {
      "numero": 1,
      "fase": "Base",
      "dias": [
        ${duasMaterias
          ? `{ "diaSemana": "Segunda", "materia": "Matemática", "topico": "Funções do 1º grau: domínio e imagem", "horas": ${horasBloco}, "questoes": ${questoesBloco}, "materia2": "Química", "topico2": "Estequiometria: cálculos básicos", "horas2": ${horasBloco}, "questoes2": ${questoesBloco} }`
          : `{ "diaSemana": "Segunda", "materia": "Matemática", "topico": "Funções do 1º grau: domínio e imagem", "horas": ${horasPorDia}, "questoes": ${questoesPorDia} }`}
      ]
    }
  ]
}${duasMaterias ? `

IMPORTANTE — verifique antes de responder. O cronograma tem exatamente ${semanasTotal * diasSemana.length} dias (${semanasTotal} semanas × ${diasSemana.length} dias). Em CADA UM desses dias, sem nenhuma exceção:
- Os 8 campos devem estar preenchidos: "materia", "topico", "horas", "questoes", "materia2", "topico2", "horas2", "questoes2".
- Nenhum dia pode ter apenas uma matéria. Um dia sem "materia2" e "topico2" torna o plano inválido.
- "materia" e "materia2" do mesmo dia devem ser DIFERENTES entre si.
Não abrevie, não use reticências e não omita dias ou campos para encurtar a resposta.` : ''}`

  const blocos = semanasTotal * diasSemana.length * (duasMaterias ? 2 : 1)
  return { system, prompt, semanasTotal, semBase, semApro, semRev, duasMaterias, diasSemana, blocos }
}

function avaliar(plano, m) {
  const r = []
  const semanas = plano?.semanas ?? []
  r.push(['nº de semanas', semanas.length === m.semanasTotal, `${semanas.length}/${m.semanasTotal}`])

  const diasOk = semanas.every(s => (s.dias?.length ?? 0) === m.diasSemana.length)
  r.push(['dias por semana', diasOk, diasOk ? 'todas ok' : semanas.map(s => s.dias?.length).join(',')])

  const permitidos = new Set(m.diasSemana)
  const inval = semanas.flatMap(s => (s.dias || []).map(d => d.diaSemana)).filter(d => !permitidos.has(d))
  r.push(['só dias permitidos', inval.length === 0, inval.length ? [...new Set(inval)].join(',') : 'ok'])

  const esperadas = []
  for (let i = 1; i <= m.semanasTotal; i++) {
    if (i <= m.semBase) esperadas.push('Base')
    else if (i <= m.semBase + m.semApro) esperadas.push('Aprofundamento')
    else if (i <= m.semBase + m.semApro + m.semRev) esperadas.push('Revisão')
    else esperadas.push('Final')
  }
  r.push(['fases corretas', semanas.every((s, i) => s.fase === esperadas[i]), 'ok'])
  r.push(['numeração', semanas.every((s, i) => s.numero === i + 1), 'ok'])

  const todos = semanas.flatMap(s => s.dias || [])
  if (m.duasMaterias) {
    const semM2     = todos.filter(d => !d.materia2 || !d.topico2)
    const semCampos = todos.filter(d => d.horas2 === undefined || d.questoes2 === undefined)
    const iguais    = todos.filter(d => d.materia && d.materia2 && d.materia === d.materia2)
    r.push(['TODOS os dias com materia2', semM2.length === 0,
            semM2.length ? `${semM2.length}/${todos.length} SEM` : `${todos.length}/${todos.length} ok`])
    r.push(['horas2/questoes2 presentes', semCampos.length === 0, semCampos.length ? `${semCampos.length} incompletos` : 'ok'])
    r.push(['materia ≠ materia2', iguais.length === 0, iguais.length ? `${iguais.length} iguais` : 'ok'])
  }

  const tops = todos.map(d => d.topico).filter(Boolean)
  const gen  = tops.filter(t => t.length < 15 || !/[:\-–]/.test(t))
  r.push(['tópicos específicos', gen.length <= tops.length * 0.15, `${tops.length - gen.length}/${tops.length}`])
  return r
}

const CASOS = [
  { nome: 'ENEM · 1 matéria/dia · 5 dias',
    inp: { vestibular: 'ENEM', dataProva: '2026-11-08', curso: 'Medicina', horasPorDia: 3, materiasPorDia: 1,
           diasSemana: ['Segunda','Terça','Quarta','Quinta','Sexta'],
           materiasBoas: ['História','Geografia'], materiasDificeis: ['Matemática','Física'] } },
  { nome: 'FUVEST · 2 matérias/dia · 6 dias  ← caso ≥100 blocos',
    inp: { vestibular: 'FUVEST', dataProva: '2026-11-22', curso: 'Engenharia', horasPorDia: 4, materiasPorDia: 2,
           diasSemana: ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
           materiasBoas: ['Português'], materiasDificeis: ['Química','Física','Matemática'] } },
  { nome: 'UNICAMP · 2 matérias/dia · 4 dias',
    inp: { vestibular: 'UNICAMP', dataProva: '2026-09-20', curso: 'Direito', horasPorDia: 2, materiasPorDia: 2,
           diasSemana: ['Segunda','Quarta','Sexta','Domingo'],
           materiasBoas: ['Literatura'], materiasDificeis: ['Matemática'] } },
]

const MODEL = process.env.MODEL || 'claude-haiku-4-5-20251001'
const casos  = CASOS.filter((_, i) => !process.env.CASO || String(i) === process.env.CASO)
const reps   = Number(process.env.REPS || 1)

let reprovou = false

for (const caso of casos) {
  const m = montar(caso.inp)
  console.log(`\n${'═'.repeat(76)}\n▶ ${caso.nome}\n  ${m.semanasTotal} semanas × ${m.diasSemana.length} dias${m.duasMaterias ? ' × 2 matérias' : ''} = ${m.blocos} blocos · modelo ${MODEL}\n${'═'.repeat(76)}`)

  for (let i = 1; i <= reps; i++) {
    const t0 = Date.now()
    let plano = null, erro = null, usage = null
    try {
      const res = await anthropic.messages.create({
        model: MODEL, max_tokens: 16000, system: m.system,
        messages: [{ role: 'user', content: m.prompt }],
      })
      usage = res.usage
      const txt = res.content[0].type === 'text' ? res.content[0].text : ''
      const match = txt.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('sem JSON no output')
      plano = JSON.parse(match[0])
    } catch (e) { erro = e.message }

    const dt = ((Date.now() - t0) / 1000).toFixed(1)
    const preco = MODEL.includes('haiku') ? { i: 1, o: 5 } : { i: 3, o: 15 }
    const custo = usage ? (usage.input_tokens * preco.i + usage.output_tokens * preco.o) / 1e6 : 0

    console.log(`\n  ── rep ${i}/${reps} ── ${dt}s · out ${usage?.output_tokens ?? '?'} tok · $${custo.toFixed(5)}`)
    if (erro) { console.log(`     ❌ FALHOU: ${erro}`); reprovou = true; continue }
    for (const [check, ok, det] of avaliar(plano, m)) {
      if (!ok) reprovou = true
      console.log(`     ${ok ? '✅' : '❌'} ${check.padEnd(28)} ${det}`)
    }
  }
}

console.log(`\n${'─'.repeat(76)}`)
console.log(reprovou
  ? '❌ REPROVADO — houve pelo menos uma falha. Não promova este modelo.'
  : '✅ APROVADO — nenhuma falha nas execuções acima.')
process.exit(reprovou ? 1 : 0)
