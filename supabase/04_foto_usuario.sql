-- =====================================================================
-- Gestão de consultório · 04 · Foto do usuário (22/10/2026)
-- Rode uma vez no SQL Editor do Supabase. Pode rodar de novo sem problema.
-- Não depende do 03_permissoes.sql e não altera nenhum dado existente.
--
-- A foto fica no cadastro do usuário (privado.usuarios.foto), como imagem
-- pequena (data:image/...). Cada pessoa troca a própria foto; o administrador
-- pode trocar a de qualquer usuário.
-- =====================================================================

alter table privado.usuarios add column if not exists foto text;
alter table privado.usuarios drop constraint if exists usuarios_foto_check;
alter table privado.usuarios add constraint usuarios_foto_check
  check (foto is null or (foto ~ '^data:image/(jpeg|png|webp);base64,' and length(foto) <= 200000));

-- Foto de quem está usando o sistema (aparece no menu, ao lado do nome).
create or replace function public.my_photo(p_token text)
returns text language plpgsql volatile security definer set search_path = '' as $$
declare
  s jsonb := privado.sessao(p_token, true);
  v text;
begin
  select foto into v from privado.usuarios where usuario = s->>'usuario';
  return v;
end $$;

-- Fotos de todos os usuários, para a lista em Configurações (só administrador).
create or replace function public.user_photos(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform privado.exigir_admin(privado.sessao(p_token));
  return coalesce((select jsonb_object_agg(usuario, foto) from privado.usuarios where foto is not null), '{}'::jsonb);
end $$;

-- Cadastra (ou remove, com p_foto vazio/nulo) a foto de um usuário.
-- A própria foto qualquer um troca; a dos outros, só o administrador.
create or replace function public.set_user_photo(p_token text, p_usuario text, p_foto text)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare
  v_id text := lower(coalesce(p_usuario, ''));
  v_foto text := nullif(p_foto, '');
  s jsonb := privado.sessao(p_token);
begin
  if v_id <> s->>'usuario' then
    perform privado.exigir_admin(s);
  end if;
  if not exists (select 1 from privado.usuarios where usuario = v_id) then
    raise exception 'Usuário não encontrado.';
  end if;
  if v_foto is not null and (v_foto !~ '^data:image/(jpeg|png|webp);base64,' or length(v_foto) > 200000) then
    raise exception 'Foto inválida ou grande demais.';
  end if;
  update privado.usuarios set foto = v_foto where usuario = v_id;
  return true;
end $$;

revoke execute on function public.my_photo(text), public.user_photos(text), public.set_user_photo(text, text, text) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'grant execute on function public.my_photo(text), public.user_photos(text),
      public.set_user_photo(text, text, text) to anon, authenticated';
  end if;
end $$;

-- Avisa a API do Supabase que há funções novas.
notify pgrst, 'reload schema';

-- Conferência: deve mostrar a coluna "foto".
select column_name from information_schema.columns
 where table_schema = 'privado' and table_name = 'usuarios' and column_name = 'foto';
