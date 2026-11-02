# Instalação

Passo a passo para subir uma instância própria do sistema.

## 1. Banco (Supabase)

1. Em [supabase.com](https://supabase.com), crie um projeto (região *South America (São Paulo)*, se for usar no Brasil).
2. Em **SQL Editor**, rode, nesta ordem:
   1. `supabase/01_estrutura.sql` (tabelas, funções, permissões e o usuário inicial)
   2. `supabase/03_permissoes.sql` (permissões por módulo)
   3. `supabase/04_foto_usuario.sql` (foto do usuário)
3. Em **Project Settings → API Keys**, copie a *Project URL* e a chave pública (*publishable* ou *anon*). **Nunca use a chave secreta** (*secret* ou *service_role*).

## 2. Site (Netlify)

1. Crie um site no Netlify ligado a este repositório. O `netlify.toml` já define o build e a pasta publicada.
2. Em **Site configuration → Environment variables**, crie:

   | Variável | Valor |
   |---|---|
   | `SUPABASE_URL` | Project URL, ex.: `https://xxxx.supabase.co` |
   | `SUPABASE_KEY` | Chave pública (publishable/anon) |
   | `NOME_PROFISSIONAL` | Opcional: nome que aparece na tela de login |

3. Publique. Cada pull request gera uma prévia somente leitura.

## 3. Primeiro acesso

Entre com o usuário `admin` e a senha provisória `mudar123`. O sistema pede uma senha nova na hora. Depois:

1. Em **Configurações**, cadastre locais, serviços, formas de pagamento e horários.
2. Em **Configurações → Usuários e acessos**, crie os demais usuários e escolha as permissões de cada um.

## 4. Manter o banco ativo (opcional)

O plano gratuito do Supabase pausa projetos parados. Para evitar isso, em **Settings → Secrets and variables → Actions** do GitHub, crie os secrets `SUPABASE_URL` e `SUPABASE_KEY`. A tarefa `Manter banco ativo` passa a consultar o banco todo dia.

## Problemas comuns

- **Não consegue entrar:** confira se o projeto não foi pausado (supabase.com/dashboard → **Resume project**).
- **Esqueceu a senha:** rode `supabase/redefinir_senha.sql` no SQL Editor e entre com `mudar123`.

## Rodar localmente

```bash
SUPABASE_URL=https://xxxx.supabase.co SUPABASE_KEY=sb_publishable_... node ferramentas/build.js
```

Depois abra `dist/index.html` no navegador.

## Dados de pacientes

Se importar dados de outro sistema com `ferramentas/gerar-importacao.js`, salve o resultado como `supabase/02_dados.sql`. Esse arquivo está no `.gitignore` e **não deve ser enviado ao repositório**.
