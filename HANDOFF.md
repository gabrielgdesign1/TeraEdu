# TeraEdu — Handoff

Documento de transição para a próxima sessão do Claude Code (ou quem pegar o projeto).
Atualizado em **2026-11-21**. Leia isto antes de mexer em qualquer coisa — tem várias
armadilhas não óbvias documentadas abaixo, várias delas descobertas na marra.

## 👉 Onde estamos agora (comece por aqui)

**Estado:** tudo commitado e publicado em produção (último commit desta sessão: botões com
bevel no app todo + hero nova da landing + este handoff). Nada pela metade.

**O que foi feito nas últimas sessões (mais recente primeiro):**

1. **Botões laranja do app inteiro** agora usam `.botao-brand` (gradiente, bevel, brilho) —
   login, redefinir senha, dashboard, questões, flashcards, resumos, tutora, plano, planos,
   configurações, onboarding. Também os chips/toggles *selecionados* (ENEM, matéria, ano,
   quantidade…). Ficaram de fora de propósito: mockups da landing, bolha de chat em resumos
   e o dia de hoje no calendário do plano.
2. **Landing redesenhada** (`src/app/page.tsx`): hero centralizado com `HeroVitrine`
   (painel do app inclinado em 3D sobre um "horizonte" laranja, chips flutuando), sem
   eyebrows nem marquee, todos os cards com `.card-bevel`, features em bento, "Como funciona"
   em escada (título à esquerda), depoimentos em leque (título centralizado), CTA centralizado.
3. **Auditoria de segurança completa** (commit `423eb67`) — ver seção 🔒.
4. **Questões:** fonte/citação em destaque discreto e imagens do ENEM (`QuestaoTexto.tsx`,
   imagens vêm de `https://enem.dev`).
5. **Vestibulares:** edições 2027 com próxima etapa e status dinâmico (o que ainda acontece
   em 2026 continua aparecendo).
6. **Performance:** animações fluidas (regras na seção Convenções), imagens leves, site
   resiliente a queda do Supabase/Redis. Next atualizado para **16.4.6** (resolveu o
   segfault do Turbopack local).

**Próximos passos sugeridos (nenhum foi pedido ainda — pergunte ao dono antes):**

- ⚖️ **Risco legal na landing:** depoimentos são fictícios e o CTA diz "Junte-se a milhares
  de estudantes" (`page.tsx` ~linha 821). Isso pode ser propaganda enganosa (CDC/CONAR).
  Trocar por depoimentos reais ou remover a seção/frase.
- Links do rodapé (`Termos de uso`, `Privacidade`, `Contato`, `page.tsx` ~857) apontam para
  `#`. Criar as páginas (Termos e Privacidade são exigidos pela LGPD).
- Checkout/pagamento ainda não existe (ver Problemas conhecidos).
- Teste ponta a ponta do débito de créditos com uma conta real.
- Abrir na tela as páginas configurações, plano e onboarding para conferir os botões novos
  (só foram verificadas por `tsc`/`build`, não visualmente).

## 🙋 Sobre o dono e como trabalhar com ele

- Iniciante em programação, escreve em **português** — responda em português e explique
  decisões técnicas em vez de só aplicá-las.
- Usa os plugins **caveman** (respostas curtas), **i-have-adhd** (ação primeiro, passos
  numerados) e **ponytail full** (código mínimo; terminar a resposta com 1–2 linhas sobre o
  que foi pulado/riscos).
- **Só commitar/pushar quando ele pedir.** Push na `main` = deploy automático na Vercel.
- A pasta `marketing/` (não versionada) é dele — **nunca commitar**. Use `git add` com
  caminhos específicos, não `git add -A`.
- Nunca imprimir valores de chaves/segredos; mascarar.
- Ele manda screenshots com feedback visual. Confira o resultado com screenshot antes de
  dizer que está pronto.

## O que é o projeto

