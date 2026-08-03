# TeraEdu — Handoff

Documento de transição para quem (ou qual sessão) pegar o projeto a partir daqui.
Atualizado em **2026-08-03**. Leia isto antes de mexer em qualquer coisa — tem várias
armadilhas não óbvias documentadas abaixo, várias delas descobertas na marra.

## O que é o projeto

Plataforma de estudos com IA para o ENEM e vestibulares brasileiros (FUVEST, UNICAMP,
UNESP, ITA, IME...). Modelo freemium (Gratuito / Plus / Premium). O dono do projeto é
iniciante em programação — explique decisões técnicas em vez de só aplicá-las quando
fizer mudanças arquiteturais.

- **Produção:** https://useteraedu.com (Vercel, deploy automático no push pra `main`)
- **Repo:** `gabrielgdesign1/TeraEdu`, branch `main`
- **Supabase project ref:** `dgquiamljnxqaaapafgy`

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + React 19
- Supabase (Postgres + Auth), `@supabase/supabase-js` + `@supabase/ssr`
- Anthropic API (`@anthropic-ai/sdk` ^0.106) — **dois modelos**, ver "Roteamento de modelo"
- `pino` para logging estruturado, `@upstash/ratelimit` + `@upstash/redis` para rate limiting
- framer-motion, next-themes, react-markdown/remark/rehype-katex (LaTeX), lucide-react

⚠️ **`AGENTS.md`/`CLAUDE.md` avisam:** esta versão do Next.js pode ter breaking changes
vs. o que está no seu treino — consulte `node_modules/next/dist/docs/` antes de usar uma
API que pareça familiar mas incerta.

## Mapa rápido do código

```
src/
├── app/
│   ├── page.tsx              # landing (não menciona preço nenhum)
│   ├── login/page.tsx        # login + cadastro (mesma página, toggle)
│   ├── redefinir-senha/
│   ├── dashboard/
│   │   ├── page.tsx          # home
│   │   ├── questoes/         # banco + gerar com IA + salvas
│   │   ├── flashcards/, resumos/, tutora/, plano/, desempenho/
│   │   ├── vestibulares/
│   │   ├── planos/           # tela de upgrade (lê lib/planos.ts)
│   │   └── configuracoes/    # Minha Conta / Meus Estudos / Assinatura
│   └── api/
│       ├── auth/{login,signup,recuperar-senha}/   # proxies server-side
│       ├── tutora/, resumos/, resumos/pergunta/, flashcards/,
│       │   plano/gerar/, questoes/gerar/, questoes/corrigir/   # 7 rotas de IA
│       └── questoes/{anos,banco,discursiva,vestibular}/        # leitura pura, sem IA
├── lib/
│   ├── apiHandler.ts         # withLogging(...) — TODA rota passa por aqui
│   ├── creditos.ts           # ⭐ custos, modelos, cálculo de custo USD, RPCs
│   ├── rateLimit.ts          # 12 categorias, sliding window
│   ├── streamErro.ts         # sentinela de erro no stream de questões
│   ├── logger.ts             # pino + redaction
│   ├── supabase.ts           # client browser
│   ├── supabaseServer.ts     # client server-side, getServerUser(), getUserPlano()
│   └── planos.ts             # preços e copy da página de planos
├── hooks/useProfile.ts, useStats.ts
├── components/DashboardSidebar.tsx, HistoryPanel.tsx
└── middleware.ts             # protege /dashboard/* e /login — NÃO cobre /api/*
scripts/eval-plano.mjs        # ⭐ eval do /api/plano/gerar (ver seção própria)
supabase/migrations/          # ⭐ migrations versionadas (novo)
```

---

## ⭐ Sistema de créditos

A peça mais recente e mais importante. **Leia esta seção inteira antes de mexer em
qualquer rota de IA.**

### Tabelas

| Tabela | Conteúdo |
|---|---|
| `uso_ia` | Uma linha por chamada à Anthropic: `user_id`, `acao`, `model`, `input_tokens`, `output_tokens`, `cache_creation_tokens`, `cache_read_tokens`, `custo_usd`, `creditos_debitados`, `sucesso`, `criado_em` |
| `creditos_usuario` | `user_id`, `plano`, `saldo`, `creditos_totais`, `renova_em`, `atualizado_em` |

### 🔑 Por que TODA escrita passa por `SECURITY DEFINER`

