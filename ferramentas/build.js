#!/usr/bin/env node
// Junta src/index.html + src/config.js + src/app.js num único dist/index.html.
//
//   node ferramentas/build.js                  -> sistema normal
//   node ferramentas/build.js --somente-leitura -> prévia: mesmo banco, nada é gravado
//
// Os valores de conexão vêm das variáveis de ambiente (no Netlify:
// Site configuration → Environment variables):
//   SUPABASE_URL       endereço do projeto, ex.: https://xxxx.supabase.co
//   SUPABASE_KEY       chave pública (publishable/anon) — nunca a secreta
//   NOME_PROFISSIONAL  opcional: nome mostrado na tela de login
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const ler = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');
const somenteLeitura = process.argv.includes('--somente-leitura');

const env = (k) => String(process.env[k] || '').trim();
if (/secret|service_role/i.test(env('SUPABASE_KEY')) || /^sb_secret_/.test(env('SUPABASE_KEY'))) {
  throw new Error('SUPABASE_KEY parece ser a chave SECRETA. Use a chave pública (publishable/anon).');
}
let cfg = ler('src/config.js');
const extra = [];
for (const k of ['SUPABASE_URL', 'SUPABASE_KEY', 'NOME_PROFISSIONAL']) if (env(k)) extra.push(`window.${k} = ${JSON.stringify(env(k))};`);
if (somenteLeitura) extra.push('window.SOMENTE_LEITURA = true;');
if (extra.length) cfg += '\n// Definido no build\n' + extra.join('\n') + '\n';
if (!env('SUPABASE_URL') || !env('SUPABASE_KEY')) console.warn('Aviso: SUPABASE_URL ou SUPABASE_KEY não definidas; a página não vai conseguir abrir os dados.');

const app = ler('src/app.js');
for (const [n, s] of [['config', cfg], ['app', app]]) if (/<\/script/i.test(s)) throw new Error(n + ' contém </script>');
const html = ler('src/index.html').replace('<script>/*CONFIG*/</script>', () => '<script>\n' + cfg + '</script>')
  .replace('<script>/*APP*/</script>', () => '<script>\n' + app + '</script>');
fs.mkdirSync(path.join(raiz, 'dist'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'dist/index.html'), html);
console.log('dist/index.html gerado (' + Math.round(html.length / 1024) + ' KB)' + (somenteLeitura ? ' · somente leitura' : ''));