Plataforma de estudos com IA para o ENEM e vestibulares brasileiros (FUVEST, UNICAMP,
UNESP, ITA, IME...). Modelo freemium (Gratuito / Plus / Premium).

- **Produção:** https://useteraedu.com (Vercel, deploy automático no push pra `main`)
- **Repo:** `gabrielgdesign1/TeraEdu`, branch `main`
- **Supabase project ref:** `dgquiamljnxqaaapafgy`
- Vercel CLI **não** está instalada; o deploy é só via push.

## Stack

- Next.js **16.4.6** (App Router) + TypeScript + Tailwind CSS v4 + React 19
- Supabase (Postgres + Auth), `@supabase/supabase-js` + `@supabase/ssr`
- Anthropic API (`@anthropic-ai/sdk` ^0.106) — **dois modelos**, ver "Roteamento de modelo"
- `pino` para logging estruturado, `@upstash/ratelimit` + `@upstash/redis` para rate limiting
- framer-motion v12, next-themes, react-markdown/remark/rehype-katex (LaTeX), lucide-react,
  pdfjs-dist 6 (extração de PDF no navegador)

⚠️ **`AGENTS.md`/`CLAUDE.md` avisam:** esta versão do Next.js pode ter breaking changes
vs. o que está no seu treino — consulte `node_modules/next/dist/docs/` antes de usar uma
API que pareça familiar mas incerta.

## Mapa rápido do código

```
src/
├── app/
│   ├── page.tsx              # landing (HeroVitrine, bento, escada, depoimentos, CTA)
│   ├── globals.css           # tokens + classes visuais (botao-brand, card-bevel, horizonte...)
│   ├── login/page.tsx        # login + cadastro (mesma página, toggle)
│   ├── redefinir-senha/
│   ├── dashboard/
│   │   ├── page.tsx          # home
│   │   ├── questoes/         # banco + gerar com IA + salvas
│   │   ├── flashcards/, resumos/, tutora/, plano/, desempenho/
│   │   ├── vestibulares/     # calendário de vestibulares (edições 2027)
│   │   ├── planos/           # tela de upgrade (lê lib/planos.ts)
│   │   └── configuracoes/    # Minha Conta / Meus Estudos / Assinatura
│   └── api/
│       ├── auth/{login,signup,recuperar-senha}/   # proxies server-side
│       ├── tutora/, resumos/, resumos/pergunta/, flashcards/,
│       │   plano/gerar/, questoes/gerar/, questoes/corrigir/   # 7 rotas de IA
│       └── questoes/{anos,banco,discursiva,vestibular}/        # leitura pura, sem IA
├── lib/
│   ├── apiHandler.ts         # withLogging(...) — TODA rota passa por aqui (opção maxBytes)
│   ├── authComLimite.ts      # getUserComLimite: checagem de sessão com timeout de 5s
│   ├── creditos.ts           # ⭐ custos, modelos, cálculo de custo USD, RPCs
│   ├── rateLimit.ts          # 12 categorias, sliding window, fallback em memória
│   ├── extractPdfText.ts     # PDF -> texto no navegador
│   ├── flutuar.ts            # helper de animação flutuante em CSS
│   ├── streamErro.ts         # sentinela de erro no stream de questões
│   ├── logger.ts             # pino + redaction
│   ├── supabase.ts           # client browser
│   ├── supabaseServer.ts     # client server-side, getServerUser(), getUserPlano()
│   └── planos.ts             # preços e copy da página de planos
├── hooks/useProfile.ts, useStats.ts
└── components/DashboardSidebar.tsx, HistoryPanel.tsx, Onboarding.tsx, QuestaoTexto.tsx
middleware.ts                 # (na raiz) protege /dashboard/* e /login — NÃO cobre /api/*
next.config.ts                # headers de segurança + CSP
scripts/eval-plano.mjs        # ⭐ eval do /api/plano/gerar (ver seção própria)
supabase/migrations/          # migrations versionadas
```

