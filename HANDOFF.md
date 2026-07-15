# TeraEdu — Handoff

Documento de transição para quem (ou qual sessão) pegar o projeto a partir daqui. Escrito em 2026-07-15. Leia isto antes de mexer em qualquer coisa — tem várias armadilhas não óbvias documentadas abaixo.

## O que é o projeto

Plataforma de estudos com IA para o ENEM e vestibulares brasileiros (FUVEST, UNICAMP, UNESP, ITA, IME...). Modelo freemium (Gratuito / Plus / Premium). O dono do projeto é iniciante em programação — explique decisões técnicas em vez de só aplicá-las quando fizer mudanças arquiteturais.

- **Produção:** https://useteraedu.com (Vercel)
- **Repo:** `gabrielgdesign1/TeraEdu`, branch `main`
- **Supabase project ref:** `dgquiamljnxqaaapafgy`

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + React 19
- Supabase (Postgres + Auth), `@supabase/supabase-js` + `@supabase/ssr`
- Anthropic API (`@anthropic-ai/sdk`), modelo `claude-sonnet-4-6` em quase tudo, `claude-haiku-4-5-20251001` na correção de discursivas
- `pino` para logging estruturado, `@upstash/ratelimit` + `@upstash/redis` para rate limiting
- framer-motion, next-themes, react-markdown/remark/rehype-katex (LaTeX), lucide-react

⚠️ **`AGENTS.md`/`CLAUDE.md` avisam:** esta versão do Next.js pode ter breaking changes vs. o que está no seu treino — consulte `node_modules/next/dist/docs/` antes de usar uma API que pareça familiar mas incerta.

## Mapa rápido do código

```
src/
├── app/
│   ├── page.tsx              # landing page
│   ├── login/page.tsx        # login + cadastro (mesma página, toggle)
│   ├── redefinir-senha/      # confirmação de nova senha (via link do e-mail)
│   ├── dashboard/
│   │   ├── page.tsx          # home
│   │   ├── questoes/         # banco de questões + gerar com IA + salvas
│   │   ├── flashcards/, resumos/, tutora/, plano/, desempenho/
│   │   ├── vestibulares/     # datas/info oficiais
│   │   ├── planos/           # "Fazer upgrade" (⚠️ ver Problema Conhecido #1)
│   │   └── configuracoes/    # Minha Conta / Meus Estudos / Assinatura
│   └── api/
│       ├── auth/{login,signup,recuperar-senha}/route.ts   # proxies server-side (NÃO client direto)
│       ├── tutora/, resumos/, resumos/pergunta/, flashcards/, plano/gerar/, questoes/gerar/, questoes/corrigir/  # rotas com IA (Anthropic)
│       └── questoes/{anos,banco,discursiva,vestibular}/    # leitura pura do Supabase/ENEM, sem IA
├── lib/
│   ├── apiHandler.ts         # withLogging(action, handler, { rateLimit? }) — TODA rota passa por aqui
│   ├── rateLimit.ts          # motor central de rate limit, 12 categorias (ver seção própria abaixo)
│   ├── logger.ts             # pino + redaction (senha/token/email/conteúdo nunca vazam pro log)
│   ├── supabase.ts           # client browser (createBrowserClient)
│   ├── supabaseServer.ts     # client server-side (cookies via next/headers) — getServerUser(), getUserPlano()
│   └── planos.ts             # PlanoId, preços, features (conteúdo de marketing, não é fonte de verdade de limites)
├── hooks/useProfile.ts, useStats.ts
├── components/DashboardSidebar.tsx, HistoryPanel.tsx  # ambos com versão mobile embutida (nav inferior + drawer)
└── middleware.ts             # só protege /dashboard/* e /login — NÃO cobre /api/*
```

## O que foi feito recentemente (mais recente primeiro)

