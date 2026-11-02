-- =====================================================================
-- Gestão de consultório de fisioterapia — estrutura no Supabase
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em "Run".
-- Pode ser executado de novo sem perder dados (não apaga tabelas).
--
-- Mesmo modelo do Apps Script:
--   * cada "documento" (config, pacientes, m-AAAA-MM, fin, f-AAAA-MM, cp-<id>)
--     é uma linha em privado.documentos, com o JSON numa coluna jsonb;
--   * usuários e sessões próprios do sistema (login por nome de usuário);
--   * a página só fala com o banco pelas funções públicas abaixo, que
--     conferem a sessão e o perfil antes de ler ou gravar qualquer coisa.
--     As tabelas ficam no esquema "privado", que a API não expõe.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

create schema if not exists privado;
revoke all on schema privado from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema privado from anon, authenticated';
  end if;
end $$;

-- ----------------------------- Tabelas -----------------------------
create table if not exists privado.usuarios (
  usuario     text primary key check (usuario ~ '^[a-z0-9._-]{3,30}$'),
  nome        text not null,
  perfil      text not null default 'agenda' check (perfil in ('admin', 'agenda')),
  senha_hash  text not null,
  trocar      boolean not null default true,
  criado_em   timestamptz not null default now()
);

create table if not exists privado.sessoes (
  token     uuid primary key default gen_random_uuid(),
  usuario   text not null references privado.usuarios(usuario) on delete cascade on update cascade,
  expira    timestamptz not null,
  duracao   interval not null,
  criada_em timestamptz not null default now()
);
create index if not exists sessoes_usuario_idx on privado.sessoes(usuario);

create table if not exists privado.falhas_login (
  usuario text primary key,
  n       int not null default 0,
  ate     timestamptz not null
);

create table if not exists privado.documentos (
  chave          text primary key check (chave ~ '^[A-Za-z0-9-]{1,40}$'),
  dados          jsonb not null,
  atualizado_em  timestamptz not null default now(),
  atualizado_por text
);

-- "Apagar todos os dados" move tudo para cá em vez de destruir (como a lixeira do Drive).
create table if not exists privado.documentos_lixeira (
  id           bigint generated always as identity primary key,
  chave        text not null,
  dados        jsonb not null,
  apagado_em   timestamptz not null default now(),
  apagado_por  text
);

-- ------------------------- Funções internas -------------------------
create or replace function privado.hash_senha(p_senha text)
returns text language sql volatile set search_path = '' as $$
  select extensions.crypt(p_senha, extensions.gen_salt('bf', 10));
$$;

create or replace function privado.senha_confere(p_senha text, p_hash text)
returns boolean language sql stable set search_path = '' as $$
  select p_hash is not null and extensions.crypt(coalesce(p_senha, ''), p_hash) = p_hash;
$$;

-- Valida o token e devolve {usuario, nome, perfil, trocar}. Renova a validade
-- quando já passou mais de 1 hora desde a última renovação (igual ao original).
create or replace function privado.sessao(p_token text, p_permitir_troca boolean default false)
returns jsonb language plpgsql volatile set search_path = '' as $$
declare
  s privado.sessoes;
  u privado.usuarios;
begin
  if p_token is null or p_token !~ '^[a-f0-9-]{36}$' then
    raise exception 'SESSAO_EXPIRADA';
  end if;
  select * into s from privado.sessoes where token = p_token::uuid;
  if not found then raise exception 'SESSAO_EXPIRADA'; end if;
  if s.expira < now() then
    delete from privado.sessoes where token = s.token;
    raise exception 'SESSAO_EXPIRADA';
  end if;
  select * into u from privado.usuarios where usuario = s.usuario;
  if not found then raise exception 'SESSAO_EXPIRADA'; end if;
  if u.trocar and not p_permitir_troca then
    raise exception 'Troque sua senha para continuar.';
  end if;
  if s.expira - now() < s.duracao - interval '1 hour' then
    update privado.sessoes set expira = now() + s.duracao where token = s.token;
  end if;
  return jsonb_build_object('usuario', u.usuario, 'nome', u.nome, 'perfil', u.perfil, 'trocar', u.trocar);
end $$;

create or replace function privado.exigir_admin(p_sessao jsonb)
returns void language plpgsql stable set search_path = '' as $$
begin
  if p_sessao->>'perfil' <> 'admin' then
    raise exception 'Seu usuário não tem permissão para isso.';
  end if;
end $$;

create or replace function privado.validar_chave(p_chave text)
returns void language plpgsql stable set search_path = '' as $$
begin
  if p_chave is null or p_chave !~ '^[A-Za-z0-9-]{1,40}$' then
    raise exception 'Chave inválida: %', p_chave;
  end if;