---

## 🎨 Design / identidade visual

- Laranja da marca `#f97316`, fonte **Space Grotesk**. Tokens em `globals.css`: `--bg`,
  `--bg-card`, `--border`, `--text`, `--text-muted`, `--brand`... Use as classes Tailwind
  (`bg-bg-card`, `text-text-muted`, `border-border`), **não hardcode cor**.
- Tema escuro = classe `.dark` no `<html>` (next-themes). Verifique sempre os dois temas.
- Classes próprias em `globals.css` (CSS **fora de `@layer`**, por isso vencem as
  utilities do Tailwind v4 como `bg-*`, `shadow-*`, `transition`):
  - **`.botao-brand`** — botão laranja padrão do app: gradiente, bevel (inset claro em cima,
    escuro embaixo), brilho laranja, hover mais claro, active afunda 1px. **Todo botão
    primário/selecionado novo deve usar isto** em vez de `bg-brand hover:bg-brand-hover`.
    Pode manter `disabled:opacity-*`, tamanho e arredondamento.
  - **`.card-bevel`** — card com leve gradiente e borda iluminada (versão própria no escuro).
    Todos os cards da landing usam (via `GlassPanel` também).
  - **`.horizonte`** — o arco laranja brilhante atrás do painel da hero.
  - `.flutuar`, `.piscar`, `.virar-card`, `.brilho` — animações/efeitos baratos (ver Convenções).
- Landing: sem "eyebrows" (aquelas etiquetas pequenas acima do título) — o dono não gosta.

---

## ⭐ Sistema de créditos

**Leia esta seção inteira antes de mexer em qualquer rota de IA.**

### Tabelas

| Tabela | Conteúdo |
|---|---|
| `uso_ia` | Uma linha por chamada à Anthropic: `user_id`, `acao`, `model`, `input_tokens`, `output_tokens`, `cache_creation_tokens`, `cache_read_tokens`, `custo_usd`, `creditos_debitados`, `sucesso`, `criado_em` |
| `creditos_usuario` | `user_id`, `plano`, `saldo`, `creditos_totais`, `renova_em`, `atualizado_em` |

### 🔑 Por que TODA escrita passa por `SECURITY DEFINER`

**Este projeto não tem `SERVICE_ROLE_KEY`** — só a anon/publishable key. As rotas de API
atuam **como o usuário** (anon key + JWT dele nos cookies).

Se a RLS permitisse `UPDATE` ao usuário, ele editaria o próprio saldo pelo navegador. Se
bloqueia o usuário, bloqueia a rota também (a rota *é* o usuário). A saída, sem
service_role, são funções `SECURITY DEFINER`:

- RLS: **só `SELECT` da própria linha**. Nenhuma policy de INSERT/UPDATE/DELETE.
- `garantir_creditos(uuid)` — cria a linha e renova no vencimento. **Revogada de
  `authenticated`**, só chamada internamente.
- `saldo_creditos()` — lê o saldo (e dispara renovação). Executável por `authenticated`.
- `registrar_uso_ia(...)` — grava o uso e debita. Executável por `authenticated`.

**Rota de IA nova segue esse caminho.** Escrever direto nas tabelas falha (42501).

### Custo em créditos por ação (`CUSTO_CREDITOS` em `src/lib/creditos.ts`)

| Ação | Créditos | Rota | Modelo |
|---|---|---|---|
| `flashcard` | 2 (por card) | `/api/flashcards` | Haiku |
| `questao` | 30 (por questão) | `/api/questoes/gerar` | Sonnet |
| `tutora` | 65 (por mensagem) | `/api/tutora` | Sonnet |
| `resumo` | 60 | `/api/resumos` | Haiku |
| `resumo_pergunta` | 65 | `/api/resumos/pergunta` | Sonnet |
| `plano` | 300 | `/api/plano/gerar` | **condicional** |
| `questao_corrigir` | **0** (grátis) | `/api/questoes/corrigir` | Haiku |