**Este projeto não tem `SERVICE_ROLE_KEY`** — só a anon/publishable key. As rotas de API
atuam **como o usuário** (anon key + JWT dele nos cookies).

Consequência: se a RLS permitisse `UPDATE` ao usuário, ele editaria o próprio saldo pelo
navegador. Mas se ela bloqueia o usuário, bloqueia a rota também — porque a rota *é* o
usuário. A saída, sem introduzir service_role, são funções `SECURITY DEFINER`:

- RLS: **só `SELECT` da própria linha**. Nenhuma policy de INSERT/UPDATE/DELETE.
- `garantir_creditos(uuid)` — cria a linha e renova no vencimento. **Revogada de
  `authenticated`**, só chamada internamente.
- `saldo_creditos()` — lê o saldo (e dispara renovação). Executável por `authenticated`.
- `registrar_uso_ia(...)` — grava o uso e debita. Executável por `authenticated`.

**Se for adicionar uma rota de IA nova, siga esse caminho.** Não tente escrever direto nas
tabelas: vai falhar silenciosamente ou dar 42501.

### Custo em créditos por ação

Definido em `src/lib/creditos.ts` (`CUSTO_CREDITOS`):

| Ação | Créditos | Rota | Modelo |
|---|---|---|---|
| `flashcard` | 2 (por card) | `/api/flashcards` | Haiku |
| `questao` | 30 (por questão) | `/api/questoes/gerar` | Sonnet |
| `tutora` | 65 (por mensagem) | `/api/tutora` | Sonnet |
| `resumo` | 60 | `/api/resumos` | Haiku |
| `resumo_pergunta` | 65 | `/api/resumos/pergunta` | Sonnet |
| `plano` | 300 | `/api/plano/gerar` | **condicional** |
| `questao_corrigir` | **0** (grátis) | `/api/questoes/corrigir` | Haiku |

`resumo_pergunta` custa o mesmo que `tutora` **de propósito**: mesmo modelo, mesma
natureza. Se cobrasse menos, viraria um bypass barato da IA Tutora.

`questao_corrigir` é grátis mas **é registrada em `uso_ia`** com `creditos_debitados = 0`,
para você enxergar o custo real dela.

### Créditos por plano

`creditos_do_plano()` no banco: **gratuito 900 · plus 8.000 · premium 13.500**.

O valor do Premium **não é arbitrário**: 13.500 é o ponto de paridade de US$/crédito com o
Plus. `8000 × (39,99 ÷ 23,99) = 13.336`, arredondado pra cima. Com os 17.500 originais, o
Premium entregava 23,8% menos receita por crédito que o Plus, deixando `questao` e `resumo`
com margem negativa só naquele plano.

Detalhe útil: **a razão dos preços cancela o câmbio**, então 13.336 continua sendo o ponto
de paridade independente da cotação do dólar.

### Fluxo em cada rota

1. `if (!authUserId) return 401` — **as 7 rotas agora exigem login** (o middleware não
   cobre `/api/*`, então isso é feito na mão em cada rota).
2. `const sb = await clienteCreditos()` — **crie o client ANTES da chamada à Anthropic**.
   Em `/api/questoes/gerar` o débito acontece dentro do `ReadableStream`, depois que a
   `Response` já foi devolvida, e `cookies()` só existe no escopo do request.
3. Checa saldo contra a **quantidade pedida** → 402 se não tiver.
4. Chama a Anthropic.
5. `registrarUsoSeguro(...)` com `sucesso` e a **quantidade realizada** (cards/questões
   efetivamente gerados, não os pedidos).

**Débito só em sucesso.** Falha de parse, resposta vazia ou truncamento gravam a linha em
`uso_ia` com `sucesso = false` e `creditos_debitados = 0` — o custo em dólar fica
registrado, mas o usuário não paga por uma geração quebrada.

`registrarUsoSeguro` **nunca lança**: contabilidade não pode derrubar uma geração já
entregue. Falhas vão pro log estruturado.

### Custo em USD inclui os tokens de cache

`calcularCustoUsd()` soma `input`, `output`, **`cache_creation × 1,25`** e
**`cache_read × 0,1`**. Isso importa porque `usage.input_tokens` conta só o que **não** veio
do cache — ignorar as colunas de cache subestimaria o custo nas rotas que usam prompt
caching (tutora e resumos/pergunta).

