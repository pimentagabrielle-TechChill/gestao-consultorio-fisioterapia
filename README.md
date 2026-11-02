# Gestão de consultório para fisioterapeutas autônomos

Sistema web de agenda, cadastro, recebimentos, metas, relatórios e finanças pessoais, desenvolvido sob medida para uma fisioterapeuta que atende num studio parceiro e em domicílio. Está em uso diário desde outubro de 2026.

> Repositório de portfólio. O código é o do sistema em produção, com o nome da cliente, os endereços e as chaves removidos.

**[Leia o estudo de caso completo](https://pimentagabrielle-techchill.github.io/gestao-consultorio-fisioterapia/)**

## O problema

Na fisioterapia autônoma, cada atendimento segue uma regra de pagamento diferente. Às vezes paga a clínica, às vezes o paciente, e pode haver aluguel de sala, nota fiscal, aplicativo de check-in (TotalPass, Wellhub) ou pacote pago antecipadamente. O repasse da clínica só cai no 5º dia útil do mês seguinte.

Com isso, o trabalho de um mês entra no caixa em datas diferentes, e as planilhas não respondiam o básico: quanto já recebi, quanto ainda vai entrar e se o repasse veio certo.

## A solução

O sistema mostra **duas visões do mesmo mês**:

- **Recebido:** extrato de caixa. Cada valor conta no dia em que o dinheiro entra.
- **Produzido:** o que os atendimentos rendem, pela data do atendimento.

As duas fecham: produzido = recebido + pacientes devendo + repasse a receber. Essa equação foi o teste de aceitação. No primeiro mês de uso, o cálculo bateu com o controle manual da cliente.

| Atendimento | Quem paga | Valor para a profissional |
|---|---|---|
| Pilates e Personal (avulso ou aplicativo) | Clínica, no repasse | Valor cheio |
| Com nota fiscal e sala | Clínica, no repasse | 50% fixo |
| Com nota fiscal, sem sala | Clínica, no repasse | Valor − % da nota |
| Sem nota, no studio | Paciente | Valor cheio; a sala é descontada no repasse seguinte |
| Sem nota, em domicílio | Paciente | Valor cheio |
| Sessão de pacote | Já paga no pacote | Sala sobre (valor do pacote ÷ sessões), descontada no repasse |

O repasse é previsto para o 5º dia útil do mês seguinte, descontando fins de semana e feriados nacionais (os móveis são calculados a partir da Páscoa).

## Módulos

| Módulo | O que faz |
|---|---|
| Início | Atendimentos do dia, horários livres, reposições pendentes, atendimentos sem confirmação, meta do mês e próximo repasse |
| Agenda | Semana com horários livres, aviso de conflito, repetição semanal, valor bruto e descontos |
| Cadastro | Alunos e pacientes, ficha com observações clínicas, origem, WhatsApp e pacotes |
| Recebimentos | Extrato do mês, repasse previsto e recebido, quem ainda deve, mensalidades, exportação CSV |
| Metas | Meta mensal, horas disponíveis, quanto rende cada hora e simulador do mês |
| Relatórios | Frequência por paciente, evolução de 12 meses, serviços e locais, a receber, descontos e repasses |
| Carteira | Finanças pessoais: saúde financeira, gastos, cartões e simulador de quitação de dívidas |
| Configurações | Locais, serviços, formas de pagamento, aplicativos, horários, usuários e permissões |

## Arquitetura

```
Navegador ──► Netlify (site + Edge Function /supabase/*) ──► Supabase (PostgreSQL)
                 ▲                                               ▲
          GitHub (main publica)                    GitHub Actions (consulta diária)
```

- **Front-end sem framework.** HTML, CSS e JavaScript numa página única. `ferramentas/build.js` junta `src/` em um único `dist/index.html`.
- **Dados como documentos JSON.** Configuração, cadastro, pacotes, um documento por mês de atendimentos e a carteira ficam numa coluna `jsonb` do PostgreSQL. A página carrega só os meses que precisa.
- **Acesso só por funções do banco.** As tabelas ficam num schema privado, sem acesso direto pela API. A página chama funções (`login`, `get_doc`, `set_doc`…) que conferem sessão e permissão antes de ler ou gravar.
- **Repasse pelo próprio site.** Uma Edge Function do Netlify encaminha `/supabase/*` para o banco, para que bloqueadores e filtros de rede não derrubem o sistema. Se falhar, a página chama o Supabase direto.
- **Prévias somente leitura.** Cada pull request gera um endereço de teste ligado ao mesmo banco, mas que não grava nada.
- **Banco sempre ativo.** Uma tarefa diária no GitHub Actions evita que o plano gratuito do Supabase pause o projeto e avisa por e-mail se ele não responder.

Custo de infraestrutura: R$ 0, com os planos gratuitos do Supabase, do Netlify e do GitHub.

## Segurança

- Senhas com bcrypt (pgcrypto) e troca obrigatória no primeiro acesso.
- Bloqueio de 15 minutos após 5 tentativas erradas.
- Sessões com expiração (12 horas, ou 30 dias com "manter conectado"); trocar a senha encerra as outras sessões.
- Administrador ou usuário com permissão por módulo: sem acesso, visualizar ou editar. Valores financeiros só aparecem para quem tem acesso a Recebimentos.
- Nenhuma tabela é exposta pela API; tudo passa por funções `security definer` com `search_path` fixo.
- O que é apagado ou substituído vai para uma lixeira no banco.
- Cabeçalhos `X-Frame-Options`, `Referrer-Policy` e `X-Content-Type-Options` no Netlify.
- Endereço e chave do banco ficam em variáveis de ambiente; o build recusa a chave secreta.

## Estrutura

| Caminho | Para quê |
|---|---|
| `src/` | Código-fonte: `app.js`, `index.html`, `config.js` |
| `ferramentas/build.js` | Gera `dist/index.html` (com `--somente-leitura` para prévias) |
| `ferramentas/gerar-importacao.js` | Gera o SQL de importação a partir dos arquivos JSON do sistema anterior |
| `netlify.toml` | Build, prévias e cabeçalhos de segurança |
| `netlify/edge-functions/supabase.js` | Repasse das chamadas ao banco |
| `supabase/*.sql` | Estrutura, permissões, foto do usuário e redefinição de senha |
| `.github/workflows/` | Consulta diária ao banco |
| `INSTALACAO.md` | Como subir sua própria instância |

## Stack

JavaScript · HTML · CSS · Node.js 20 · Supabase (PostgreSQL, RPC, pgcrypto) · Netlify (hospedagem e Edge Functions) · GitHub Actions

## O que aprendi

- O pedido falava de agenda; o maior valor estava no cálculo do dinheiro.
- Regra de negócio se descobre conversando: os detalhes que mais pesaram não estavam escritos em lugar nenhum.
- Um teste que o cliente entende ("bate com a sua planilha") convence mais do que qualquer explicação técnica.
- Infraestrutura gratuita também precisa de monitoramento.

## Direitos

© 2026. Todos os direitos reservados. Este código está público apenas para consulta, como portfólio. Não é permitido copiar, modificar, distribuir ou usar comercialmente sem autorização por escrito.