`resumo_pergunta` custa o mesmo que `tutora` **de propósito** (senão vira bypass barato da
Tutora). `questao_corrigir` é grátis mas é registrada em `uso_ia` com 0 créditos.

### Créditos por plano

`creditos_do_plano()`: **gratuito 900 · plus 8.000 · premium 13.500**. 13.500 é o ponto de
paridade de US$/crédito com o Plus (`8000 × 39,99 ÷ 23,99 = 13.336`, arredondado). A razão
dos preços cancela o câmbio.

### Fluxo em cada rota

1. `if (!authUserId) return 401` — as 7 rotas exigem login (o middleware não cobre `/api/*`).
2. `const sb = await clienteCreditos()` — **antes** da chamada à Anthropic (`cookies()` só
   existe no escopo do request; em `questoes/gerar` o débito ocorre dentro do stream).
3. Checa saldo contra a quantidade pedida → 402 se faltar.
4. Chama a Anthropic.
5. `registrarUsoSeguro(...)` com `sucesso` e a **quantidade realizada**.

**Débito só em sucesso.** Falha grava `sucesso = false`, `creditos_debitados = 0`.
`registrarUsoSeguro` **nunca lança**.

`calcularCustoUsd()` soma input, output, `cache_creation × 1,25` e `cache_read × 0,1`.

### Margem (câmbio R$5,08 de 2026-07-30; Plus ≈ US$0,00059/crédito)

| Ação | Margem típica | No teto de `max_tokens` |
|---|---|---|
| flashcard | ~49% | — |
| questao | ~57% | ~27% |
| tutora | ~61% | ~−3% |
| resumo (Haiku) | ~65% | ~0% |
| resumo_pergunta | ~45% | negativa |
| plano (Haiku) | ~82% | ~54% |

Se ajustar, mexa em `CUSTO_CREDITOS`, não nos créditos do plano.

---

## ⭐ Roteamento de modelo

`MODELO` em `src/lib/creditos.ts`: `raciocinio` = `claude-sonnet-4-6`,
`economico` = `claude-haiku-4-5-20251001`.

Sonnet: tutora, resumos/pergunta, questoes/gerar. Haiku: flashcards, resumos, questoes/corrigir.

### `/api/plano/gerar` é condicional

```ts
const blocos = semanasTotal * diasSemana.length * (duasMaterias ? 2 : 1)
const model = blocos <= LIMITE_BLOCOS_HAIKU ? MODELO.economico : MODELO.raciocinio
```

`LIMITE_BLOCOS_HAIKU = 100`. Acima disso o Haiku **omite `materia2` em alguns dias** — falha
silenciosa (JSON válido, plano incompleto). Medido com `scripts/eval-plano.mjs`
(FUVEST 15×6×2 = 180 blocos: Haiku falhou 3/6, Sonnet 100%).

```bash
node scripts/eval-plano.mjs                    # 3 casos, Haiku, 1 repetição
CASO=1 REPS=3 node scripts/eval-plano.mjs      # critério de aceite
MODEL=claude-sonnet-4-6 CASO=1 node scripts/eval-plano.mjs
```

Critério para promover modelo mais barato: **zero omissões em 3 repetições**. ⚠️ O prompt do
eval é cópia do da rota — mantenha sincronizado.

---

## Preços

| Plano | Mensal | Anual | Equivalente mensal | Economia |
|---|---|---|---|---|
| Gratuito | R$ 0 | — | — | — |
| Plus | R$ 23,99 | R$ 239,90 | R$ 19,99 | 17% |
| Premium | R$ 39,99 | R$ 399,90 | R$ 33,33 | 17% |

⚠️ Preço aparece em **dois lugares**: `lib/planos.ts` (fonte de verdade) e um array `PLANOS`
duplicado em `dashboard/configuracoes/page.tsx`. Mude nos dois (ou unifique).