### Margem (referência, câmbio R$5,08 de 2026-07-30)

Plus dá ~US$0,00059 por crédito. No cenário típico:

| Ação | Margem típica | No teto de `max_tokens` |
|---|---|---|
| flashcard | ~49% | — |
| questao | ~57% | ~27% |
| tutora | ~61% | ~−3% |
| resumo (Haiku) | ~65% | ~0% |
| resumo_pergunta | ~45% | negativa |
| plano (Haiku) | ~82% | ~54% |

**Pendência conhecida:** `resumo_pergunta` e `tutora` ficam negativas no teto (input grande).
Não é problema de volume de plano — é preço por ação. Se for ajustar, mexa em
`CUSTO_CREDITOS`, não nos créditos do plano.

---

## ⭐ Roteamento de modelo

`MODELO` em `src/lib/creditos.ts`:

- `MODELO.raciocinio` = `claude-sonnet-4-6` — onde a qualidade de raciocínio importa
- `MODELO.economico` = `claude-haiku-4-5-20251001` — ~3× mais barato, ~2× mais rápido

Sonnet: `tutora`, `resumos/pergunta`, `questoes/gerar`.
Haiku: `flashcards`, `resumos`, `questoes/corrigir`.

### `/api/plano/gerar` é condicional — e o motivo é importante

```ts
const blocos = semanasTotal * diasSemana.length * (duasMaterias ? 2 : 1)
const model = blocos <= LIMITE_BLOCOS_HAIKU ? MODELO.economico : MODELO.raciocinio
```

`LIMITE_BLOCOS_HAIKU = 100`. **Acima disso o Haiku omite `materia2` em alguns dias do
cronograma.** É uma falha silenciosa: o JSON continua estruturalmente válido, a validação
da rota não pega, e o aluno recebe um plano onde alguns dias têm metade do estudo que ele
pediu.

Medições (via `scripts/eval-plano.mjs`):

| Caso | Blocos | Haiku |
|---|---|---|
| ENEM 14×5×1 | 70 | ✅ 100% |
| UNICAMP 7×4×2 | 56 | ✅ 100% |
| FUVEST 15×6×2 | 180 | ❌ falhou em **3 de 6** execuções (18, 15 e 2 dias sem `materia2`) |
| FUVEST 15×6×2, Sonnet | 180 | ✅ 100% |

Um reforço de prompt (lista explícita dos 8 campos obrigatórios + contagem exata de dias)
reduziu muito as omissões — de 18/15 para 2/0/0 — mas **não zerou**, então o roteamento
condicional ficou. O prompt reforçado está nos dois ramos: não custa nada no Sonnet e
reduz risco no Haiku.

### `scripts/eval-plano.mjs`

Roda o prompt **real** da rota (replicado verbatim) contra um modelo e valida com rubrica
objetiva: nº de semanas, dias por semana, dias permitidos, fases, numeração, `materia2` em
todos os dias, `horas2`/`questoes2`, `materia ≠ materia2`, tópicos específicos.

```bash
node scripts/eval-plano.mjs                    # 3 casos, Haiku, 1 repetição
CASO=1 REPS=3 node scripts/eval-plano.mjs      # critério de aceite
MODEL=claude-sonnet-4-6 CASO=1 node scripts/eval-plano.mjs
```

**Critério de aceite para promover um modelo mais barato ao caso grande: ZERO omissões em
3 repetições.** Uma única omissão reprova — a falha é silenciosa demais pra tolerar taxa.
Sai com código 1 se reprovar (serve em CI).

⚠️ **Mantenha sincronizado com a rota.** Se o prompt mudar lá e não aqui, o eval deixa de
medir o que roda em produção.

---

## Preços (atualizados em 2026-08-03)

| Plano | Mensal | Anual | Equivalente mensal | Economia |
|---|---|---|---|---|
| Gratuito | R$ 0 | — | — | — |
| Plus | R$ 23,99 | R$ 239,90 | R$ 19,99 | 17% |
| Premium | R$ 39,99 | R$ 399,90 | R$ 33,33 | 17% |

`economiaAnual` é **derivado** — se mudar preço, recalcule. Os 17% saem de
`23,99×12 = 287,88 → 239,90` (16,67%). Havia um badge `Economize até 28%` hardcoded em
`dashboard/planos/page.tsx` que já foi corrigido, mas fique atento a ele.