1. **Rate limiting completo** (`e120001`, `bd441c3`) — ver seção dedicada abaixo, é a peça mais importante e recente.
2. **Correções de UI em Questões** (`de1e498`, `3b1d8e6`, `7d715d2`) — cards centralizados, citações bibliográficas (`Disponível em:... Acesso em:...`) em fonte menor/apagada, geração de questões por IA com streaming + progresso ao vivo, borda de foco duplicada na IA Tutora removida.
3. **Interface mobile completa** (`f45347e`) — sidebar vira barra inferior + drawer "Mais" no mobile; a causa raiz de tudo "parecer quebrado" no mobile era a **ausência da meta tag de viewport** em `layout.tsx` (agora corrigida). Também corrigido um bug clássico de flexbox (`<main>` sem `min-w-0` deixava conteúdo com overflow-x-auto alargar a página inteira).
4. **Rate limit / logging / segurança** (`31bc7ed` e a sessão de rate limit) — logger pino estruturado em todas as rotas.
5. **Correções de segurança na chave do Supabase** — ver "Problema Resolvido" abaixo, é importante entender o que aconteceu aqui.

## 🔑 Chave do Supabase — resolvido, mas entenda o porquê

O projeto teve **duas** issues distintas com `NEXT_PUBLIC_SUPABASE_ANON_KEY`, nessa ordem:

1. A variável continha uma chave `service_role` vazada (ignora RLS por completo) em vez da anon key. Corrigido trocando pela anon key real.
2. Depois disso, descobrimos que o projeto Supabase **tem as legacy JWT API keys desativadas** — qualquer chave no formato antigo `eyJ...` (mesmo sendo a anon key certa) recebe `401 UNAUTHORIZED_DISABLED_LEGACY_KEY` em toda chamada. A causa raiz por trás de vários bugs que pareciam não relacionados: banco de questões do FUVEST/UNICAMP falhando ("Não foi possível carregar as questões"), `auth.getUser()` retornando null mesmo logado, saves no Supabase falhando silenciosamente.

**Fix final:** usar o formato novo `sb_publishable_...` (Project Settings → API → Publishable key, ou MCP `get_publishable_keys`). Já aplicado em `.env.local` e na Vercel; legacy keys desativadas no Supabase. **Se algo do Supabase quebrar de novo com erro vago/vazio, confira essa variável primeiro.**

## 🛡️ Rate limiting — arquitetura

`src/lib/rateLimit.ts` é a fonte única de verdade. 12 categorias, sliding window:

| Categoria | Limite | Onde é aplicado |
|---|---|---|
| `apiAuthenticated` | 120/min | rotas de leitura (questões/anos, banco, discursiva, vestibular) quando logado |
| `apiPublic` | 40/min por IP | mesmas rotas, anônimo |
| `login` | 5/10min por IP+e-mail | `/api/auth/login` |
| `signup` | 3/hora por IP | `/api/auth/signup` |
| `passwordRecovery` | 3/hora por e-mail | `/api/auth/recuperar-senha` |
| `iaGratuito/Plus/Premium` | 6-15/min + rajada 2-4/10s, por plano | `/api/tutora`, `/api/resumos/pergunta` |
| `geracaoConteudo` | 3/min | flashcards, resumos, plano/gerar, questoes/gerar |
| `uploadPdf` | 5/10min | resumos/flashcards quando `origem=pdf` no FormData |
| `respostasQuestoes` | 30/min | questoes/corrigir |
| `checkout` | 5/10min | **definida mas não usada — não existe rota de checkout ainda** |

**Backend:** Upstash Redis quando `UPSTASH_REDIS_REST_URL`+`_TOKEN` (ou `UPSTASH_REDIS_REST_KV_REST_API_URL`+`_TOKEN` — ver armadilha abaixo) estão configurados. Sem isso, cai pra um limitador em memória (só serve pra 1 instância, é o que roda em **dev local hoje** — `.env.local` não tem as vars do Upstash). Produção usa Upstash de verdade, **já testado e confirmado funcionando** em https://useteraedu.com (bati o limite de login de propósito e recebi 429 real).

**Armadilhas:**
- A integração do Upstash via Vercel Marketplace pode injetar `UPSTASH_REDIS_REST_KV_REST_API_URL`/`_TOKEN` em vez dos nomes padrão do SDK — `rateLimit.ts` já aceita os dois formatos, mas se trocar de provider/integração confira os nomes reais das env vars antes de assumir.
- **Nunca logue a variável `identifier` diretamente** — para login/recuperar-senha ela é uma string tipo `ip:usuario@email.com`, e a redação do pino é por nome de campo (`email`), não pega uma string composta. Já tem um `log.warn` em `apiHandler.ts` que deliberadamente omite esse campo; mantenha esse padrão em código novo.
- Login/cadastro/recuperação de senha **não passam mais pelo client Supabase direto do navegador** — foram movidos para `/api/auth/*` (proxies server-side) justamente para dar pra aplicar rate limit neles. Se for mexer nesses fluxos, mexa nas rotas server-side, não em `supabase.auth.*` direto no componente.
- Upload de PDF (resumos/flashcards): o PDF é extraído **no navegador** e enviado como `modo=texto` (pra não estourar limite de payload da function). Por isso tem um campo extra `origem=pdf` no FormData só pra o servidor saber aplicar o rate limit de upload certo — se adicionar um novo fluxo de upload, replique esse padrão.