---

## 🛡️ Rate limiting

`src/lib/rateLimit.ts`, 12 categorias, sliding window, aplicado antes do handler no
`apiHandler.ts`.

| Categoria | Limite | Onde |
|---|---|---|
| `apiAuthenticated` / `apiPublic` | 120/min · 40/min por IP | rotas de leitura |
| `login` / `signup` / `passwordRecovery` | 5/10min · 3/h · 3/h | `/api/auth/*` |
| `iaGratuito/Plus/Premium` | 6-15/min por plano | tutora, resumos/pergunta |
| `geracaoConteudo` | 3/min | flashcards, resumos, plano/gerar, questoes/gerar |
| `uploadPdf` | 5/10min | resumos/flashcards com `origem=pdf` |
| `respostasQuestoes` | 30/min | questoes/corrigir |
| `checkout` | 5/10min | **definida mas não usada** |

- Upstash Redis em produção; em dev, memória (`.env.local` não tem as vars — esperado).
- **Redis fora ou timeout → cai para o limitador em memória**, nunca libera tudo.
- A integração Vercel pode injetar `UPSTASH_REDIS_REST_KV_REST_API_URL`/`_TOKEN`;
  `rateLimit.ts` aceita os dois formatos.
- **Nunca logue `identifier`** (contém e-mail no login/recuperação).
- O slot é consumido mesmo se a geração falhar.

---

## 🔑 Chave do Supabase

`NEXT_PUBLIC_SUPABASE_ANON_KEY` tem de ser o formato novo **`sb_publishable_...`**. Chaves
legadas `eyJ...` dão `401 UNAUTHORIZED_DISABLED_LEGACY_KEY`. Já aplicado em `.env.local` e
na Vercel. Se o Supabase quebrar com erro vago, confira essa variável primeiro.

---

## 🚨 Site lento ou dashboard não abre?

Incidente de 2026-10-30: **Supabase pausado** (`ENOTFOUND` em `*.supabase.co`; reative pelo
dashboard ou `restore_project` do MCP) e **Upstash fora** (`fetch failed`). Diagnóstico:
`get_runtime_logs` da Vercel com `since: "30m"` (plano Hobby guarda 1h) e `get_project` do
Supabase. Desde então o site não trava: sessão com timeout de 5s, Redis com timeout de 1s.

**`middleware.ts` fica na raiz, não em `src/`.** Build e Vercel reconhecem; o `next dev`
**não** — em dev o `/dashboard` abre sem login (útil para ver telas). Para testar o
middleware local, copie temporariamente para `src/middleware.ts`.

---

## 🔒 Segurança (auditoria de 2026-11-17) — não reabrir buracos

- **Toda rota de IA nova declara `maxBytes` no `withLogging`.** Tetos: tutora e
  resumos/pergunta 64 KB, resumos e flashcards 300 KB (PDF cortado em 140 mil caracteres no
  navegador), plano/questões 16 KB.
- **CSP em `next.config.ts`.** Domínio externo novo (imagem, fetch) precisa entrar lá. Hoje:
  `*.supabase.co` e `https://enem.dev`.
- Link de redefinição de senha usa `new URL(req.url).origin`, nunca o header Origin.
- Avatares: bucket só aceita imagem até 3 MB.
- Trigger `proteger_plano` (migration `20261117230000_seguranca_plano_avatares.sql`): usuário
  não consegue trocar o próprio `plano` para pago (42501). Upgrade futuro vem do webhook do
  pagamento com service_role.
- Login e cadastro passam pelo servidor (`/api/auth/*`) com rate limit.

## ⚠️ Problemas conhecidos / não resolvidos

1. **Não existe checkout/pagamento.** Planos pagos mostram "pagamento em breve".
2. **Débito de créditos via HTTP nunca testado ponta a ponta.** Primeiro teste: logar numa
   conta real, gerar 1 flashcard, conferir linha em `uso_ia` e saldo caindo.