⚠️ **Preço aparece em dois lugares:** `lib/planos.ts` (fonte de verdade) e um array
`PLANOS` duplicado e hardcoded em `dashboard/configuracoes/page.tsx`. **Se mudar preço,
mude nos dois.** Vale unificar quando der.

---

## 🛡️ Rate limiting

`src/lib/rateLimit.ts`, 12 categorias, sliding window. É aplicado **antes** do handler, em
`apiHandler.ts:68`.

| Categoria | Limite | Onde |
|---|---|---|
| `apiAuthenticated` / `apiPublic` | 120/min · 40/min por IP | rotas de leitura |
| `login` / `signup` / `passwordRecovery` | 5/10min · 3/h · 3/h | `/api/auth/*` |
| `iaGratuito/Plus/Premium` | 6-15/min por plano | `/api/tutora`, `/api/resumos/pergunta` |
| `geracaoConteudo` | 3/min | flashcards, resumos, plano/gerar, questoes/gerar |
| `uploadPdf` | 5/10min | resumos/flashcards com `origem=pdf` |
| `respostasQuestoes` | 30/min | questoes/corrigir |
| `checkout` | 5/10min | **definida mas não usada** |

**Backend:** Upstash Redis em produção; em dev cai pra limitador em memória (`.env.local`
não tem as vars do Upstash — isso é esperado).

**Armadilhas:**
- A integração Upstash da Vercel pode injetar `UPSTASH_REDIS_REST_KV_REST_API_URL`/`_TOKEN`
  em vez dos nomes padrão. `rateLimit.ts` aceita os dois formatos.
- **Nunca logue `identifier` diretamente** — para login/recuperação ela é `ip:email@x.com`,
  e a redação do pino é por nome de campo, não pega string composta.
- **O slot é consumido mesmo se a geração falhar** (rate limit roda antes do handler). Uma
  falha custa um slot ao usuário. Não foi corrigido; se quiser estornar, é no `apiHandler`.

---

## 🔑 Chave do Supabase — resolvido, mas entenda

Duas issues distintas já aconteceram com `NEXT_PUBLIC_SUPABASE_ANON_KEY`:

1. A variável continha uma `service_role` vazada (ignora RLS).
2. O projeto tem **legacy JWT API keys desativadas** — qualquer chave `eyJ...` recebe
   `401 UNAUTHORIZED_DISABLED_LEGACY_KEY`.

**Fix:** formato novo `sb_publishable_...` (Project Settings → API → Publishable key).
Já aplicado em `.env.local` e na Vercel. **Se algo do Supabase quebrar com erro vago,
confira essa variável primeiro.**

Confirmado em 2026-08-03: a chave atual funciona tanto pra dados (PostgREST) quanto pra auth.

---

## ⚠️ Problemas conhecidos / não resolvidos

1. **[CRÍTICO — agora mais grave] Qualquer usuário pode se dar Premium de graça.**
   `dashboard/planos/page.tsx` (`escolherPlano`) e `configuracoes/page.tsx`
   (`cancelarAssinatura`) fazem `salvarProfile({ plano: id })` — `UPDATE` direto em
   `user_profiles` via client, **sem verificação de pagamento**. A RLS permite
   (`auth.uid() = id`).

   **Isso agora contamina o sistema de créditos:** `creditos_do_plano()` lê
   `user_profiles.plano`, então dois cliques viram 13.500 créditos/mês. Enquanto não houver
   checkout, **o sistema de créditos é contabilidade de custo, não barreira de receita.**

   Quando implementarem checkout, a gravação de `plano` deve sair do client e acontecer só
   via webhook do provedor (server-side, validado por assinatura).

   Mitigação já embutida: **troca de plano NÃO recarrega o saldo** (só a renovação mensal),
   justamente pra alternar plus↔premium não virar refill infinito.

2. **Não existe checkout/pagamento.** A categoria `checkout` no rate limit está pronta
   esperando a rota.

3. **O débito via rota HTTP nunca foi exercitado ponta a ponta.** A lógica de créditos foi
   validada no banco (8/8 cenários) e o gate de login no HTTP (7/7 rotas dão 401), mas a
   costura entre os dois não. Motivo: não deu pra criar usuário de teste — a Supabase
   rejeita domínios fictícios (`email_address_invalid`) e `mailer_autoconfirm: false` exige
   confirmação por e-mail, então nem signup bem-sucedido dá sessão.

   **Primeira coisa a fazer:** logar numa conta real e gerar 1 flashcard, conferindo se a
   linha aparece em `uso_ia` e o saldo cai.

