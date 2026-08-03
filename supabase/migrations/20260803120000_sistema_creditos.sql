-- ============================================================================
-- Sistema de créditos — TeraEdu
--
-- Toda escrita passa por função SECURITY DEFINER. Motivo: o projeto não tem
-- service_role key (só a anon/publishable), então as rotas de API atuam COMO O
-- USUÁRIO. Se a RLS permitisse UPDATE ao usuário, ele poderia editar o próprio
-- saldo pelo navegador — o mesmo buraco que já existe hoje em user_profiles.plano.
--
-- ATENÇÃO: creditos_do_plano() lê user_profiles.plano, que hoje é gravável pelo
-- próprio usuário (não há checkout implementado). Enquanto isso não for corrigido,
-- este sistema é CONTABILIDADE de custo, não barreira de receita.
-- ============================================================================

create table if not exists public.uso_ia (
  id                     bigint generated always as identity primary key,
  user_id                uuid        not null references auth.users(id) on delete cascade,
  acao                   text        not null check (acao in (
                           'flashcard','questao','tutora','resumo',
                           'resumo_pergunta','plano','questao_corrigir')),
  model                  text        not null,
  input_tokens           integer     not null default 0,
  output_tokens          integer     not null default 0,
  -- tutora/resumo_pergunta usam prompt caching; sem estas colunas o custo fica
  -- subestimado, porque usage.input_tokens exclui o que veio do cache
  cache_creation_tokens  integer     not null default 0,
  cache_read_tokens      integer     not null default 0,
  custo_usd              numeric(12,6) not null default 0,
  creditos_debitados     integer     not null default 0,
  sucesso                boolean     not null,
  criado_em              timestamptz not null default now()
);

create index if not exists uso_ia_user_criado_idx on public.uso_ia (user_id, criado_em desc);
create index if not exists uso_ia_acao_criado_idx on public.uso_ia (acao, criado_em desc);

create table if not exists public.creditos_usuario (
  user_id          uuid        primary key references auth.users(id) on delete cascade,
  plano            text        not null default 'gratuito'
                               check (plano in ('gratuito','plus','premium')),
  saldo            integer     not null default 0 check (saldo >= 0),
  creditos_totais  integer     not null default 0,
  renova_em        timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  atualizado_em    timestamptz not null default now()
);

alter table public.uso_ia           enable row level security;
alter table public.creditos_usuario enable row level security;

-- Só SELECT da própria linha. Sem policy de INSERT/UPDATE/DELETE: escrita é
-- exclusiva das funções SECURITY DEFINER abaixo.
drop policy if exists "uso_ia: le o proprio" on public.uso_ia;
create policy "uso_ia: le o proprio"
  on public.uso_ia for select using (auth.uid() = user_id);

drop policy if exists "creditos: le o proprio" on public.creditos_usuario;
create policy "creditos: le o proprio"
  on public.creditos_usuario for select using (auth.uid() = user_id);

create or replace function public.creditos_do_plano(p_plano text)
returns integer language sql immutable as $$
  select case p_plano
    when 'premium' then 13500   -- paridade de US$/crédito com o Plus
    when 'plus'    then  8000
    else                  900   -- gratuito
  end;
$$;

-- Cria a linha do usuário e renova no vencimento.
create or replace function public.garantir_creditos(p_user_id uuid)
returns public.creditos_usuario
language plpgsql security definer set search_path = public as $$
declare v_plano text; v_row public.creditos_usuario;
begin
  select coalesce(plano,'gratuito') into v_plano
    from public.user_profiles where id = p_user_id;
  v_plano := coalesce(v_plano,'gratuito');

  insert into public.creditos_usuario (user_id, plano, saldo, creditos_totais)
  values (p_user_id, v_plano, creditos_do_plano(v_plano), creditos_do_plano(v_plano))
  on conflict (user_id) do nothing;

  select * into v_row from public.creditos_usuario
   where user_id = p_user_id for update;

  if v_row.renova_em <= now() then
    -- só a renovação mensal recarrega o saldo
    update public.creditos_usuario
       set plano = v_plano, creditos_totais = creditos_do_plano(v_plano),
           saldo = creditos_do_plano(v_plano),
           renova_em = date_trunc('month', now()) + interval '1 month',
           atualizado_em = now()
     where user_id = p_user_id returning * into v_row;
  elsif v_row.plano is distinct from v_plano then
    -- troca de plano ajusta o teto mas NÃO recarrega: como o plano é gravável
    -- pelo usuário, recarregar aqui viraria refill infinito (plus <-> premium)
    update public.creditos_usuario
       set plano = v_plano, creditos_totais = creditos_do_plano(v_plano),
           atualizado_em = now()
     where user_id = p_user_id returning * into v_row;
  end if;

  return v_row;
end; $$;

create or replace function public.saldo_creditos()
returns integer language plpgsql security definer set search_path = public as $$
declare v_row public.creditos_usuario;
begin
  if auth.uid() is null then raise exception 'nao autenticado'; end if;
  v_row := public.garantir_creditos(auth.uid());
  return v_row.saldo;
end; $$;

-- Registra o uso e debita. O débito só ocorre quando p_sucesso = true.
-- creditos_debitados grava o desconto REAL (saldo antes - saldo depois), não o
-- valor pedido: quando o greatest(...,0) trunca o débito, gravar p_creditos
-- superestimaria o consumo e deixaria a auditoria inconsistente com o saldo.
create or replace function public.registrar_uso_ia(
  p_acao text, p_model text,
  p_input_tokens integer, p_output_tokens integer,
  p_cache_creation_tokens integer, p_cache_read_tokens integer,
  p_custo_usd numeric, p_creditos integer, p_sucesso boolean
) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_user   uuid := auth.uid();
  v_antes  integer;
  v_saldo  integer;
  v_debito integer := 0;
begin
  if v_user is null then raise exception 'nao autenticado'; end if;
  perform public.garantir_creditos(v_user);

  if p_sucesso and p_creditos > 0 then
    select saldo into v_antes from public.creditos_usuario
      where user_id = v_user for update;

    -- greatest(...,0) respeita o CHECK saldo >= 0. Só chega em 0 numa corrida
    -- entre requests concorrentes; nesse caso o conteúdo já foi gerado e
    -- entregue, então perder o excedente é melhor do que falhar a resposta.
    update public.creditos_usuario
       set saldo = greatest(saldo - p_creditos, 0), atualizado_em = now()
     where user_id = v_user returning saldo into v_saldo;

    v_debito := v_antes - v_saldo;
  else
    select saldo into v_saldo from public.creditos_usuario where user_id = v_user;
  end if;

  insert into public.uso_ia (user_id, acao, model, input_tokens, output_tokens,
    cache_creation_tokens, cache_read_tokens, custo_usd, creditos_debitados, sucesso)
  values (v_user, p_acao, p_model, p_input_tokens, p_output_tokens,
    p_cache_creation_tokens, p_cache_read_tokens, p_custo_usd, v_debito, p_sucesso);

  return v_saldo;
end; $$;

revoke all on function public.garantir_creditos(uuid) from public, anon, authenticated;
revoke all on function public.saldo_creditos() from public, anon;
revoke all on function public.registrar_uso_ia(text,text,integer,integer,integer,integer,numeric,integer,boolean) from public, anon;
grant execute on function public.saldo_creditos() to authenticated;
grant execute on function public.registrar_uso_ia(text,text,integer,integer,integer,integer,numeric,integer,boolean) to authenticated;