3. **Margem negativa no teto** em `resumo_pergunta` e `tutora`.
4. **Lint:** ~21 avisos pré-existentes de `react-hooks/set-state-in-effect`. Estilo
   estabelecido — **não "corrigir" sem pedido.**
5. `/api/flashcards` e `/api/resumos` têm `else` morto que trata PDF base64 e estoura 500 com
   `modo` inesperado. Trocar por `else if (modo === 'pdf')` + 400.
6. Landing: depoimentos fictícios, "milhares de estudantes" e links `#` no rodapé (ver topo).

---

## Convenções

- **Toda rota de API nova** usa `withLogging('nome/da/acao', handler, { rateLimit: 'cat', maxBytes })`.
- Categoria por plano: passe `iaCategoryByPlano` em vez de string.
- **Rota de IA nova:** fluxo de 5 passos dos créditos + ação no `CHECK` de `uso_ia`
  (migration nova) + `CUSTO_CREDITOS`.
- Erros para o usuário: português, direto, sem stack trace.
- Texto de questão (citações/fonte, imagens): use `QuestaoTexto.tsx`, não reescreva.
- `.motion-safe-ui` anima mesmo com `prefers-reduced-motion`; `.no-focus-ring` só no textarea
  da tutora.
- **Animações — regras de performance:**
  - **Loop infinito = CSS, nunca framer-motion** (`.flutuar` + `flutuar()`, `.piscar`, `.virar-card`).
  - **Entradas animam `transform` como string** (`initial={{ transform: 'translateY(24px)' }}`),
    não `y`/`x`/`scale` — assim roda na GPU (WAAPI).
  - **Brilho difuso = `.brilho [--brilho:0.08]`**, nunca `blur-[100px]` grande.
  - `backdrop-blur` só onde o fundo é realmente translúcido.
  - Não anime `width`/`height`/`top`/`left` — use `scaleX`/`translate`.
- `maxDuration`: `questoes/gerar` e `plano/gerar` em **300s**.

## Ambiente / variáveis

`.env.local` (dev): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(`sb_publishable_...`), `ANTHROPIC_API_KEY`. Sem Upstash (esperado). `.env.example` documenta
tudo. Produção (Vercel) tem tudo, incluindo Upstash via Marketplace.

## Como verificar que algo funciona

Não há testes automatizados. Padrão:

1. `npx tsc --noEmit -p .`
2. `npm run build`
3. Dev server: `preview_start` com o nome **"Next.js Dev Server"** (`.claude/launch.json`,
   porta 3000). Conferir telas com screenshot, nos temas claro e escuro, desktop e mobile.
4. `plano/gerar`: `node scripts/eval-plano.mjs`
5. Créditos: consultar `uso_ia` e `creditos_usuario` no Supabase.

Armadilhas de ambiente (Windows): no Git Bash use `MSYS_NO_PATHCONV=1` antes de comandos
com caminhos `/...`. Para editar código, prefira ler o trecho e usar a ferramenta Edit em vez
de scripts de substituição (indentação quebra o match).

```sql
SELECT acao, count(*) AS chamadas,
       round(avg(custo_usd),6) AS avg_custo_usd,
       round(avg(creditos_debitados),1) AS avg_creditos,
       count(*) FILTER (WHERE NOT sucesso) AS falhas,
       max(model) AS modelo
FROM uso_ia GROUP BY acao ORDER BY avg(custo_usd) DESC;
```

## Migrations

`supabase/migrations/` — ambas **já aplicadas em produção**:
`20260803120000_sistema_creditos.sql` e `20261117230000_seguranca_plano_avatares.sql`.
O MCP do Supabase às vezes dá timeout — tente de novo antes de mudar de abordagem.

---
*Snapshot — não é atualizado sozinho. Se ficar desatualizado, corrija em vez de ignorar.*