end $$;

-- ------------------- Funções públicas (chamadas pela página) -------------------

-- Em caso de erro devolve {"erro": "..."} em vez de lançar exceção, para que o
-- contador de tentativas erradas seja gravado (uma exceção desfaria a gravação).
create or replace function public.login(p_usuario text, p_senha text, p_lembrar boolean default true)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_usuario text := lower(trim(coalesce(p_usuario, '')));
  f privado.falhas_login;
  u privado.usuarios;
  v_dur interval := case when p_lembrar then interval '30 days' else interval '12 hours' end;
  v_token uuid;
begin
  select * into f from privado.falhas_login where usuario = v_usuario;
  if found and f.ate > now() and f.n >= 5 then
    return jsonb_build_object('erro', 'Muitas tentativas erradas. Aguarde 15 minutos e tente de novo.');
  end if;

  select * into u from privado.usuarios where usuario = v_usuario;
  if not found or not privado.senha_confere(p_senha, u.senha_hash) then
    insert into privado.falhas_login as fl (usuario, n, ate)
      values (v_usuario, 1, now() + interval '15 minutes')
      on conflict (usuario) do update
        set n = case when fl.ate > now() then fl.n + 1 else 1 end,
            ate = now() + interval '15 minutes';
    perform pg_sleep(0.8);
    return jsonb_build_object('erro', 'Usuário ou senha incorretos.');
  end if;

  delete from privado.falhas_login where usuario = v_usuario;
  delete from privado.sessoes where expira < now();
  insert into privado.sessoes (usuario, expira, duracao)
    values (v_usuario, now() + v_dur, v_dur)
    returning token into v_token;
  return jsonb_build_object('token', v_token::text, 'usuario', u.usuario, 'nome', u.nome,
                            'perfil', u.perfil, 'trocar', u.trocar);
end $$;