## ⚠️ Problemas conhecidos / não resolvidos

1. **[Segurança/negócio] Qualquer usuário pode "assinar" Plus/Premium de graça.** `src/app/dashboard/planos/page.tsx` (`escolherPlano`) e `src/app/dashboard/configuracoes/page.tsx` (`cancelarAssinatura`) fazem `salvarProfile({ plano: id })` — um `UPDATE` direto na tabela `user_profiles` via client Supabase, **sem nenhuma verificação de pagamento**. A RLS permite (`auth.uid() = id`), então tecnicamente funciona, mas não há Stripe/checkout nenhum por trás. Isso não foi pedido para corrigir ainda — só está documentado aqui para não ser confundido com um sistema de pagamento real. Quando implementarem checkout de verdade, essa gravação direta do `plano` deve ser removida do client e passar a acontecer só via webhook do provedor de pagamento (server-side, validado por assinatura).
2. **Não existe checkout/pagamento nenhum implementado.** A categoria `checkout` no rate limit já está pronta esperando essa rota.
3. Lint tem ~21 avisos pré-existentes de `react-hooks/set-state-in-effect` (padrão `useEffect(() => setMounted(true), [])` espalhado pelo código todo, presente desde antes dessas sessões) — não é regressão, é o estilo já estabelecido no projeto. Não "corrigir" isso sem que peçam explicitamente, é uma mudança grande e não solicitada.

## Convenções que vale a pena seguir

- **Toda rota de API nova** deve usar `withLogging('nome/da/acao', handler, { rateLimit: 'categoria' })` de `src/lib/apiHandler.ts` — dá log estruturado, tratamento de erro padronizado (500 sem vazar stack) e rate limit de graça. Ver qualquer rota em `src/app/api/questoes/` como exemplo.
- Pra decidir categoria de rate limit por plano do usuário, passe uma função em vez de string fixa: `{ rateLimit: iaCategoryByPlano }` (helper já pronto em `rateLimit.ts`).
- Mensagens de erro pro usuário: português, direto, sem stack trace nunca.
- `EnunciadoTexto` (em `src/app/dashboard/questoes/page.tsx`) já cuida de destacar citações bibliográficas em fonte menor — reuse em vez de reescrever se aparecer texto de questão em outro lugar.
- Design tokens em `globals.css` (bg, bg-card, border, text-muted, brand, brand-soft...) — não hardcode cor.
- `.motion-safe-ui` (classe CSS) marca elementos que devem animar mesmo com `prefers-reduced-motion: reduce` ativo (usado na sidebar/flip de flashcard, que são funcionais, não decorativos). A regra global de `:focus-visible` também tem uma exceção via `.no-focus-ring` — usada hoje só no textarea da IA Tutora.

## Ambiente / variáveis

`.env.local` (dev) tem: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (formato `sb_publishable_...`), `ANTHROPIC_API_KEY`. **Não tem** as vars do Upstash — rate limit roda em memória localmente, isso é esperado.

`.env.example` documenta tudo, incluindo como provisionar Upstash grátis. Produção (Vercel) tem tudo configurado, incluindo Upstash via Marketplace.

## Como verificar que algo funciona

Este projeto não tem suite de testes automatizados — a verificação é sempre manual via browser (dev server local) e, quando a mudança é sensível (auth, rate limit, pagamento), também direto em produção com dado descartável. Padrão usado nas últimas sessões: `npx tsc --noEmit -p .` primeiro, depois navegar de verdade no app (Browser pane) exercitando o fluxo, checando console/network, antes de considerar pronto.

---
*Este arquivo é um snapshot — não é atualizado automaticamente. Se ficar desatualizado, corrija-o em vez de ignorá-lo.*
