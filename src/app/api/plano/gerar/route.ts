import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 120

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

export async function POST(request: Request) {
  try {
    const { vestibular, dataProva, curso, horasPorDia, diasSemana, materiasBoas, materiasDificeis } = await request.json()

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
- ${horasPorDia}h e ${questoesPorDia} questões por sessão
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
        { "diaSemana": "Segunda", "materia": "Matemática", "topico": "Funções do 1º grau: domínio e imagem", "horas": ${horasPorDia}, "questoes": ${questoesPorDia} }
      ]
    }
  ]
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system,
      messages: [{ role: 'user', content: prompt }],
    })

    const texto = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = texto.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON não encontrado na resposta')
    const plano = JSON.parse(jsonMatch[0])

    // Adiciona datas reais e status inicial a cada dia
    for (const semana of plano.semanas) {
      for (const dia of semana.dias) {
        dia.data = addDateToDay(inicioSemana, semana.numero, dia.diaSemana)
        dia.concluido = false
      }
    }

    return Response.json(plano)
  } catch (error) {
    console.error('[plano/gerar]', error)
    return Response.json({ error: 'Erro ao gerar plano' }, { status: 500 })
  }
}
