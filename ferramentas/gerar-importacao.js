#!/usr/bin/env node
/**
 * Gera o SQL de importação a partir dos arquivos .json baixados da pasta do Drive.
 *
 *   node ferramentas/gerar-importacao.js <pasta-com-os-json> > supabase/02_dados.sql
 *
 * - Cada arquivo <chave>.json vira uma linha em privado.documentos.
 * - Valida que cada arquivo é JSON e que o nome é uma chave aceita pelo sistema.
 * - Se o mesmo documento aparecer duas vezes (ex.: "pacientes(1).json"), avisa e para.
 * - Pode ser rodado de novo na virada: grava por cima (upsert), não duplica.
 */
const fs = require('fs');
const path = require('path');

const pasta = process.argv[2];
if (!pasta) { console.error('Uso: node gerar-importacao.js <pasta>'); process.exit(1); }

const CHAVE_OK = /^[A-Za-z0-9-]{1,40}$/;
const arquivos = fs.readdirSync(pasta).filter((f) => f.toLowerCase().endsWith('.json')).sort();
const docs = [];
const problemas = [];

for (const f of arquivos) {
  const chave = f.slice(0, -5);
  if (chave === 'usuarios-export') continue;
  if (!CHAVE_OK.test(chave)) { problemas.push(`Nome inesperado (possível duplicata do Drive): ${f}`); continue; }
  let dados;
  try { dados = JSON.parse(fs.readFileSync(path.join(pasta, f), 'utf8')); }
  catch (e) { problemas.push(`JSON inválido em ${f}: ${e.message}`); continue; }
  docs.push({ chave, json: JSON.stringify(dados) });
}

if (problemas.length) {
  console.error('Não gerei o SQL. Problemas encontrados:\n- ' + problemas.join('\n- '));
  process.exit(2);
}

const tag = (s) => { let t = 'json'; let i = 0; while (s.includes('$' + t + '$')) t = 'json' + (++i); return '$' + t + '$'; };

const out = [];
out.push('-- Importação dos dados do Drive — gerado em ' + new Date().toISOString());
out.push(`-- ${docs.length} documentos: ${docs.map((d) => d.chave).join(', ')}`);
out.push('-- Rode DEPOIS do 01_estrutura.sql. Pode rodar de novo: atualiza por cima.');
out.push('begin;');
out.push('-- Segurança: guarda uma cópia de tudo que já está no banco antes de substituir');
out.push("-- (fica em privado.documentos_lixeira, com apagado_por = 'antes-da-importacao').");
out.push("insert into privado.documentos_lixeira (chave, dados, apagado_por) select chave, dados, 'antes-da-importacao' from privado.documentos;");
for (const d of docs) {
  const q = tag(d.json);
  out.push(`insert into privado.documentos (chave, dados, atualizado_por) values ('${d.chave}', ${q}${d.json}${q}::jsonb, 'importacao')`);
  out.push(`  on conflict (chave) do update set dados = excluded.dados, atualizado_em = now(), atualizado_por = 'importacao';`);
}
out.push('commit;');
out.push('');
out.push('-- Conferência: compare com o resumo da migração.');
out.push(`select
  (select count(*) from privado.documentos) as documentos,
  (select jsonb_array_length(dados->'lista') from privado.documentos where chave = 'pacientes') as pacientes,
  (select sum(jsonb_array_length(dados->'atendimentos')) from privado.documentos where chave like 'm-%') as atendimentos,
  (select sum((a->>'valor')::numeric) from privado.documentos d, jsonb_array_elements(d.dados->'atendimentos') a where d.chave like 'm-%') as valor_atendimentos;`);
process.stdout.write(out.join('\n') + '\n');
console.error(`OK: ${docs.length} documentos.`);
