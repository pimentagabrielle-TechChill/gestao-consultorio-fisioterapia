-- =====================================================================
-- Esqueceu a senha? Rode no SQL Editor do Supabase.
-- Volta o usuário "admin" para a senha provisória "mudar123", como
-- administrador. No próximo acesso o sistema pede uma senha nova.
-- Também libera o bloqueio de tentativas erradas e encerra sessões abertas.
-- Para outro usuário, troque 'admin' nas três linhas marcadas.
-- =====================================================================
insert into privado.usuarios (usuario, nome, perfil, senha_hash, trocar)
values ('admin', 'Administrador', 'admin', privado.hash_senha('mudar123'), true)   -- usuário
on conflict (usuario) do update
  set senha_hash = excluded.senha_hash, trocar = true, perfil = 'admin';

delete from privado.falhas_login where usuario = 'admin';                                  -- usuário
delete from privado.sessoes      where usuario = 'admin';                                  -- usuário

select usuario, nome, perfil, trocar as vai_pedir_senha_nova from privado.usuarios order by usuario;
