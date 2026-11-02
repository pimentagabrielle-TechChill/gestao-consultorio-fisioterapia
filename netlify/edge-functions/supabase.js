// Repassa /supabase/* para a API do Supabase pelo próprio site.
// Assim o navegador só fala com o endereço do site, e bloqueadores, VPNs ou
// filtros de rede que barram "supabase.co" não derrubam o sistema.
// O endereço do banco vem da variável de ambiente SUPABASE_URL do Netlify.
const REPASSA = ["content-type", "apikey", "authorization", "prefer", "accept", "accept-profile", "content-profile"];
const json = (status, msg) => new Response(JSON.stringify({ message: msg }), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const base = String(Netlify.env.get("SUPABASE_URL") || "").replace(/\/+$/, "");
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base)) return json(500, "SUPABASE_URL não configurada no Netlify.");
  const url = new URL(req.url);
  const alvo = base + "/rest/v1" + url.pathname.replace(/^\/supabase/, "") + url.search;
  const headers = new Headers();
  for (const h of REPASSA) {
    const v = req.headers.get(h);
    if (v) headers.set(h, v);
  }
  const temCorpo = !["GET", "HEAD"].includes(req.method);
  try {
    const r = await fetch(alvo, { method: req.method, headers, body: temCorpo ? await req.arrayBuffer() : undefined });
    const out = new Headers();
    for (const h of ["content-type", "content-range", "preference-applied"]) {
      const v = r.headers.get(h);
      if (v) out.set(h, v);
    }
    out.set("cache-control", "no-store");
    return new Response(r.body, { status: r.status, headers: out });
  } catch (e) {
    return json(502, "Falha ao falar com o banco: " + (e && e.message || e));
  }
};

export const config = { path: "/supabase/*" };
