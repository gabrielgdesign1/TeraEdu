-- Segurança (auditoria de 2026-11-17)
--
-- 1. Plano pago não pode ser definido pelo próprio usuário.
--    A RLS de user_profiles deixa o dono editar a linha inteira, e a tela de planos
--    gravava `plano` direto pelo navegador: dois cliques = Premium + 13.500 créditos/mês.
--    Agora quem chega pela API como usuário (anon/authenticated) só pode voltar para
--    'gratuito'; o upgrade fica para o webhook de pagamento (service_role/postgres).

create or replace function public.proteger_plano() returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.plano := 'gratuito';
    elsif new.plano is distinct from old.plano and new.plano is distinct from 'gratuito' then
      raise exception 'plano pago só pode ser ativado por pagamento' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists proteger_plano on public.user_profiles;
create trigger proteger_plano
  before insert or update on public.user_profiles
  for each row execute function public.proteger_plano();

-- 2. Funções sem search_path fixo (alerta "Function Search Path Mutable" do Supabase).
alter function public.creditos_do_plano(text) set search_path = public;
alter function public.update_atualizado_em() set search_path = public;

-- 3. Avatares: só imagem e até 3 MB (mesmo limite do front). Sem isso, o bucket
--    público aceitava qualquer arquivo de qualquer tamanho via API direta.
update storage.buckets
   set file_size_limit = 3145728,
       allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
 where id = 'avatars';
