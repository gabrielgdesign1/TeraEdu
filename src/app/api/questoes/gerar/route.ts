import Anthropic from '@anthropic-ai/sdk'
import { withLogging } from '@/lib/apiHandler'
import { STREAM_ERRO } from '@/lib/streamErro'
import {
  CUSTO_CREDITOS, MODELO, clienteCreditos, saldoAtual,
  registrarUsoSeguro, respostaSemCreditos,
} from '@/lib/creditos'

/* Um lote de 20 questões usa ~17k tokens de saída — a ~70 tok/s isso passa
   fácil de 120s. O teto de 300s é o padrão atual das Vercel Functions. */
export const maxDuration = 300

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const POST = withLogging('questoes/gerar', async (request, { log, authUserId }) => {
  if (!authUserId) {
    return Response.json({ error: 'Faça login para gerar questões.' }, { status: 401 })
  }

  const { vestibular, materia, conteudo, dificuldade, quantidade } = await request.json()

  const nivelMap = {
    facil:   'fácil, com conceitos básicos e diretamente explícitos no conteúdo',
    medio:   'médio, exigindo compreensão e aplicação do conteúdo',
    dificil: 'difícil, com situações-problema que exigem análise e síntese',
  }

  const system = `Você é um especialista em criação de questões para vestibulares brasileiros.
Crie questões no estilo exato do ${vestibular}: linguagem formal, contexto real, 5 alternativas (A a E), apenas uma correta.
Você DEVE responder APENAS com JSON válido, sem markdown, sem texto adicional.
Formato exato:
{
  "questoes": [
    {
      "enunciado": "texto completo da questão com contexto",
      "alternativas": [
        { "letra": "A", "texto": "..." },
        { "letra": "B", "texto": "..." },
        { "letra": "C", "texto": "..." },
        { "letra": "D", "texto": "..." },
        { "letra": "E", "texto": "..." }
      ],
      "resposta": "A",
      "explicacao": "explicação do porquê a alternativa correta é a certa e por que as outras estão erradas"
    }
  ]
}`

  const prompt = `Crie ${quantidade} questões de ${materia} sobre o conteúdo "${conteudo}" no estilo ${vestibular}.
Nível de dificuldade: ${nivelMap[dificuldade as keyof typeof nivelMap]}.
As questões devem testar domínio real do conteúdo "${conteudo}", com enunciados contextualizados como no ${vestibular}.
Para "explicacao", seja claro e direto (3 a 5 frases): por que a alternativa correta está certa e por que as demais estão erradas, sem enrolação.
Responda APENAS o JSON no formato pedido.`

  /* ~850 tokens de orçamento por questão + folga fixa pro envelope do JSON.
     O teto antigo de 8000 saturava a partir de 10 questões, deixando só ~385
     tokens/questão num lote de 20 — o que truncava o JSON no meio.
     O clamp em 20 acompanha o maior lote da UI e evita um "quantidade"
     absurdo vindo do cliente virar um max_tokens inválido. */
  const qtd = Math.min(Math.max(Number(quantidade) || 1, 1), 20)
  const maxTokens = 300 + qtd * 850

  /* Cliente criado AQUI, não dentro do stream: o callback do ReadableStream roda
     depois da Response ser devolvida, e cookies() só existe no escopo do request. */
  const custoPedido = qtd * CUSTO_CREDITOS.questao
  const sb = await clienteCreditos()
  const saldo = await saldoAtual(sb)
  if (saldo < custoPedido) {
    log.warn({ saldo, custoPedido, qtd }, 'sem créditos')
    return respostaSemCreditos(saldo, custoPedido)
  }

  const stream = anthropic.messages.stream({
    model: MODELO.raciocinio,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  })

  const encoder = new TextEncoder()
  const body = new ReadableStream({
    async start(controller) {
      let acumulado = ''
      let falhou = false
      let geradas = 0
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            acumulado += event.delta.text
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }

        /* O stream terminou — confere se o que saiu é JSON parseável de verdade.
           Usa a mesma extração do cliente pra os dois concordarem.
           Causa mais provável de falha aqui: truncamento por max_tokens. */
        try {
          const bloco = acumulado.match(/\{[\s\S]*\}/)
          if (!bloco) throw new Error('nenhum objeto JSON no output')
          const dados = JSON.parse(bloco[0])
          // débito pela quantidade REALIZADA, nunca acima do que foi checado
          geradas = Math.min(dados?.questoes?.length ?? 0, qtd)
          if (geradas === 0) throw new Error('JSON sem questões')
          log.info(
            { vestibular, materia, conteudo, dificuldade, outputChars: acumulado.length, geradas },
            'questões geradas (stream)'
          )
        } catch (parseError) {
          falhou = true
          log.error(
            {
              vestibular, materia, conteudo, dificuldade,
              quantidade: qtd, maxTokens, outputChars: acumulado.length,
              err: parseError instanceof Error ? parseError.message : String(parseError),
            },
            'JSON final inválido (provável truncamento)'
          )
        }
      } catch (error) {
        falhou = true
        log.error(
          { vestibular, materia, err: error instanceof Error ? { name: error.name, message: error.message } : String(error) },
          'falha ao gerar questões (stream)'
        )
      } finally {
        /* Sentinela no fim do stream: o cliente já recebeu o texto parcial,
           então precisa de um marcador explícito pra saber que não deve
           tentar usá-lo. Sem chaves, pra não entrar no regex do cliente. */
        if (falhou) controller.enqueue(encoder.encode(`\n${STREAM_ERRO}`))
        controller.close()

        /* Débito depois do stream fechar. O usage vem do finalMessage()
           acumulado pelo SDK — nunca estimado por caractere. */
        const finalMsg = await stream.finalMessage().catch(() => null)
        await registrarUsoSeguro(sb, log, {
          acao: 'questao', model: MODELO.raciocinio, usage: finalMsg?.usage ?? null,
          creditos: falhou ? 0 : geradas * CUSTO_CREDITOS.questao,
          sucesso: !falhou,
        })
      }
    },
  })

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}, { rateLimit: 'geracaoConteudo', maxBytes: 16_000 })