create or replace function public.me(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  return privado.sessao(p_token, true);
end $$;

create or replace function public.logout(p_token text)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
begin
  if p_token ~ '^[a-f0-9-]{36}$' then
    delete from privado.sessoes where token = p_token::uuid;
  end if;
  return true;
end $$;

create or replace function public.change_password(p_token text, p_atual text, p_nova text)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare
  s jsonb := privado.sessao(p_token, true);
  u privado.usuarios;
begin
  if length(coalesce(p_nova, '')) < 6 then
    raise exception 'A senha precisa ter pelo menos 6 caracteres.';
  end if;
  if p_nova = coalesce(p_atual, '') then
    raise exception 'A nova senha precisa ser diferente da atual.';
  end if;
  select * into u from privado.usuarios where usuario = s->>'usuario' for update;
  if not privado.senha_confere(p_atual, u.senha_hash) then
    raise exception 'A senha atual está incorreta.';
  end if;
  update privado.usuarios set senha_hash = privado.hash_senha(p_nova), trocar = false
    where usuario = u.usuario;
  -- encerra as outras sessões abertas desse usuário (mantém a atual)
  delete from privado.sessoes where usuario = u.usuario and token <> p_token::uuid;
  return true;
end $$;

create or replace function public.list_users(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform privado.exigir_admin(privado.sessao(p_token));
  return coalesce((
    select jsonb_agg(jsonb_build_object('usuario', usuario, 'nome', nome, 'perfil', perfil, 'trocar', trocar)
                     order by usuario)
    from privado.usuarios), '[]'::jsonb);
end $$;

create or replace function public.save_user(p_token text, p_dados jsonb)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare
  s jsonb := privado.sessao(p_token);
  v_id     text := lower(trim(coalesce(p_dados->>'usuario', '')));
  v_novo   boolean := coalesce((p_dados->>'novo')::boolean, false);
  v_nome   text := left(coalesce(nullif(trim(p_dados->>'nome'), ''), v_id), 60);
  v_perfil text := case when p_dados->>'perfil' = 'admin' then 'admin' else 'agenda' end;
  v_senha  text := coalesce(p_dados->>'senha', '');
  v_trocar boolean := coalesce((p_dados->>'trocar')::boolean, false);
  v_existe boolean;
begin
  perform privado.exigir_admin(s);
  if v_id !~ '^[a-z0-9._-]{3,30}$' then
    raise exception 'Usuário inválido: use de 3 a 30 letras minúsculas, números, ponto, hífen ou sublinhado, sem espaços.';
  end if;
  select exists(select 1 from privado.usuarios where usuario = v_id) into v_existe;
  if v_novo and v_existe then raise exception 'Já existe um usuário com esse nome.'; end if;
  if not v_novo and not v_existe then raise exception 'Usuário não encontrado.'; end if;
  if v_id = s->>'usuario' and v_perfil <> 'admin' then
    raise exception 'Você não pode tirar o seu próprio acesso de administrador.';
  end if;
  if v_senha <> '' and length(v_senha) < 6 then
    raise exception 'A senha precisa ter pelo menos 6 caracteres.';
  end if;
  if v_novo and v_senha = '' then
    raise exception 'Informe uma senha para o novo usuário.';
  end if;

  if v_novo then
    insert into privado.usuarios (usuario, nome, perfil, senha_hash, trocar)
      values (v_id, v_nome, v_perfil, privado.hash_senha(v_senha), v_trocar);
  else
    update privado.usuarios set nome = v_nome, perfil = v_perfil where usuario = v_id;
    if v_senha <> '' then
      update privado.usuarios set senha_hash = privado.hash_senha(v_senha), trocar = v_trocar
        where usuario = v_id;
      -- senha redefinida pelo administrador: derruba as sessões abertas dessa pessoa
      if v_id <> s->>'usuario' then
        delete from privado.sessoes where usuario = v_id;
      end if;
    end if;
  end if;
  return true;
end $$;

create or replace function public.remove_user(p_token text, p_usuario text)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare
  s jsonb := privado.sessao(p_token);
  v_id text := lower(coalesce(p_usuario, ''));
begin
  perform privado.exigir_admin(s);
  if v_id = s->>'usuario' then
    raise exception 'Você não pode remover o seu próprio usuário.';
  end if;
  delete from privado.usuarios where usuario = v_id;  -- as sessões caem junto (cascade)
  return true;
end $$;

create or replace function public.get_doc(p_token text, p_chave text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  s jsonb := privado.sessao(p_token);
  v jsonb;
begin
  perform privado.validar_chave(p_chave);
  if s->>'perfil' <> 'admin' and (p_chave = 'fin' or p_chave like 'f-%') then
    raise exception 'Seu usuário não tem acesso à carteira.';
  end if;
  select dados into v from privado.documentos where chave = p_chave;
  return v;  -- null quando o documento ainda não existe
end $$;

create or replace function public.set_doc(p_token text, p_chave text, p_dados jsonb)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare
  s jsonb := privado.sessao(p_token);
begin
  perform privado.validar_chave(p_chave);
  if p_dados is null then raise exception 'Documento vazio.'; end if;
  if s->>'perfil' <> 'admin'
     and not (p_chave = 'pacientes' or p_chave ~ '^m-\d{4}-\d{2}$' or p_chave ~ '^cp-[A-Za-z0-9]+$') then
    raise exception 'Seu usuário não tem permissão para alterar isso.';
  end if;
  insert into privado.documentos (chave, dados, atualizado_em, atualizado_por)
    values (p_chave, p_dados, now(), s->>'usuario')
    on conflict (chave) do update
      set dados = excluded.dados, atualizado_em = now(), atualizado_por = excluded.atualizado_por;
  return true;
end $$;

create or replace function public.clear_all(p_token text)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare
  s jsonb := privado.sessao(p_token);
begin
  perform privado.exigir_admin(s);
  insert into privado.documentos_lixeira (chave, dados, apagado_por)
    select chave, dados, s->>'usuario' from privado.documentos;
  delete from privado.documentos where true;
  return true;
end $$;

-- ------------------------------ Permissões ------------------------------
revoke all on all tables in schema privado from public;
revoke execute on all functions in schema privado from public;

revoke execute on function
  public.login(text, text, boolean), public.me(text), public.logout(text),
  public.change_password(text, text, text), public.list_users(text),
  public.save_user(text, jsonb), public.remove_user(text, text),
  public.get_doc(text, text), public.set_doc(text, text, jsonb), public.clear_all(text)
from public;

do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all tables in schema privado from anon, authenticated';
    execute 'revoke execute on all functions in schema privado from anon, authenticated';
    execute 'grant execute on function
      public.login(text, text, boolean), public.me(text), public.logout(text),
      public.change_password(text, text, text), public.list_users(text),
      public.save_user(text, jsonb), public.remove_user(text, text),
      public.get_doc(text, text), public.set_doc(text, text, jsonb), public.clear_all(text)
      to anon, authenticated';
  end if;
end $$;

-- ------------------------- Administrador inicial -------------------------
-- Usuário "admin", senha provisória "mudar123". No primeiro acesso o sistema
-- obriga a criar uma senha nova. Não altera nada se o usuário já existir.
insert into privado.usuarios (usuario, nome, perfil, senha_hash, trocar)
values ('admin', 'Administrador', 'admin', privado.hash_senha('mudar123'), true)
on conflict (usuario) do nothing;