4. **`resumo_pergunta` e `tutora` ficam com margem negativa no teto de tokens.** Ver a
   tabela de margem acima. É preço por ação, não volume de plano.

5. **Lint:** ~21 avisos pré-existentes de `react-hooks/set-state-in-effect` (padrão
   `useEffect(() => setMounted(true), [])` espalhado). Não é regressão, é o estilo já
   estabelecido. **Não "corrigir" sem pedido explícito.**

6. **`/api/flashcards` e `/api/resumos` têm um branch `else` morto** que trata PDF em
   base64. O frontend extrai o texto no navegador e sempre manda `modo=texto` (por causa
   de 413 no payload). O `else` não é inalcançável: pega qualquer `modo` inesperado e aí
   estoura 500 em `arquivo.arrayBuffer()` com `arquivo` null. Vale trocar por
   `else if (modo === 'pdf')` com 400 explícito.

---

## Convenções

- **Toda rota de API nova** usa `withLogging('nome/da/acao', handler, { rateLimit: 'cat' })`
  de `src/lib/apiHandler.ts` — log estruturado, erro 500 padronizado sem vazar stack, e
  rate limit de graça.
- Categoria de rate limit por plano: passe a função `iaCategoryByPlano` em vez de string.
- **Rota de IA nova:** siga o fluxo de 5 passos da seção de créditos, adicione a ação no
  `CHECK` de `uso_ia` (migration nova) e em `CUSTO_CREDITOS`.
- Mensagens de erro pro usuário: português, direto, sem stack trace nunca.
- `EnunciadoTexto` (em `dashboard/questoes/page.tsx`) já destaca citações bibliográficas —
  reuse em vez de reescrever.
- Design tokens em `globals.css` (bg, bg-card, border, text-muted, brand, brand-soft...) —
  não hardcode cor.
- `.motion-safe-ui` marca elementos que devem animar mesmo com `prefers-reduced-motion`.
  `.no-focus-ring` é a exceção da regra global de `:focus-visible` (só no textarea da tutora).
- `maxDuration`: `questoes/gerar` e `plano/gerar` estão em **300s**. Foram 120s e isso
  causava timeout real (Sonnet levou 130,8s num plano de 16 semanas). As demais usam o padrão.

## Ambiente / variáveis

`.env.local` (dev): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(formato `sb_publishable_...`), `ANTHROPIC_API_KEY`. **Não tem** as vars do Upstash —
rate limit em memória localmente, esperado.

`.env.example` documenta tudo. Produção (Vercel) tem tudo, incluindo Upstash via Marketplace.

## Como verificar que algo funciona

Não há suíte de testes automatizados. O padrão usado nas últimas sessões:

1. `npx tsc --noEmit -p .`
2. `npm run build`
3. Exercitar de verdade (dev server + curl ou browser), checando console/network
4. Para o `plano/gerar`: `node scripts/eval-plano.mjs`
5. Para créditos: consultar `uso_ia` e `creditos_usuario` no Supabase

Query útil pra acompanhar custo real vs. estimado:

```sql
SELECT acao, count(*) AS chamadas,
       round(avg(custo_usd),6) AS avg_custo_usd,
       round(avg(creditos_debitados),1) AS avg_creditos,
       count(*) FILTER (WHERE NOT sucesso) AS falhas,
       max(model) AS modelo
FROM uso_ia GROUP BY acao ORDER BY avg(custo_usd) DESC;
```

**Depois de algumas semanas em produção, use essa query pra reavaliar os 300 créditos do
`plano`** — hoje o valor veio de estimativa de teto, não de uso real.

## Migrations

Novidade desta sessão: `supabase/migrations/`. Antes tudo era feito pelo dashboard do
Supabase. A migration do sistema de créditos está em
`20260803120000_sistema_creditos.sql` e **já foi aplicada em produção**.

O MCP do Supabase é instável (deu timeout/connection closed várias vezes nesta sessão) —
se falhar, tente de novo antes de partir pra outra abordagem; costuma voltar.

---
*Este arquivo é um snapshot — não é atualizado automaticamente. Se ficar desatualizado,
corrija-o em vez de ignorá-lo.*
