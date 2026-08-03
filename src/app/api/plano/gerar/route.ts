import Anthropic from '@anthropic-ai/sdk'
import { withLogging } from '@/lib/apiHandler'
import {
  CUSTO_CREDITOS, MODELO, LIMITE_BLOCOS_HAIKU, clienteCreditos, saldoAtual,
  registrarUsoSeguro, respostaSemCreditos,
} from '@/lib/creditos'

/* Um plano de 16 semanas × 6 dias × 2 matérias mede ~12k tokens de saída e
   levou 130s no Sonnet — acima do teto antigo de 120s. 300s é o padrão atual
   das Vercel Functions. */
export const maxDuration = 300

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DIA_IDX: Record<string, number> = {
  'Segunda': 0, 'Terça': 1, 'Quarta': 2, 'Quinta': 3,
  'Sexta': 4, 'Sábado': 5, 'Domingo': 6,
}

function getMondayOfNextWeek(): Date {
  const hoje = new Date()
  const dow = hoje.getDay()
  const daysToMonday = dow === 0 ? 1 : 8 - dow
  const monday = new Date(hoje)
  monday.setDate(hoje.getDate() + daysToMonday)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function addDateToDay(startMonday: Date, semanaNum: number, diaSemana: string): string {
  const d = new Date(startMonday)
  d.setDate(d.getDate() + (semanaNum - 1) * 7 + DIA_IDX[diaSemana])
  return d.toISOString().slice(0, 10)
}

export const POST = withLogging('plano/gerar', async (request, { log, authUserId }) => {
  if (!authUserId) {
    return Response.json({ error: 'Faça login para gerar um plano de estudos.' }, { status: 401 })
  }

  const custo = CUSTO_CREDITOS.plano
  const sb = await clienteCreditos()
  const saldo = await saldoAtual(sb)
  if (saldo < custo) {
    log.warn({ saldo, custo }, 'sem créditos')
    return respostaSemCreditos(saldo, custo)
  }

  try {
    const { vestibular, dataProva, curso, horasPorDia, materiasPorDia = 1, diasSemana, materiasBoas, materiasDificeis } = await request.json()
    const duasMaterias = Number(materiasPorDia) >= 2

    const inicioSemana = getMondayOfNextWeek()
    const provaDate = new Date(dataProva + 'T12:00:00')
    const semanasTotal = Math.max(4, Math.min(20,
      Math.round((provaDate.getTime() - inicioSemana.getTime()) / (7 * 24 * 60 * 60 * 1000))
    ))

    const semBase  = Math.max(2, Math.round(semanasTotal * 0.40))
    const semApro  = Math.max(1, Math.round(semanasTotal * 0.30))
    const semRev   = Math.max(1, Math.round(semanasTotal * 0.20))
    const semFinal = Math.max(1, semanasTotal - semBase - semApro - semRev)

    const questoesPorDia = Math.round(horasPorDia * 7)
    // Com 2 matérias/dia, divide as horas/questões entre os dois blocos
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

    /* Roteamento por tamanho. Acima de ~100 blocos o Haiku começa a omitir a
       segunda matéria em alguns dias — falha silenciosa, porque o JSON continua
       válido. Medido em scripts/eval-plano.mjs. Abaixo disso ele é impecável e
       custa ~3x menos, além de ser ~2x mais rápido. */
    const blocos = semanasTotal * diasSemana.length * (duasMaterias ? 2 : 1)
    const model = blocos <= LIMITE_BLOCOS_HAIKU ? MODELO.economico : MODELO.raciocinio

    const response = await anthropic.messages.create({
      model,
      max_tokens: 16000,
      system,
      messages: [{ role: 'user', content: prompt }],
    })

    const texto = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = texto.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      await registrarUsoSeguro(sb, log, {
        acao: 'plano', model, usage: response.usage, creditos: 0, sucesso: false,
      })
      log.warn({ vestibular, blocos, model, outputChars: texto.length }, 'plano da IA sem JSON válido')
      return Response.json({ error: 'A IA retornou um formato inesperado. Tente novamente.' }, { status: 502 })
    }
    const plano = JSON.parse(jsonMatch[0])

    // Adiciona datas reais e status inicial a cada dia
    for (const semana of plano.semanas) {
      for (const dia of semana.dias) {
        dia.data = addDateToDay(inicioSemana, semana.numero, dia.diaSemana)
        dia.concluido = false
      }
    }

    await registrarUsoSeguro(sb, log, {
      acao: 'plano', model, usage: response.usage, creditos: custo, sucesso: true,
    })

    log.info(
      {
        vestibular, semanas: plano.semanas?.length ?? 0, duasMaterias, blocos, model,
        creditos: custo,
        inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens,
      },
      'plano gerado'
    )
    return Response.json(plano)
  } catch (error) {
    log.error(
      { err: error instanceof Error ? { name: error.name, message: error.message } : String(error) },
      'falha ao gerar plano'
    )
    return Response.json({ error: 'Erro ao gerar plano. Tente novamente.' }, { status: 500 })
  }
}, { rateLimit: 'geracaoConteudo' })
