-- =====================================================================
-- Gestão de consultório · 03 · Permissões por módulo (22/10/2026)
-- Rode uma vez no SQL Editor do Supabase, depois de 01_estrutura.sql.
-- Pode rodar de novo sem problema.
--
-- Cada usuário é "admin" (vê e edita tudo, inclusive usuários) ou "usuario",
-- com permissão por módulo: "" (sem acesso), "ver" ou "editar".
-- Módulos: inicio, agenda, pacientes, financeiro, metas, relatorios, carteira, config.
-- =====================================================================

alter table privado.usuarios add column if not exists permissoes jsonb not null default '{}'::jsonb;
alter table privado.usuarios drop constraint if exists usuarios_perfil_check;
alter table privado.usuarios add constraint usuarios_perfil_check check (perfil in ('admin', 'usuario', 'agenda'));

-- Quem era "Acesso à agenda" passa a ter as mesmas telas de antes.
update privado.usuarios
   set perfil = 'usuario',
       permissoes = '{"inicio":"editar","agenda":"editar","pacientes":"editar","relatorios":"ver"}'::jsonb
 where perfil = 'agenda';

-- Só aceita módulos e níveis conhecidos.
create or replace function privado.limpar_permissoes(p jsonb)
returns jsonb language sql immutable set search_path = '' as $$
  select coalesce(jsonb_object_agg(k, v), '{}'::jsonb)
    from jsonb_each_text(coalesce(p, '{}'::jsonb)) as e(k, v)
   where k in ('inicio', 'agenda', 'pacientes', 'financeiro', 'metas', 'relatorios', 'carteira', 'config')
     and v in ('ver', 'editar');
$$;

-- true quando a sessão pode ver (p_editar = false) ou editar (true) algum dos módulos.
create or replace function privado.pode(p_sessao jsonb, p_modulos text[], p_editar boolean)
returns boolean language sql immutable set search_path = '' as $$
  select p_sessao->>'perfil' = 'admin'
      or exists (select 1 from unnest(p_modulos) m
                  where case when p_editar then p_sessao->'permissoes'->>m = 'editar'
                             else p_sessao->'permissoes'->>m in ('ver', 'editar') end);
$$;

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
  return jsonb_build_object('usuario', u.usuario, 'nome', u.nome, 'perfil', u.perfil, 'trocar', u.trocar,
                            'permissoes', u.permissoes);
end $$;

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
                            'perfil', u.perfil, 'trocar', u.trocar, 'permissoes', u.permissoes);
end $$;

create or replace function public.list_users(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
begin
  perform privado.exigir_admin(privado.sessao(p_token));
  return coalesce((
    select jsonb_agg(jsonb_build_object('usuario', usuario, 'nome', nome, 'perfil', perfil, 'trocar', trocar,
                                        'permissoes', permissoes) order by usuario)
    from privado.usuarios), '[]'::jsonb);
end $$;

create or replace function public.save_user(p_token text, p_dados jsonb)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare
  s jsonb := privado.sessao(p_token);
  v_id     text := lower(trim(coalesce(p_dados->>'usuario', '')));
  v_novo   boolean := coalesce((p_dados->>'novo')::boolean, false);
  v_nome   text := left(coalesce(nullif(trim(p_dados->>'nome'), ''), v_id), 60);
  v_perfil text := case when p_dados->>'perfil' = 'admin' then 'admin' else 'usuario' end;
  v_perm   jsonb := case when p_dados->>'perfil' = 'admin' then '{}'::jsonb
                         else privado.limpar_permissoes(p_dados->'permissoes') end;
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
  if v_perfil <> 'admin' and v_perm = '{}'::jsonb then
    raise exception 'Escolha pelo menos um módulo para esse usuário.';
  end if;
  if v_senha <> '' and length(v_senha) < 6 then
    raise exception 'A senha precisa ter pelo menos 6 caracteres.';
  end if;
  if v_novo and v_senha = '' then
    raise exception 'Informe uma senha para o novo usuário.';
  end if;

  if v_novo then
    insert into privado.usuarios (usuario, nome, perfil, permissoes, senha_hash, trocar)
      values (v_id, v_nome, v_perfil, v_perm, privado.hash_senha(v_senha), v_trocar);
  else
    update privado.usuarios set nome = v_nome, perfil = v_perfil, permissoes = v_perm where usuario = v_id;
    if v_senha <> '' then
      update privado.usuarios set senha_hash = privado.hash_senha(v_senha), trocar = v_trocar
        where usuario = v_id;
      if v_id <> s->>'usuario' then
        delete from privado.sessoes where usuario = v_id;
      end if;
    end if;
  end if;
  return true;
end $$;

create or replace function public.get_doc(p_token text, p_chave text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  s jsonb := privado.sessao(p_token);
  v jsonb;
begin
  perform privado.validar_chave(p_chave);
  if (p_chave = 'fin' or p_chave like 'f-%') and not privado.pode(s, array['carteira'], false) then
    raise exception 'Seu usuário não tem acesso à carteira.';
  end if;
  select dados into v from privado.documentos where chave = p_chave;
  return v;
end $$;

create or replace function public.set_doc(p_token text, p_chave text, p_dados jsonb)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare
  s jsonb := privado.sessao(p_token);
  v_ok boolean;
begin
  perform privado.validar_chave(p_chave);
  if p_dados is null then raise exception 'Documento vazio.'; end if;
  v_ok := case
    when p_chave = 'fin' or p_chave ~ '^f-' then privado.pode(s, array['carteira'], true)
    when p_chave = 'config' then privado.pode(s, array['config', 'metas'], true)
    when p_chave in ('pacientes', 'pacotes') or p_chave ~ '^cp-[A-Za-z0-9]+$'
      then privado.pode(s, array['agenda', 'pacientes', 'financeiro', 'inicio'], true)
    when p_chave ~ '^m-\d{4}-\d{2}$'
      then privado.pode(s, array['agenda', 'pacientes', 'financeiro', 'inicio'], true)
    else s->>'perfil' = 'admin'
  end;
  if not v_ok then
    raise exception 'Seu usuário não tem permissão para alterar isso.';
  end if;
  insert into privado.documentos (chave, dados, atualizado_em, atualizado_por)
    values (p_chave, p_dados, now(), s->>'usuario')
    on conflict (chave) do update
      set dados = excluded.dados, atualizado_em = now(), atualizado_por = excluded.atualizado_por;
  return true;
end $$;

revoke execute on function privado.limpar_permissoes(jsonb), privado.pode(jsonb, text[], boolean) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke execute on function privado.limpar_permissoes(jsonb), privado.pode(jsonb, text[], boolean) from anon, authenticated';
  end if;
end $$;

-- Conferência: usuários e permissões
select usuario, nome, perfil, permissoes from privado.usuarios order by usuario;
