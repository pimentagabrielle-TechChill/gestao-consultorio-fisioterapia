var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
(function() {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s != null ? s : "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const brl = (n) => (+n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const num = (v) => {
    const n = parseFloat(String(v != null ? v : "").replace(",", "."));
    return isNaN(n) ? 0 : n;
  };
  const fmtN = (n, d = 0) => (+n || 0).toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: 0 });
  const pad = (n) => String(n).padStart(2, "0");
  const isoOf = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parseISO = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const addDays = (s, n) => {
    const d = parseISO(s);
    d.setDate(d.getDate() + n);
    return isoOf(d);
  };
  const mkOf = (s) => s.slice(0, 7);
  const hm = (t) => {
    const [h, m] = String(t || "0:0").split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const tm = (x) => pad(Math.floor(x / 60)) + ":" + pad(x % 60);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const today = () => isoOf(/* @__PURE__ */ new Date());
  const DIAS = ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"];
  const DIAS_C = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\xE1b"];
  const MESES = ["janeiro", "fevereiro", "mar\xE7o", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const mesLabel = (mk) => {
    const [y, m] = mk.split("-");
    return MESES[+m - 1] + " de " + y;
  };
  const addMonth = (mk, n) => {
    const [y, m] = mk.split("-").map(Number);
    const d = new Date(y, m - 1 + n, 1);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1);
  };
  const diasNoMes = (mk) => {
    const [y, m] = mk.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  };
  const dataCurta = (s) => {
    const d = parseISO(s);
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1);
  };
  const dataLonga = (s) => {
    const d = parseISO(s);
    return DIAS[d.getDay()] + ", " + d.getDate() + " de " + MESES[d.getMonth()];
  };
  const byHora = (a, b) => hm(a.hora) - hm(b.hora);
  const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const SEMANAS = 4.33;
  function defaultConfig() {
    const tarde = [{ localId: "studio", inicio: "15:00", fim: "21:00" }];
    return {
      perfil: { nome: String(window.NOME_PROFISSIONAL || "Seu nome"), titulo: "Fisioterapeuta", crefito: "", logo: "" },
      revisado: false,
      nfMigrado: true,
      locais: [{ id: "studio", nome: "Studio", tipo: "studio" }, { id: "home", nome: "Home care", tipo: "home" }],
      nfPercent: 0,
      nfHomePercent: 0,
      deslocamentoHome: 0,
      turmaCapacidade: 3,
      duracaoAtendimento: 50,
      intervaloAgenda: 10,
      servicos: [],
      planos: [],
      apps: [],
      disponibilidade: { "0": [], "1": tarde.map((x) => __spreadValues({}, x)), "2": tarde.map((x) => __spreadValues({}, x)), "3": tarde.map((x) => __spreadValues({}, x)), "4": tarde.map((x) => __spreadValues({}, x)), "5": tarde.map((x) => __spreadValues({}, x)), "6": [] },
      metaMensal: 0,
      simulacao: {}
    };
  }
  function mergeCfg(c) {
    const d = defaultConfig();
    if (!c) return d;
    const out = __spreadValues(__spreadValues({}, d), c);
    out.perfil = __spreadValues(__spreadValues({}, d.perfil), c.perfil || {});
    out.disponibilidade = __spreadValues(__spreadValues({}, d.disponibilidade), c.disponibilidade || {});
    ["servicos", "planos", "apps", "locais"].forEach((k) => {
      if (!Array.isArray(out[k])) out[k] = d[k];
    });
    out.servicos.forEach((x) => {
      x.grupo = false;
    });
    if (!out.nfMigrado) {
      out.servicos.forEach((x) => {
        if (x.nfPercent == null || x.nfPercent === "") x.nfPercent = num(c.nfPercent);
      });
      out.nfMigrado = true;
    }
    if (!out.simulacao || typeof out.simulacao !== "object") out.simulacao = {};
    return out;
  }
  // ---------------------------------------------------------------------------
  // Acesso aos dados: Supabase. Cada função antiga do Apps Script virou uma
  // função no banco (veja supabase/01_estrutura.sql), chamada por /rest/v1/rpc.
  // ---------------------------------------------------------------------------
  const RPC = {
    login: ["login", ["p_usuario", "p_senha", "p_lembrar"]],
    me: ["me", ["p_token"]],
    logout: ["logout", ["p_token"]],
    changePassword: ["change_password", ["p_token", "p_atual", "p_nova"]],
    listUsers: ["list_users", ["p_token"]],
    saveUser: ["save_user", ["p_token", "p_dados"]],
    removeUser: ["remove_user", ["p_token", "p_usuario"]],
    getDoc: ["get_doc", ["p_token", "p_chave"]],
    setDoc: ["set_doc", ["p_token", "p_chave", "p_dados"]],
    clearAll: ["clear_all", ["p_token"]],
    myPhoto: ["my_photo", ["p_token"]],
    userPhotos: ["user_photos", ["p_token"]],
    setUserPhoto: ["set_user_photo", ["p_token", "p_usuario", "p_foto"]]
  };
  const SB_URL = String(window.SUPABASE_URL || "").replace(/\/+$/, "");
  const SB_KEY = String(window.SUPABASE_KEY || "");
  // Publicado (http/https), as chamadas passam pelo próprio site: o Netlify repassa
  // /supabase/* para o Supabase (veja netlify.toml). Assim bloqueadores de anúncio,
  // VPNs e filtros de rede que barram "supabase.co" não derrubam o sistema.
  // Aberto como arquivo no computador (file://), chama o Supabase direto.
  const SB_PROXY = String(window.SUPABASE_PROXY || "");
  const SB_DIRETO = SB_URL + "/rest/v1";
  // Se o repasse do Netlify não responder (erro de rede ou 404 que não veio do
  // Supabase), passa a chamar o Supabase direto até a página ser recarregada.
  let SB_API = SB_PROXY && /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? SB_PROXY.replace(/\/+$/, "") : SB_DIRETO;
  const veioDoSupabase = (r) => /json/i.test(r.headers.get("content-type") || "");
  // Prévia (deploy-preview do Netlify): usa o banco oficial só para ler. Nada é gravado.
  const SOMENTE_LEITURA = window.SOMENTE_LEITURA === true;
  const GRAVA = ["setDoc", "saveUser", "removeUser", "clearAll", "changePassword", "setUserPhoto"];
  if (SOMENTE_LEITURA) {
    const faixa = () => {
      const d = document.createElement("div");
      d.id = "faixa-previa";
      d.setAttribute("role", "status");
      d.textContent = "PR\xC9VIA \xB7 somente visualiza\xE7\xE3o \xB7 nada \xE9 gravado";
      document.body.appendChild(d);
    };
    if (document.body) faixa();
    else document.addEventListener("DOMContentLoaded", faixa);
  }
  const Store = {
    mode: "supabase",
    dl: true,
    async init() {
    },
    async raw(fn, ...args) {
      if (!/^(https:\/\/.+|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/.test(SB_URL) || !SB_KEY || /COLE_AQUI/.test(SB_KEY)) {
        throw new Error("Sistema ainda n\xE3o configurado: preencha o endere\xE7o e a chave do Supabase.");
      }
      if (SOMENTE_LEITURA && GRAVA.includes(fn)) {
        // Altera\xE7\xF5es da agenda, cadastro etc. ficam s\xF3 na tela; o resto avisa que n\xE3o grava.
        if (fn === "setDoc" || fn === "setUserPhoto") return true;
        throw new Error("Esta \xE9 uma pr\xE9via: nada \xE9 gravado. Fa\xE7a isso no sistema oficial.");
      }
      const [nome, params] = RPC[fn];
      const body = {};
      params.forEach((p, i) => body[p] = args[i] === void 0 ? null : args[i]);
      const headers = { "Content-Type": "application/json", apikey: SB_KEY };
      if (/^eyJ/.test(SB_KEY)) headers.Authorization = "Bearer " + SB_KEY;
      const enviar = (base) => fetch(base + "/rpc/" + nome, { method: "POST", headers, body: JSON.stringify(body) });
      let r;
      try {
        try {
          r = await enviar(SB_API);
        } catch (e) {
          if (SB_API === SB_DIRETO) throw e;
          SB_API = SB_DIRETO;
          r = await enviar(SB_API);
        }
        if (r.status === 404 && SB_API !== SB_DIRETO && !veioDoSupabase(r)) {
          SB_API = SB_DIRETO;
          r = await enviar(SB_API);
        }
      } catch (e) {
        throw new Error("Sem conex\xE3o com o servidor. Verifique a internet e tente de novo. (" + (e && e.message || e) + ")");
      }
      const txt = await r.text();
      let data = null;
      try {
        data = txt ? JSON.parse(txt) : null;
      } catch (e) {
        throw new Error("Resposta inesperada do servidor (" + r.status + ").");
      }
      if (!r.ok) throw new Error(data && (data.message || data.error || data.hint) || "Erro " + r.status + " no servidor.");
      if (fn === "login" && data && data.erro) throw new Error(data.erro);
      return data;
    },
    async call(fn, ...args) {
      try {
        return await this.raw(fn, Auth.token, ...args);
      } catch (e) {
        if (String(e && e.message || e).includes("SESSAO_EXPIRADA")) sessaoExpirada();
        throw e;
      }
    },
    async get(k) {
      const d = await this.call("getDoc", k);
      return d == null ? null : d;
    },
    async set(k, v) {
      return this.call("setDoc", k, v);
    },
    async clearAll() {
      return this.call("clearAll");
    }
  };
  const S = { config: null, pacientes: [], pacotes: [], months: {}, view: "inicio", dia: today(), mesFin: mkOf(today()), mesMeta: mkOf(today()), loaded: false, loadErr: false, filtroPac: "todos", filtroOrig: "*", buscaPac: "", fin: null, fmonths: {}, cartTab: "resumo", mesCart: mkOf(today()) };
  const serv = (id) => S.config.servicos.find((s) => s.id === id);
  const localBy = (id) => S.config.locais.find((l) => l.id === id);
  const tipoLocal = (id) => {
    var _a;
    return ((_a = localBy(id)) == null ? void 0 : _a.tipo) === "home" ? "home" : "studio";
  };
  const pacBy = (id) => S.pacientes.find((p) => p.id === id);
  const planoBy = (id) => S.config.planos.find((p) => p.id === id);
  const appBy = (id) => S.config.apps.find((p) => p.id === id);
  const pacNome = (id) => {
    var _a;
    return id ? ((_a = pacBy(id)) == null ? void 0 : _a.nome) || "Paciente removido" : "Aula dada";
  };
  const ehStudio = (a) => a && a.cobranca === "studio";
  const nomeAt = (a) => a.pacienteId ? pacNome(a.pacienteId) : ehStudio(a) ? "Atendimento pago pela cl\xEDnica" : "Sem paciente";
  const vagasDe = (a) => ehStudio(a) ? Math.max(1, num(a.qtdAlunos) || 1) : 1;
  const cobServ = (s) => s && ["atendimento", "aula", "nenhum"].includes(s.cobrancaServ) ? s.cobrancaServ : "atendimento";
  const porAula = (s) => cobServ(s) === "aula";
  const COB_SERV = [["atendimento", "Por atendimento"], ["aula", "Por aula dada"], ["nenhum", "N\xE3o se aplica"]];
  const timers = {}, chains = {};
  let pending = 0, saveState = "ok";
  function setSaveState(s) {
    saveState = s;
    const el = $("#savestate");
    if (el) {
      el.textContent = s === "saving" ? "Salvando\u2026" : s === "err" ? "N\xE3o foi poss\xEDvel salvar. Verifique a conex\xE3o e refa\xE7a a \xFAltima altera\xE7\xE3o." : SOMENTE_LEITURA ? "Pr\xE9via: altera\xE7\xE3o s\xF3 na tela, n\xE3o gravada" : "Tudo salvo";
      el.className = "savestate" + (s === "err" ? " err" : "");
    }
  }
  function docFor(k) {
    if (k === "config") return S.config;
    if (k === "pacientes") return { lista: S.pacientes };
    if (k === "pacotes") return { lista: S.pacotes };
    if (k === "fin") return S.fin;
    if (k.startsWith("f-")) return S.fmonths[k.slice(2)];
    return S.months[k.slice(2)];
  }
  // Mesmas regras do banco (set_doc): evita tentar gravar o que o usuário não pode alterar.
  function podeGravar(k) {
    const ed = (...mods) => mods.some((m) => perm(m) === "editar");
    if (k === "fin" || /^f-/.test(k)) return ed("carteira");
    if (k === "config") return ed("config", "metas");
    if (k === "pacientes" || k === "pacotes" || /^cp-/.test(k) || /^m-/.test(k)) return ed("agenda", "pacientes", "financeiro", "inicio");
    return isAdmin();
  }
  function save(k) {
    if (!S.loaded) return;
    if (Auth.user && !podeGravar(k)) return;
    const d = docFor(k);
    if (!d || d._err) return;
    clearTimeout(timers[k]);
    setSaveState("saving");
    timers[k] = setTimeout(() => flush(k), 450);
  }
  function flush(k) {
    pending++;
    chains[k] = (chains[k] || Promise.resolve()).then(() => Store.set(k, docFor(k))).then(() => {
      pending--;
      if (!pending) setSaveState("ok");
    }).catch(() => {
      pending--;
      setSaveState("err");
    });
  }
  const normMonth = (d) => {
    const m = { atendimentos: Array.isArray(d == null ? void 0 : d.atendimentos) ? d.atendimentos : [], mensalidades: d && typeof d.mensalidades === "object" && d.mensalidades || {} };
    // Guarda o registro do repasse da clínica (recebido, valor e data).
    if (d && d.repasse && typeof d.repasse === "object") m.repasse = d.repasse;
    return m;
  };
  const loadingM = {};
  function ensureMonth(mk) {
    if (S.months[mk]) return Promise.resolve(S.months[mk]);
    if (!loadingM[mk]) loadingM[mk] = Store.get("m-" + mk).then((d) => {
      S.months[mk] = normMonth(d);
      return S.months[mk];
    }).catch(() => {
      S.months[mk] = __spreadProps(__spreadValues({}, normMonth(null)), { _err: true });
      return S.months[mk];
    });
    return loadingM[mk];
  }
  // Cada mês ainda carregando agenda UM redesenho quando chegar. (Antes, cada
  // redesenho agendava outro para cada mês pendente e a tela travava na Carteira.)
  const aguardaM = new Set(), aguardaF = new Set();
  function M(mk) {
    if (S.months[mk]) return S.months[mk];
    if (!aguardaM.has(mk)) {
      aguardaM.add(mk);
      ensureMonth(mk).then(() => {
        aguardaM.delete(mk);
        render();
      });
    }
    return null;
  }
  function findAt(id) {
    for (const mk in S.months) {
      const a = S.months[mk].atendimentos.find((x) => x.id === id);
      if (a) return { a, mk };
    }
    return null;
  }
  const nfServ = (s) => s && s.nfPercent != null && s.nfPercent !== "" ? num(s.nfPercent) : num(S.config.nfPercent);
  function nfDoAtend(a) {
    const s = serv(a.servicoId);
    if (a.nfOn != null) return a.nfOn ? a.nfPct != null && a.nfPct !== "" ? num(a.nfPct) : nfServ(s) : 0;
    if (isento(s, a.cobranca)) return 0;
    return tipoLocal(a.localId) === "studio" ? nfServ(s) : num(S.config.nfHomePercent);
  }
  function nfPadrao(p, s, cobranca) {
    const pct = nfServ(s), pref = (p == null ? void 0 : p.notaFiscal) || "auto";
    if (pref === "nunca") return { on: false, pct };
    if (pref === "sempre") return { on: true, pct };
    return { on: pct > 0 && !isento(s, cobranca), pct };
  }
  function custoAt(a, seen) {
    const s = serv(a.servicoId), v = num(a.valor), tipo = tipoLocal(a.localId);
    let al = 0, desl = 0;
    if (tipo === "home") desl = num(S.config.deslocamentoHome);
    if (a.alOn != null) {
      al = a.alOn ? v * num(a.alPct) / 100 : 0;
    } else if (tipo !== "home" && s && !isento(s, a.cobranca)) {
      if (s.aluguelTipo === "percent") al = v * num(s.aluguelValor) / 100;
      else if (s.aluguelTipo === "fixo") al = num(s.aluguelValor);
      else if (s.aluguelTipo === "hora") {
        const k = s.grupo ? a.data + "|" + a.hora + "|" + a.localId : a.id;
        if (!seen || !seen.has(k)) {
          if (seen) seen.add(k);
          al = num(s.aluguelValor) * (num(a.duracao) || num(s.duracao) || 60) / 60;
        }
      }
    }
    const pct = nfDoAtend(a);
    let nf = v * pct / 100;
    // Nota + sala: desconto total fixo de 50% (não soma os percentuais).
    if (nf > 0 && al > 0) nf = Math.max(0, v * 0.5 - al);
    const combo = pct > 0 && al > 0 ? nf + al : 0;
    return { v, nf, al, combo, desl, liq: v - nf - al - desl, tipo, pct: v ? nf / v * 100 : pct, alPct: v ? al / v * 100 : 0 };
  }
  function taxaStudio(s, v, grupoHora = true) {
    const nf = v * nfServ(s) / 100;
    let al = 0;
    if (s) {
      if (s.aluguelTipo === "percent") al = v * num(s.aluguelValor) / 100;
      else if (s.aluguelTipo === "fixo") al = num(s.aluguelValor);
      else if (s.aluguelTipo === "hora" && grupoHora) al = num(s.aluguelValor) * (num(s.duracao) || 60) / 60;
    }
    return { nf, al, desl: 0, liq: v - nf - al };
  }
  const semDescAvulso = (s) => !!s && (s.semDescontoAvulso != null ? !!s.semDescontoAvulso : /pilates/i.test(s.nome || ""));
  const isento = (s, cobranca) => cobranca === "app" || cobranca === "studio" || semDescAvulso(s);
  const taxaIsenta = (v, tipo) => {
    const desl = tipo === "home" ? num(S.config.deslocamentoHome) : 0;
    return { nf: 0, al: 0, desl, liq: v - desl };
  };
  function taxaHome(v, s) {
    const nf = v * nfServ(s) / 100, desl = num(S.config.deslocamentoHome);
    return { nf, al: 0, desl, liq: v - nf - desl };
  }
  function taxaMens(plano, v) {
    return { nf: 0, al: 0, liq: v };
    const s = plano && serv(plano.servicoId);
    const nf = v * nfServ(s) / 100;
    const al = s && s.aluguelTipo === "percent" ? v * num(s.aluguelValor) / 100 : 0;
    return { nf, al, liq: v - nf - al };
  }
  const valorMens = (p) => {
    var _a;
    return num(p.valorPersonalizado) || num((_a = planoBy(p.planoId)) == null ? void 0 : _a.valor);
  };
  function mensalidadesDoMes(mk) {
    var _a;
    const m = S.months[mk] || { mensalidades: {} };
    const out = [];
    for (const p of S.pacientes) {
      const e = (_a = m.mensalidades) == null ? void 0 : _a[p.id];
      const ini = p.inicio || p.criadoEm;
      const eleg = p.tipoCobranca === "plano" && p.ativo !== false && (!ini || mkOf(ini) <= mk);
      if (!e && !eleg) continue;
      out.push({ pac: p, plano: planoBy(p.planoId), valor: e && e.valor != null ? num(e.valor) : valorMens(p), pago: !!(e == null ? void 0 : e.pago) });
    }
    return out.sort((a, b) => a.pac.nome.localeCompare(b.pac.nome));
  }
  function calcMes(mk, sts, comMens = true) {
    const m = S.months[mk] || normMonth(null);
    const r = { bruto: 0, nf: 0, al: 0, desl: 0, liq: 0, recebido: 0, pendente: 0, qtd: 0, porServ: {}, porLocal: { studio: { bruto: 0, liq: 0, qtd: 0 }, home: { bruto: 0, liq: 0, qtd: 0 } }, mens: { bruto: 0, liq: 0, recebido: 0, pendente: 0, qtd: 0 } };
    const seen = /* @__PURE__ */ new Set();
    for (const a of m.atendimentos) {
      if (!sts.includes(stEf(a))) continue;
      const x = custoAt(a, seen), v = x.v, tipo = x.tipo;
      r.bruto += v;
      r.nf += x.nf;
      r.al += x.al;
      r.desl += x.desl;
      r.liq += x.liq;
      r.qtd++;
      const ps = r.porServ[a.servicoId] || (r.porServ[a.servicoId] = { qtd: 0, bruto: 0, liq: 0, al: 0, nf: 0 });
      ps.qtd++;
      ps.bruto += v;
      if (x.combo) ps.combo = (ps.combo || 0) + x.combo;
      else {
        ps.al += x.al;
        ps.nf += x.nf;
      }
      ps.liq += x.liq;
      const pl = r.porLocal[tipo];
      pl.qtd++;
      pl.bruto += v;
      pl.liq += x.liq;
      if (stEf(a) === "realizado") {
        if (a.pago || v === 0) r.recebido += v;
        else r.pendente += v;
      }
    }
    if (comMens) for (const it of mensalidadesDoMes(mk)) {
      const x = taxaMens(it.plano, it.valor);
      r.bruto += it.valor;
      r.nf += x.nf;
      r.al += x.al;
      r.liq += x.liq;
      r.mens.bruto += it.valor;
      r.mens.liq += x.liq;
      r.mens.qtd++;
      r.porLocal.studio.bruto += it.valor;
      r.porLocal.studio.liq += x.liq;
      if (it.pago) {
        r.recebido += it.valor;
        r.mens.recebido += it.valor;
      } else {
        r.pendente += it.valor;
        r.mens.pendente += it.valor;
      }
    }
    return r;
  }
  // =====================================================================
  // REGRAS DE RECEBIMENTO (extrato): cada valor conta no dia em que o
  // dinheiro entra.
  //  - Pilates/Personal, aplicativos e atendimentos com nota: pagos pela
  //    clínica no repasse do 5º dia útil do mês seguinte.
  //    Nota + sala = 50% fixo; só nota = valor − % da nota; Pilates/Personal = valor cheio.
  //  - Demais atendimentos: pagos pelo paciente no dia do pagamento (valor cheio).
  //    Se usou sala no studio, a sala (%) é descontada do repasse seguinte.
  //  - Pacotes: entram inteiros no dia do pagamento; cada sessão realizada
  //    desconta a sala sobre (valor do pacote ÷ sessões) no repasse.
  // =====================================================================
  const FERIADOS_FIXOS = ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"];
  const feriadosCache = {};
  function feriadosDoAno(y) {
    if (feriadosCache[y]) return feriadosCache[y];
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = (h + l - 7 * m + 114) % 31 + 1;
    const pascoa = y + "-" + pad(mes) + "-" + pad(dia);
    const set = new Set(FERIADOS_FIXOS.map((x) => y + "-" + x));
    [-48, -47, -2, 60].forEach((n) => set.add(addDays(pascoa, n)));
    return feriadosCache[y] = set;
  }
  const diaUtil = (iso) => {
    const wd = parseISO(iso).getDay();
    return wd !== 0 && wd !== 6 && !feriadosDoAno(+iso.slice(0, 4)).has(iso);
  };
  function quintoDiaUtil(mk) {
    let d = mk + "-01", n = 0;
    for (; ; d = addDays(d, 1)) if (diaUtil(d) && ++n === 5) return d;
  }
  const ehServClinica = (s) => !!s && /pilates|personal/i.test(s.nome || "");
  const pacoteBy = (id) => (S.pacotes || []).find((p) => p.id === id);
  const valorFinalPac = (p) => Math.max(0, num(p.valor) - num(p.desconto));
  const valorSessaoPac = (p) => num(p.sessoes) ? valorFinalPac(p) / num(p.sessoes) : 0;
  function salaPctAt(a) {
    if (tipoLocal(a.localId) !== "studio") return 0;
    if (a.alOn != null) return a.alOn ? num(a.alPct) : 0;
    const s = serv(a.servicoId);
    return s && s.aluguelTipo === "percent" && !isento(s, a.cobranca) ? num(s.aluguelValor) : 0;
  }
  const notaPctAt = (a) => nfDoAtend(a);
  // De onde vem o dinheiro deste atendimento.
  function origemAt(a) {
    const s = serv(a.servicoId);
    if (a.cobranca === "plano") return "plano";
    if (a.pacoteId && pacoteBy(a.pacoteId)) return "pacote";
    if (ehServClinica(s) || a.cobranca === "app" || a.cobranca === "studio" || notaPctAt(a) > 0) return "clinica";
    return "paciente";
  }
  // Quanto a clínica repassa por este atendimento (antes de descontar salas).
  function valorClinicaAt(a) {
    const v = num(a.valor), s = serv(a.servicoId);
    if (ehServClinica(s) || a.cobranca === "app" || a.cobranca === "studio") return v;
    const nf = notaPctAt(a);
    return salaPctAt(a) > 0 ? v * 0.5 : v * (1 - nf / 100);
  }
  // Sala que a clínica desconta do repasse (atendimentos pagos pelo paciente ou de pacote).
  function salaDebitoAt(a) {
    const pct = salaPctAt(a);
    if (!pct) return 0;
    const o = origemAt(a);
    if (o === "paciente") return num(a.valor) * pct / 100;
    if (o === "pacote") return valorSessaoPac(pacoteBy(a.pacoteId)) * pct / 100;
    return 0;
  }
  // Sala que já vem descontada dentro dos 50% (nota + sala): só para mostrar a conta completa.
  function salaEmbutidaAt(a) {
    const s = serv(a.servicoId);
    if (origemAt(a) !== "clinica" || ehServClinica(s) || a.cobranca === "app" || a.cobranca === "studio") return 0;
    return num(a.valor) * salaPctAt(a) / 100;
  }
  const contaRealizado = (a) => stEf(a) === "realizado";
  // Repasse da clínica referente aos atendimentos do mês mk (pago no 5º dia útil do mês seguinte).
  function repasseDoMes(mk) {
    const m = S.months[mk];
    if (!m) return null;
    const itens = [], salas = [];
    let salaEmb = 0;
    for (const a of m.atendimentos) {
      if (!contaRealizado(a)) continue;
      const o = origemAt(a);
      if (o === "clinica") {
        const v = valorClinicaAt(a), se = salaEmbutidaAt(a), cheio = num(a.valor);
        const desc = Math.max(0, cheio - v);
        if (v || cheio) itens.push({ a, v, cheio, combo: se ? desc : 0, nota: se ? 0 : desc });
        salaEmb += se;
      } else if (o === "paciente" || o === "pacote") {
        const v = salaDebitoAt(a);
        if (v) salas.push({ a, v });
      }
    }
    const porData = (x, y) => (x.a.data + x.a.hora).localeCompare(y.a.data + y.a.hora);
    itens.sort(porData);
    salas.sort(porData);
    const clinica = itens.reduce((t, x) => t + x.v, 0), sala = salas.reduce((t, x) => t + x.v, 0), calc = clinica - sala;
    const cheio = itens.reduce((t, x) => t + x.cheio, 0), nota = itens.reduce((t, x) => t + x.nota, 0), combo = itens.reduce((t, x) => t + x.combo, 0);
    const r = m.repasse || {};
    return { mk, data: quintoDiaUtil(addMonth(mk, 1)), itens, salas, clinica, sala, salaEmb, cheio, nota, combo, calc, recebido: !!r.recebido, recebidoEm: r.recebidoEm || null, valor: r.recebido && r.valor != null && r.valor !== "" ? num(r.valor) : calc, temAlgo: itens.length + salas.length > 0 };
  }
  // Produzido: o que cada atendimento rende para a profissional, pela data do atendimento (já com as regras novas).
  function rendeAt(a) {
    const o = origemAt(a);
    if (o === "clinica") return valorClinicaAt(a);
    if (o === "paciente") return num(a.valor) - salaDebitoAt(a);
    if (o === "pacote") return valorSessaoPac(pacoteBy(a.pacoteId)) - salaDebitoAt(a);
    return 0;
  }
  function producaoDoMes(mk) {
    const m = S.months[mk];
    if (!m) return null;
    let real = 0, agend = 0;
    for (const a of m.atendimentos) {
      if (contaRealizado(a)) real += rendeAt(a);
      else if (a.status === "agendado") agend += rendeAt(a);
    }
    for (const it of mensalidadesDoMes(mk)) real += it.valor;
    return { real, agend };
  }
  // Resumo do repasse com os descontos de sala e de nota separados.
  function resumoRepasseHTML(rp, total = "Repasse") {
    const desc = rp.nota + rp.combo + rp.sala;
    const parte = (rot, v) => v ? `<div class="kv small muted" style="padding-left:14px"><span>${rot}</span><span class="num">${brl(v)}</span></div>` : "";
    return `<div class="kv"><span>Valor feito pela cl\xEDnica (Pilates, Personal, aplicativos e atendimentos com nota)</span><span class="num">${brl(rp.cheio)}</span></div>
    <div class="kv"><span>Total de descontos</span><span class="num neg">\u2212 ${brl(desc)}</span></div>
    ${parte("Sala dos atendimentos pagos direto pelo paciente", rp.sala)}${parte("Nota", rp.nota)}${parte("Nota + sala (50%)", rp.combo)}
    <div class="kv total"><span>${total}</span><span>${brl(rp.calc)}</span></div>`;
  }
  const dataPagto = (a) => a.pagoEm || a.data;
  // Entradas de dinheiro no mês mk. Retorna null enquanto algum mês necessário carrega.
  function extrato(mk) {
    const meses = [addMonth(mk, -3), addMonth(mk, -2), addMonth(mk, -1), mk];
    if (meses.map((k) => M(k)).some((x) => !x)) return null;
    const ent = [];
    for (const k of meses) for (const a of S.months[k].atendimentos) {
      if (!contaRealizado(a) || origemAt(a) !== "paciente" || !a.pago || !num(a.valor)) continue;
      if (mkOf(dataPagto(a)) !== mk) continue;
      const s = serv(a.servicoId);
      ent.push({ data: dataPagto(a), tipo: "paciente", desc: nomeAt(a), det: ((s == null ? void 0 : s.nome) || "Atendimento") + " de " + dataCurta(a.data) + (a.forma ? " \xB7 " + a.forma : ""), valor: num(a.valor), id: a.id, comp: a.comprovante });
    }
    for (const p of S.pacotes || []) if (p.pagoEm && mkOf(p.pagoEm) === mk) ent.push({ data: p.pagoEm, tipo: "pacote", desc: (pacBy(p.pacienteId) || {}).nome || "Paciente", det: "Pacote de " + num(p.sessoes) + " sess\xF5es" + (p.forma ? " \xB7 " + p.forma + (num(p.parcelas) > 1 ? " " + p.parcelas + "x" : "") : ""), valor: valorFinalPac(p), pacId: p.id });
    for (const k of meses.slice(0, 3)) {
      const rp = repasseDoMes(k);
      if (rp && rp.recebido && mkOf(rp.recebidoEm || rp.data) === mk) ent.push({ data: rp.recebidoEm || rp.data, tipo: "repasse", desc: "Repasse da cl\xEDnica", det: "Atendimentos de " + mesLabel(k), valor: rp.valor, mk: k });
    }
    for (const it of mensalidadesDoMes(mk)) if (it.pago) ent.push({ data: mk + "-01", tipo: "mensalidade", desc: it.pac.nome, det: "Mensalidade", valor: it.valor });
    ent.sort((x, y) => x.data.localeCompare(y.data));
    return { mk, ent, total: ent.reduce((t, e) => t + e.valor, 0) };
  }
  // O que ainda deve entrar no mês mk: repasse previsto, pacientes devendo e agenda futura paga pelo paciente.
  function previstoDoMes(mk) {
    const t = today(), ant = addMonth(mk, -1), rp = M(ant) ? repasseDoMes(ant) : null;
    const repasse = rp && !rp.recebido && rp.temAlgo ? rp.calc : 0;
    const devendo = pacientesDevendo(mk);
    const m = M(mk), futuro = (m ? m.atendimentos : []).filter((a) => a.status === "agendado" && a.data >= t && origemAt(a) === "paciente");
    const confirmar = (m ? m.atendimentos : []).filter((a) => a.status === "agendado" && a.data < t && origemAt(a) === "paciente");
    return { repasse, repasseInfo: rp, devendo, devendoTot: devendo.reduce((s, a) => s + num(a.valor), 0), futuroTot: futuro.reduce((s, a) => s + num(a.valor), 0), futuro, confirmarTot: confirmar.reduce((s, a) => s + num(a.valor), 0) };
  }
  // Atendimentos pagos pelo paciente, já realizados e ainda sem pagamento (até o mês mk).
  function pacientesDevendo(mk) {
    const out = [];
    for (const k of [addMonth(mk, -3), addMonth(mk, -2), addMonth(mk, -1), mk]) {
      const m = S.months[k];
      if (m) for (const a of m.atendimentos) if (contaRealizado(a) && origemAt(a) === "paciente" && !a.pago && num(a.valor) > 0) out.push(a);
    }
    return out.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  }
  // Uso dos pacotes: sessões realizadas (e faltas cobradas) e agendadas com o pacote.
  function usoPacote(p) {
    let usadas = 0, agendadas = 0;
    for (const k in S.months) for (const a of S.months[k].atendimentos) if (a.pacoteId === p.id) {
      if (contaRealizado(a)) usadas++;
      else if (a.status === "agendado") agendadas++;
    }
    const total = num(p.sessoes);
    return { usadas, agendadas, restantes: Math.max(0, total - usadas - agendadas), total, vencido: !!(p.fim && p.fim < today()) };
  }
  function carregarMesesPacote(p) {
    if (!p.inicio) return;
    const fim = p.fim || addMonth(mkOf(today()), 1) + "-01";
    for (let k = mkOf(p.inicio), n = 0; k <= mkOf(fim) && n < 24; k = addMonth(k, 1), n++) M(k);
  }
  const pacotesDoPaciente = (pid) => (S.pacotes || []).filter((p) => p.pacienteId === pid && !p.encerrado).sort((a, b) => (b.inicio || "").localeCompare(a.inicio || ""));
  function pacotesUsaveis(pid, sid, data) {
    return pacotesDoPaciente(pid).filter((p) => (p.servicos || []).includes(sid) && (!p.inicio || data >= p.inicio) && (!p.fim || data <= p.fim));
  }
  function cobrancaPara(pac, s) {
    if (pac && s) {
      if (pac.tipoCobranca === "plano") {
        const p = planoBy(pac.planoId);
        if (p) return { cobranca: "plano", valor: 0, label: "Coberto pela mensalidade (" + p.nome + "). A aula entra com R$ 0 e a receita vem da mensalidade." };
      }
      if (pac.tipoCobranca === "app") {
        const ap = appBy(pac.appId);
        if (ap && (ap.servicoId === s.id || semDescAvulso(s))) return { cobranca: "app", valor: num(ap.valor), label: "Check-in " + ap.nome + ": " + brl(ap.valor) + " por aula, sem aluguel e sem nota." };
      }
      if (pac.tipoCobranca === "avulso" && num(pac.valorPersonalizado)) return { cobranca: "avulso", valor: num(pac.valorPersonalizado), label: "Valor combinado com este paciente." };
    }
    if (s && cobServ(s) === "nenhum") return { cobranca: "avulso", valor: 0, label: "Este servi\xE7o n\xE3o tem valor padr\xE3o: informe o valor neste agendamento." };
    return { cobranca: "avulso", valor: num(s == null ? void 0 : s.valor), label: s ? "Valor padr\xE3o de " + s.nome + "." : "" };
  }
  function horasDisp(mk, tipo) {
    let tot = 0;
    const n = diasNoMes(mk);
    const [y, mo] = mk.split("-").map(Number);
    for (let d = 1; d <= n; d++) {
      const wd = new Date(y, mo - 1, d).getDay();
      for (const w of S.config.disponibilidade[wd] || []) {
        if (tipoLocal(w.localId) === tipo) tot += Math.max(0, hm(w.fim) - hm(w.inicio)) / 60;
      }
    }
    return tot;
  }
  const intervalo = () => Math.max(0, num(S.config.intervaloAgenda));
  const durPadrao = () => num(S.config.duracaoAtendimento) || 50;
  const durDe = (a) => {
    var _a;
    return num(a.duracao) || num((_a = serv(a.servicoId)) == null ? void 0 : _a.duracao) || durPadrao();
  };
  const bloco = (a) => {
    const i = hm(a.hora);
    return [i, i + durDe(a) + intervalo()];
  };
  const sobrepoe = (a, b) => a[0] < b[1] && b[0] < a[1];
  function horasOcup(mk) {
    const m = S.months[mk];
    const r = { studio: 0, home: 0 };
    if (!m) return r;
    const seen = /* @__PURE__ */ new Set();
    for (const a of m.atendimentos) {
      if (livreSt(a.status)) continue;
      const s = serv(a.servicoId);
      const k = (s == null ? void 0 : s.grupo) ? a.data + "|" + a.hora + "|" + a.localId : a.id;
      if (seen.has(k)) continue;
      seen.add(k);
      r[tipoLocal(a.localId)] += (durDe(a) + intervalo()) / 60;
    }
    return r;
  }
  function descMedio(sid, tipo) {
    let v = 0, al = 0, nf = 0;
    for (const mk in S.months) for (const a of S.months[mk].atendimentos) {
      if (a.servicoId !== sid || livreSt(a.status) || a.cobranca === "plano" || a.cobranca === "app" || tipoLocal(a.localId) !== tipo) continue;
      const x = custoAt(a, null);
      if (!x.v) continue;
      v += x.v;
      al += x.al;
      nf += x.nf;
    }
    return v ? { al: al / v, nf: nf / v, base: true } : { al: 0, nf: 0, base: false };
  }
  function opcoes() {
    const c = S.config, out = [], iv = intervalo() / 60, ht0 = durPadrao() / 60 + iv;
    for (const s of c.servicos.filter((s2) => s2.ativo !== false)) {
      const v = num(s.valor), ht = (num(s.duracao) || durPadrao()) / 60 + iv;
      const dS = descMedio(s.id, "studio"), liqS = v * (1 - dS.al - dS.nf);
      out.push({ key: "s:" + s.id, servId: s.id, nome: s.nome, tipo: "studio", unid: "atendimento", uLabel: "atendimentos no studio ou consult\xF3rio", v, liq: liqS, liqHora: liqS / ht, horasUnid: ht, cor: s.cor });
      const dH = descMedio(s.id, "home"), liqH = v * (1 - dH.al - dH.nf) - num(c.deslocamentoHome);
      out.push({ key: "h:" + s.id, servId: s.id, nome: s.nome + " \xB7 home care", tipo: "home", unid: "atendimento", uLabel: "atendimentos em home care", v, liq: liqH, liqHora: liqH / ht, horasUnid: ht, cor: s.cor });
    }
    if (false) for (const p of c.planos) {
      const aulas = num(p.aulasSemana) * SEMANAS, horasUnid = aulas * ht0, liq = num(p.valor);
      out.push({ key: "p:" + p.id, nome: p.nome, tipo: "studio", unid: "aluno/m\xEAs", uLabel: "alunos neste plano", v: liq, liq, liqHora: horasUnid ? liq / horasUnid : 0, horasUnid, cor: "#15847D", vagasSemana: num(p.aulasSemana) });
    }
    for (const ap of c.apps) {
      const liq = num(ap.valor);
      out.push({ key: "a:" + ap.id, nome: ap.nome + " (check-in)", tipo: "studio", unid: "check-in", uLabel: "check-ins no m\xEAs", v: liq, liq, liqHora: liq / ht0, horasUnid: ht0, cor: "#2A6294" });
    }
    return out;
  }
  function simCalc() {
    const sim = S.config.simulacao || {};
    let liq = 0, bruto = 0, hS = 0, hH = 0;
    for (const o of opcoes()) {
      const q = num(sim[o.key]);
      if (!q) continue;
      liq += q * o.liq;
      bruto += q * o.v;
      if (o.tipo === "home") hH += q * o.horasUnid;
      else hS += q * o.horasUnid;
    }
    return { liq, bruto, hS, hH, turmas: 0, seats: {} };
  }
  // Bras\xE3o (bast\xE3o com serpente) em vetor: n\xEDtido em qualquer tamanho. --mark-bg = cor do fundo,
  // usada para "recortar" os cruzamentos da serpente com o bast\xE3o.
  function emblem() {
    return `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2.2"/>
    <circle cx="32" cy="32" r="25.6" stroke="currentColor" stroke-width="1" opacity=".42"/>
    <path d="M32 14.6V51.4" stroke="currentColor" stroke-width="3.3"/>
    <circle cx="32" cy="13.4" r="2.4" fill="currentColor"/>
    <path d="M28.04 49.50C28.02 49.45 27.94 49.29 27.90 49.18C27.86 49.08 27.83 48.97 27.81 48.87C27.78 48.76 27.77 48.66 27.77 48.55C27.76 48.44 27.77 48.34 27.78 48.23C27.80 48.13 27.83 48.02 27.86 47.92C27.90 47.81 27.94 47.71 28.00 47.60C28.06 47.49 28.13 47.39 28.21 47.28C28.28 47.18 28.37 47.07 28.47 46.97C28.57 46.86 28.69 46.76 28.81 46.65C28.93 46.54 29.06 46.44 29.20 46.33C29.34 46.23 29.50 46.12 29.66 46.02C29.82 45.91 29.99 45.81 30.17 45.70C30.35 45.59 30.54 45.49 30.73 45.38C30.93 45.28 31.14 45.17 31.35 45.07C31.56 44.96 31.78 44.86 32.00 44.75C32.22 44.64 32.45 44.54 32.69 44.43C32.92 44.33 33.16 44.22 33.40 44.12C33.64 44.01 33.89 43.91 34.13 43.80C34.38 43.69 34.63 43.59 34.88 43.48C35.12 43.38 35.37 43.27 35.60 43.17C35.83 43.06 36.03 42.96 36.23 42.85C36.44 42.74 36.63 42.64 36.82 42.53C37.00 42.43 37.18 42.32 37.35 42.22C37.52 42.11 37.68 42.01 37.82 41.90C37.97 41.79 38.11 41.69 38.24 41.58C38.36 41.48 38.48 41.37 38.58 41.27C38.68 41.16 38.77 41.06 38.85 40.95C38.93 40.84 38.99 40.74 39.04 40.63C39.09 40.53 39.13 40.42 39.16 40.32C39.19 40.21 39.20 40.11 39.20 40.00C39.20 39.89 39.19 39.79 39.16 39.68C39.13 39.58 39.09 39.47 39.04 39.37C38.99 39.26 38.93 39.16 38.85 39.05C38.77 38.94 38.68 38.84 38.58 38.73C38.48 38.63 38.36 38.52 38.24 38.42C38.11 38.31 37.97 38.21 37.82 38.10C37.68 37.99 37.52 37.89 37.35 37.78C37.18 37.68 37.00 37.57 36.82 37.47C36.63 37.36 36.44 37.26 36.23 37.15C36.03 37.04 35.82 36.94 35.60 36.83C35.38 36.73 35.16 36.62 34.93 36.52C34.70 36.41 34.46 36.31 34.22 36.20C33.99 36.09 33.74 35.99 33.50 35.88C33.25 35.78 33.00 35.67 32.75 35.57C32.50 35.46 32.25 35.36 32.00 35.25C31.75 35.14 31.50 35.04 31.25 34.93C31.00 34.83 30.75 34.72 30.50 34.62C30.26 34.51 30.01 34.41 29.78 34.30C29.54 34.19 29.30 34.09 29.07 33.98C28.84 33.88 28.62 33.77 28.40 33.67C28.18 33.56 27.97 33.46 27.77 33.35C27.56 33.24 27.37 33.14 27.18 33.03C27.00 32.93 26.82 32.82 26.65 32.72C26.48 32.61 26.32 32.51 26.18 32.40C26.03 32.29 25.89 32.19 25.76 32.08C25.64 31.98 25.52 31.87 25.42 31.77C25.32 31.66 25.23 31.56 25.15 31.45C25.07 31.34 25.01 31.24 24.96 31.13C24.91 31.03 24.87 30.92 24.84 30.82C24.81 30.71 24.80 30.61 24.80 30.50C24.80 30.39 24.81 30.29 24.84 30.18C24.87 30.08 24.91 29.97 24.96 29.87C25.01 29.76 25.07 29.66 25.15 29.55C25.23 29.44 25.32 29.34 25.42 29.23C25.52 29.13 25.64 29.02 25.76 28.92C25.89 28.81 26.03 28.71 26.18 28.60C26.32 28.49 26.48 28.39 26.65 28.28C26.82 28.18 27.00 28.07 27.18 27.97C27.37 27.86 27.56 27.76 27.77 27.65C27.97 27.54 28.18 27.44 28.40 27.33C28.62 27.23 28.84 27.12 29.07 27.02C29.30 26.91 29.54 26.81 29.78 26.70C30.01 26.59 30.26 26.49 30.50 26.38C30.75 26.28 31.00 26.17 31.25 26.07C31.50 25.96 31.75 25.86 32.00 25.75C32.25 25.64 32.50 25.54 32.75 25.43C33.00 25.33 33.25 25.22 33.50 25.12C33.74 25.01 33.99 24.91 34.22 24.80C34.46 24.69 34.70 24.59 34.93 24.48C35.16 24.38 35.38 24.27 35.60 24.17C35.82 24.06 36.03 23.96 36.23 23.85C36.44 23.74 36.63 23.64 36.82 23.53C37.00 23.43 37.18 23.32 37.35 23.22C37.52 23.11 37.68 23.01 37.82 22.90C37.97 22.79 38.11 22.69 38.24 22.58C38.36 22.48 38.48 22.37 38.58 22.27C38.68 22.16 38.77 22.06 38.85 21.95C38.93 21.84 38.99 21.74 39.04 21.63C39.09 21.53 39.13 21.42 39.16 21.32C39.19 21.21 39.16 21.35 39.20 21.00C39.24 20.65 39.47 19.77 39.40 19.20C39.33 18.63 38.90 17.87 38.80 17.60" stroke="var(--mark-bg,var(--brand,#0B5A61))" stroke-width="5.2"/>
    <path d="M28.04 49.50C28.02 49.45 27.94 49.29 27.90 49.18C27.86 49.08 27.83 48.97 27.81 48.87C27.78 48.76 27.77 48.66 27.77 48.55C27.76 48.44 27.77 48.34 27.78 48.23C27.80 48.13 27.83 48.02 27.86 47.92C27.90 47.81 27.94 47.71 28.00 47.60C28.06 47.49 28.13 47.39 28.21 47.28C28.28 47.18 28.37 47.07 28.47 46.97C28.57 46.86 28.69 46.76 28.81 46.65C28.93 46.54 29.06 46.44 29.20 46.33C29.34 46.23 29.50 46.12 29.66 46.02C29.82 45.91 29.99 45.81 30.17 45.70C30.35 45.59 30.54 45.49 30.73 45.38C30.93 45.28 31.14 45.17 31.35 45.07C31.56 44.96 31.78 44.86 32.00 44.75C32.22 44.64 32.45 44.54 32.69 44.43C32.92 44.33 33.16 44.22 33.40 44.12C33.64 44.01 33.89 43.91 34.13 43.80C34.38 43.69 34.63 43.59 34.88 43.48C35.12 43.38 35.37 43.27 35.60 43.17C35.83 43.06 36.03 42.96 36.23 42.85C36.44 42.74 36.63 42.64 36.82 42.53C37.00 42.43 37.18 42.32 37.35 42.22C37.52 42.11 37.68 42.01 37.82 41.90C37.97 41.79 38.11 41.69 38.24 41.58C38.36 41.48 38.48 41.37 38.58 41.27C38.68 41.16 38.77 41.06 38.85 40.95C38.93 40.84 38.99 40.74 39.04 40.63C39.09 40.53 39.13 40.42 39.16 40.32C39.19 40.21 39.20 40.11 39.20 40.00C39.20 39.89 39.19 39.79 39.16 39.68C39.13 39.58 39.09 39.47 39.04 39.37C38.99 39.26 38.93 39.16 38.85 39.05C38.77 38.94 38.68 38.84 38.58 38.73C38.48 38.63 38.36 38.52 38.24 38.42C38.11 38.31 37.97 38.21 37.82 38.10C37.68 37.99 37.52 37.89 37.35 37.78C37.18 37.68 37.00 37.57 36.82 37.47C36.63 37.36 36.44 37.26 36.23 37.15C36.03 37.04 35.82 36.94 35.60 36.83C35.38 36.73 35.16 36.62 34.93 36.52C34.70 36.41 34.46 36.31 34.22 36.20C33.99 36.09 33.74 35.99 33.50 35.88C33.25 35.78 33.00 35.67 32.75 35.57C32.50 35.46 32.25 35.36 32.00 35.25C31.75 35.14 31.50 35.04 31.25 34.93C31.00 34.83 30.75 34.72 30.50 34.62C30.26 34.51 30.01 34.41 29.78 34.30C29.54 34.19 29.30 34.09 29.07 33.98C28.84 33.88 28.62 33.77 28.40 33.67C28.18 33.56 27.97 33.46 27.77 33.35C27.56 33.24 27.37 33.14 27.18 33.03C27.00 32.93 26.82 32.82 26.65 32.72C26.48 32.61 26.32 32.51 26.18 32.40C26.03 32.29 25.89 32.19 25.76 32.08C25.64 31.98 25.52 31.87 25.42 31.77C25.32 31.66 25.23 31.56 25.15 31.45C25.07 31.34 25.01 31.24 24.96 31.13C24.91 31.03 24.87 30.92 24.84 30.82C24.81 30.71 24.80 30.61 24.80 30.50C24.80 30.39 24.81 30.29 24.84 30.18C24.87 30.08 24.91 29.97 24.96 29.87C25.01 29.76 25.07 29.66 25.15 29.55C25.23 29.44 25.32 29.34 25.42 29.23C25.52 29.13 25.64 29.02 25.76 28.92C25.89 28.81 26.03 28.71 26.18 28.60C26.32 28.49 26.48 28.39 26.65 28.28C26.82 28.18 27.00 28.07 27.18 27.97C27.37 27.86 27.56 27.76 27.77 27.65C27.97 27.54 28.18 27.44 28.40 27.33C28.62 27.23 28.84 27.12 29.07 27.02C29.30 26.91 29.54 26.81 29.78 26.70C30.01 26.59 30.26 26.49 30.50 26.38C30.75 26.28 31.00 26.17 31.25 26.07C31.50 25.96 31.75 25.86 32.00 25.75C32.25 25.64 32.50 25.54 32.75 25.43C33.00 25.33 33.25 25.22 33.50 25.12C33.74 25.01 33.99 24.91 34.22 24.80C34.46 24.69 34.70 24.59 34.93 24.48C35.16 24.38 35.38 24.27 35.60 24.17C35.82 24.06 36.03 23.96 36.23 23.85C36.44 23.74 36.63 23.64 36.82 23.53C37.00 23.43 37.18 23.32 37.35 23.22C37.52 23.11 37.68 23.01 37.82 22.90C37.97 22.79 38.11 22.69 38.24 22.58C38.36 22.48 38.48 22.37 38.58 22.27C38.68 22.16 38.77 22.06 38.85 21.95C38.93 21.84 38.99 21.74 39.04 21.63C39.09 21.53 39.13 21.42 39.16 21.32C39.19 21.21 39.16 21.35 39.20 21.00C39.24 20.65 39.47 19.77 39.40 19.20C39.33 18.63 38.90 17.87 38.80 17.60" stroke="currentColor" stroke-width="2.7"/>
    <path d="M32 33.25V37.25" stroke="var(--mark-bg,var(--brand,#0B5A61))" stroke-width="5.6" stroke-linecap="butt"/><path d="M32 32.65V37.85" stroke="currentColor" stroke-width="3.3" stroke-linecap="butt"/>
    <ellipse cx="39.00" cy="15.90" rx="2.2" ry="3.1" transform="rotate(18 39.00 15.90)" fill="currentColor" stroke="var(--mark-bg,var(--brand,#0B5A61))" stroke-width="1.1"/>
    <circle cx="39.55" cy="15.00" r=".6" fill="var(--mark-bg,var(--brand,#0B5A61))"/>
  </svg>`;
  }
  const markHTML = (c) => c.perfil.logo ? `<img src="${esc(c.perfil.logo)}" alt="">` : emblem();
  const IC = {
    inicio: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
    agenda: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    pacientes: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.6 3.2-5.5 6.5-5.5s6 1.9 6.5 5.5"/><path d="M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
    carteira: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="3.5" y="8" width="17" height="12" rx="2"/><circle cx="16" cy="14" r="1.3"/>',
    financeiro: '<rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M2.5 10h19M6.5 15h4"/>',
    relatorios: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    metas: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    config: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
  };
  const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
  // Foto redonda do usu\xE1rio; sem foto, mostra as iniciais.
  function avatarHTML(nome, foto, tam = 34) {
    const st = `width:${tam}px;height:${tam}px`;
    if (foto && /^data:image\//.test(foto)) return `<img class="avatar" src="${esc(foto)}" alt="" style="${st}">`;
    const ini = String(nome || "?").trim().split(/\s+/).filter(Boolean);
    const txt = ((ini[0] || "?")[0] + (ini.length > 1 ? ini[ini.length - 1][0] : "")).toUpperCase();
    return `<span class="avatar avatar-ini" aria-hidden="true" style="${st};font-size:${Math.round(tam * 0.36)}px">${esc(txt)}</span>`;
  }
  // Reduz a foto escolhida para um quadrado de 160 px (recorte central), em JPEG.
  function fotoQuadrada(file) {
    return new Promise((res, rej) => {
      if (!file || !/^image\//.test(file.type)) return rej(new Error("Escolha um arquivo de imagem."));
      const r = new FileReader();
      r.onerror = () => rej(new Error("N\xE3o foi poss\xEDvel ler a imagem."));
      r.onload = () => {
        const img = new Image();
        img.onerror = () => rej(new Error("N\xE3o foi poss\xEDvel abrir a imagem."));
        img.onload = () => {
          const lado = Math.min(img.width, img.height), T = 160, cv = document.createElement("canvas");
          cv.width = cv.height = T;
          const cx = cv.getContext("2d");
          cx.fillStyle = "#fff";
          cx.fillRect(0, 0, T, T);
          cx.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, T, T);
          res(cv.toDataURL("image/jpeg", 0.85));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }
  const VIEWS = [["inicio", "In\xEDcio"], ["agenda", "Agenda"], ["pacientes", "Cadastro"], ["financeiro", "Recebimentos"], ["metas", "Metas"], ["relatorios", "Relat\xF3rios"], ["carteira", "Carteira"], ["config", "Configura\xE7\xF5es"]];
  function renderChrome(c) {
    const nm = esc(c.perfil.nome || "Fisioterapeuta"), tt = esc(c.perfil.titulo || ""), cr = c.perfil.crefito ? " \xB7 " + esc(c.perfil.crefito) : "";
    const logado = !!Auth.user;
    const vis = VIEWS.filter(([k]) => !logado || viewPermitida(k)).map(([k, l]) => [k, k === "config" && logado && !perm("config") ? "Minha conta" : l]);
    $("#brand").innerHTML = `<div class="mark">${markHTML(c)}</div><div><div class="brand-name">${nm}</div><div class="brand-sub">${tt}${cr}</div></div>`;
    $("#topbar").innerHTML = `<div class="mark">${markHTML(c)}</div><div class="grow"><div class="brand-name" style="font-size:15px">${nm}</div><div class="brand-sub" style="font-size:12px">${tt}</div></div>${logado ? '<button class="btn small" data-act="sair" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.4)">Sair</button>' : ""}`;
    $("#menu").innerHTML = vis.map(([k, l]) => `<a data-view="${k}" ${S.view === k ? 'aria-current="page"' : ""} tabindex="0">${icon(k)}${l}</a>`).join("");
    $("#bottomnav").innerHTML = vis.map(([k, l]) => `<a data-view="${k}" ${S.view === k ? 'aria-current="page"' : ""} tabindex="0">${icon(k)}${k === "config" ? perm("config") ? "Ajustes" : "Conta" : k === "financeiro" ? "Receber" : k === "relatorios" ? "Relat." : l}</a>`).join("");
    $("#sidefoot").innerHTML = logado ? `<div class="side-user"><div class="side-user-txt"><div>${esc(Auth.user.nome)}</div><button class="linkbtn" data-act="sair" style="color:#DDF1EE;margin-top:4px">Sair</button></div>${avatarHTML(Auth.user.nome, Auth.user.foto, 34)}</div>` : "";
  }
  const head = (t, p, actions = "") => `<div class="pagehead"><div><h1>${t}</h1>${p ? `<p>${p}</p>` : ""}</div><div class="actions"><span class="savestate${saveState === "err" ? " err" : ""}" id="savestate">${saveState === "saving" ? "Salvando\u2026" : saveState === "err" ? "N\xE3o foi poss\xEDvel salvar." : ""}</span>${actions}</div></div>`;
  const loadingHTML = () => '<p class="muted">Carregando\u2026</p>';
  const livreSt = (st) => st === "cancelado" || st === "desmarcado";
  const regraDesm = (s) => !!s && (s.regraDesmarcacao != null ? !!s.regraDesmarcacao : /pilates|personal/i.test(s.nome || ""));
  const limiteDesm = () => num(S.config.antecedenciaDesmarcar) || 2;
  const agoraLocal = () => {
    const d = /* @__PURE__ */ new Date();
    return isoOf(d) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
  };
  const horasAntes = (a, quando) => (/* @__PURE__ */ new Date(a.data + "T" + a.hora + ":00") - new Date(quando)) / 36e5;
  const cobraFalta = (a) => a.status === "falta" && (a.faltaCobrada != null ? !!a.faltaCobrada : regraDesm(serv(a.servicoId)));
  const stEf = (a) => cobraFalta(a) ? "realizado" : a.status;
  const recebeNaHora = (a) => a.cobranca !== "app" && a.cobranca !== "studio";
  function aplicarDesmarcacao(a, comAntecedencia) {
    const s = serv(a.servicoId);
    a.desmarcadoEm = agoraLocal();
    if (regraDesm(s) && comAntecedencia === false) {
      a.status = "falta";
      a.faltaCobrada = true;
      a.direitoRemarcar = false;
      return `Desmarcou com menos de ${fmtN(limiteDesm(), 1)} h de anteced\xEAncia: fica como falta e a aula \xE9 cobrada (${brl(a.valor)}).`;
    }
    a.status = "desmarcado";
    a.faltaCobrada = false;
    a.direitoRemarcar = regraDesm(s);
    return a.direitoRemarcar ? `Desmarcou com anteced\xEAncia: tem direito a remarcar.` : "Atendimento desmarcado. O hor\xE1rio ficou livre.";
  }
  async function perguntarAntecedencia(a) {
    if (!regraDesm(serv(a.servicoId))) return true;
    const r = await escolher(`${nomeAt(a)} desmarcou com ${fmtN(limiteDesm(), 1)} h ou mais de anteced\xEAncia?`, [["nao", "N\xE3o"], ["sim", "Sim"]]);
    return r === "sim" ? true : r === "nao" ? false : null;
  }
  const stBadge = (a) => a.status === "falta" ? `<span class="badge b-bad">Faltou${cobraFalta(a) ? " \xB7 cobrada" : ""}</span>` : a.status === "desmarcado" ? `<span class="badge b-warn">Desmarcou${a.direitoRemarcar ? a.remarcadoPara ? " \xB7 remarcada" : " \xB7 remarcar" : ""}</span>` : { agendado: '<span class="badge b-info">Agendado</span>', realizado: '<span class="badge b-ok">Realizado</span>', cancelado: '<span class="badge">Cancelado</span>' }[a.status] || "";
  function cobrancaBadge(p) {
    var _a, _b;
    if (!p) return "";
    if (p.tipoCobranca === "plano") return `<span class="badge b-mint">${esc(((_a = planoBy(p.planoId)) == null ? void 0 : _a.nome) || "Plano")}</span>`;
    if (p.tipoCobranca === "app") return `<span class="badge b-info">${esc(((_b = appBy(p.appId)) == null ? void 0 : _b.nome) || "App")}</span>`;
    return '<span class="badge">Avulso</span>';
  }
  // Ações que alteram dados: ficam escondidas/bloqueadas quando o módulo aberto é só para visualizar.
  const ACOES_EDICAO = new Set(["add-app", "add-entrada", "add-forma", "add-local", "add-plano", "add-saida", "add-serv", "add-win", "cap-sug", "clinica-todas", "desm", "estrategia", "fat-pagar", "fixa-pagar", "logo-rm", "mens-pagar", "nova-fixa", "nova-renda", "novo", "novo-cartao", "novo-pac", "novo-pacote", "pagar", "rel-pagar", "remarcar", "renda-receber", "repasse-desfazer", "repasse-receber", "rm", "rm-entrada", "rm-forma", "rm-saida", "rm-win", "sim-zerar", "st", "tema", "reset-all"]);
  function aplicarSomenteLeitura(raiz) {
    if (!raiz || podeEditar()) return;
    raiz.querySelectorAll("[data-act]").forEach((el) => {
      if (ACOES_EDICAO.has(el.dataset.act)) el.hidden = true;
    });
    raiz.querySelectorAll("input,select,textarea").forEach((el) => {
      if (el.id === "rel-busca" || el.id === "conta-foto" || /buscar/i.test(el.placeholder || "")) return;
      el.disabled = true;
    });
  }
  function avisoSomenteLeitura() {
    return podeEditar() ? "" : '<p class="note" style="margin:0 0 14px">Voc\xEA tem acesso s\xF3 para visualizar este m\xF3dulo.</p>';
  }
  function render() {
    const c = S.config || defaultConfig();
    if (Auth.user && !viewPermitida(S.view)) S.view = "inicio";
    renderChrome(c);
    const main = $("#main");
    if (S.loadErr) {
      main.innerHTML = `<div class="panel"><h2>N\xE3o foi poss\xEDvel abrir os dados</h2><p class="sub">A conex\xE3o com o banco de dados falhou. Nada foi alterado.</p><p class="small muted">Detalhe: ${esc(S.loadMsg || "")}</p><button class="btn primary" data-act="reload">Tentar de novo</button></div>`;
      return;
    }
    if (!S.loaded) {
      main.innerHTML = loadingHTML();
      return;
    }
    const fn = { inicio: vInicio, agenda: vAgenda, pacientes: vPacientes, financeiro: vFinanceiro, metas: vMetas, relatorios: vRelatorios, config: vConfig, carteira: vCarteira }[S.view] || vInicio;
    main.innerHTML = fn();
    if (!podeEditar()) {
      const ph = main.querySelector(".pagehead");
      if (ph) ph.insertAdjacentHTML("afterend", avisoSomenteLeitura());
    }
    if (S.view === "pacientes") renderPacList();
    if (S.view === "metas") renderSim();
    if (S.view === "relatorios") ligarRelatorios();
    aplicarSomenteLeitura(main);
  }
  function vInicio() {
    const c = S.config, t = today(), mk = mkOf(t), m = M(mk);
    if (!m) return loadingHTML();
    const meta = num(c.metaMensal);
    const hoje = m.atendimentos.filter((a) => a.data === t && a.status !== "cancelado").sort(byHora);
    const nome = (c.perfil.nome || "").split(" ")[0];
    const h = (/* @__PURE__ */ new Date()).getHours(), saud = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    const livres = slotsDoDia(t).filter((s) => s.disp && !s.appts.some((a) => !livreSt(a.status)));
    // Agendados de dias que já passaram (este mês e o anterior): ninguém marcou se aconteceram.
    const mkAnt = addMonth(mk, -1), mAnt = S.months[mkAnt];
    const pendentes = [...(mAnt ? mAnt.atendimentos : []), ...m.atendimentos].filter((a) => a.status === "agendado" && a.data < t).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
    if (!mAnt) M(mkAnt);
    // Meta pelo extrato: o que entrou de fato no mês + o que ainda deve entrar.
    const ex = verValores() ? extrato(mk) : null, pv = ex ? previstoDoMes(mk) : null, prox = ex ? repasseDoMes(mk) : null;
    const pct = (v) => meta ? Math.max(0, Math.min(100, v / meta * 100)) : 0;
    let diasRest = 0;
    for (let d = t; mkOf(d) === mk; d = addDays(d, 1)) if ((c.disponibilidade[parseISO(d).getDay()] || []).length) diasRest++;
    let html = head(`${saud}, ${esc(nome)}`, dataLonga(t), `<button class="btn primary" data-act="novo">+ Agendar</button>`);
    if (perm("config") === "editar" && !c.servicos.length) html += `<div class="banner"><div class="grow"><b>Primeiro passo:</b> cadastre seus servi\xE7os e valores, o aluguel da sala e a % da nota fiscal. Depois cadastre alunos e pacientes.</div><button class="btn small" data-view="config">Abrir configura\xE7\xF5es</button></div>`;
    html += `<div class="cols"><section class="panel"><h2>Hoje</h2><p class="sub">${hoje.length ? hoje.length + " na agenda" : "Nenhum atendimento marcado para hoje."}</p>`;
    html += hoje.length ? hoje.map((a) => {
      var _a;
      const s = serv(a.servicoId);
      return `<div class="todo"><span class="t">${a.hora}</span><span class="dot" style="--c:${esc((s == null ? void 0 : s.cor) || "#15847D")}"></span><div class="info" data-act="edit" data-id="${a.id}"><b>${esc(nomeAt(a))}</b><span class="muted small">${esc((s == null ? void 0 : s.nome) || "Servi\xE7o")} \xB7 ${esc(((_a = localBy(a.localId)) == null ? void 0 : _a.nome) || "")}</span></div>${a.status === "agendado" ? `<button class="btn small ok" data-act="st" data-id="${a.id}" data-st="realizado">Realizado</button><button class="btn small ghost danger" data-act="st" data-id="${a.id}" data-st="falta">Faltou</button><button class="btn small ghost" data-act="desm" data-id="${a.id}">Desmarcou</button>` : stBadge(a)}</div>`;
    }).join("") : `<div class="empty">Toque em \u201C+ Agendar\u201D para marcar algu\xE9m.</div>`;
    const remarcar = [];
    for (const k in S.months) for (const x of S.months[k].atendimentos) if (x.status === "desmarcado" && x.direitoRemarcar && !x.remarcadoPara) remarcar.push(x);
    remarcar.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
    if (remarcar.length) html += `<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line)"><b>Para remarcar (${remarcar.length})</b><p class="small muted" style="margin:2px 0 6px">Desmarcaram com anteced\xEAncia e t\xEAm direito a repor.</p>${remarcar.map((x) => {
      var _a;
      return `<div class="todo"><span class="t small">${dataCurta(x.data)}</span><div class="info" data-act="edit" data-id="${x.id}"><b>${esc(nomeAt(x))}</b><span class="muted small">${esc(((_a = serv(x.servicoId)) == null ? void 0 : _a.nome) || "")} \xE0s ${x.hora}</span></div><button class="btn small" data-act="remarcar" data-id="${x.id}">Remarcar</button></div>`;
    }).join("")}</div>`;
    if (livres.length) html += `<p class="small muted" style="margin:14px 0 0">Hor\xE1rios livres hoje: ${livres.map((s) => `<button class="chip" data-act="novo" data-hora="${s.hora}" data-local="${s.localId}">${s.hora}</button>`).join(" ")}</p>`;
    html += `</section>`;
    if (pendentes.length) html += `<section class="panel" style="margin-top:18px"><h2>Confirmar atendimentos (${pendentes.length})</h2><p class="sub">Dias que j\xE1 passaram e ainda est\xE3o como \u201CAgendado\u201D. Marque o que aconteceu para a meta e os recebimentos ficarem certos.</p>${(S.verPend ? pendentes : pendentes.slice(0, 5)).map((a) => {
      var _a;
      const s = serv(a.servicoId);
      return `<div class="todo"><span class="t small">${dataCurta(a.data)}<br>${a.hora}</span><span class="dot" style="--c:${esc((s == null ? void 0 : s.cor) || "#15847D")}"></span><div class="info" data-act="edit" data-id="${a.id}"><b>${esc(nomeAt(a))}</b><span class="muted small">${esc((s == null ? void 0 : s.nome) || "Servi\xE7o")} \xB7 ${esc(((_a = localBy(a.localId)) == null ? void 0 : _a.nome) || "")}</span></div><button class="btn small ok" data-act="st" data-id="${a.id}" data-st="realizado">Realizado</button><button class="btn small ghost danger" data-act="st" data-id="${a.id}" data-st="falta">Faltou</button><button class="btn small ghost" data-act="desm" data-id="${a.id}">Desmarcou</button></div>`;
    }).join("")}${pendentes.length > 5 ? `<button class="linkbtn small" data-act="ver-pend" style="margin-top:10px">${S.verPend ? "Mostrar s\xF3 os 5 mais antigos" : `Mostrar todos (${pendentes.length})`}</button>` : ""}</section>`;
    html = html.replace('<div class="cols"><section class="panel"><h2>Hoje</h2>', '<div class="cols"><div class="stack"><section class="panel"><h2>Hoje</h2>');
    html += `</div>`;
    if (!verValores()) return html + "</div>";
    if (!ex) return html + `<div class="stack"><section class="panel"><h2>Meta de ${MESES[+mk.slice(5) - 1]}</h2>${loadingHTML()}</section></div></div>`;
    const rec = ex.total, aRec = pv.repasse + pv.devendoTot, aConf = pv.confirmarTot, fut = pv.futuroTot, previsto = rec + aRec + aConf + fut;
    const wR = pct(rec), wA = Math.min(100 - wR, pct(aRec + aConf)), wF = Math.min(100 - wR - wA, pct(fut));
    const faltaRec = Math.max(0, meta - rec), faltaPrev = Math.max(0, meta - previsto);
    const rpAnt = pv.repasseInfo, pr = producaoDoMes(mk);
    const wP = pct(pr.real), wPA = Math.min(100 - wP, pct(pr.agend));
    html += `<div class="stack"><section class="panel"><h2>Meta de ${MESES[+mk.slice(5) - 1]}</h2><p class="sub">Recebido = dinheiro que entrou na conta (extrato). Produzido = o que os atendimentos do m\xEAs rendem, pela data do atendimento.</p>
    <div class="big">${brl(rec)}</div><div class="muted small">recebido em ${MESES[+mk.slice(5) - 1].toLowerCase()}${meta ? ` \xB7 <b>${fmtN(pct(rec), 0)}%</b> da meta de ${brl(meta)}` : ""}</div>
    <div class="bar" style="margin-top:12px"><i class="a" style="width:${wR}%"></i><i class="c" style="width:${wA}%"></i><i class="b" style="width:${wF}%"></i></div>
    <div class="legend" style="flex-wrap:wrap;row-gap:4px"><span>Recebido ${brl(rec)}</span><span class="ls">A receber ${brl(aRec + aConf)}</span><span class="lb">Agendado ${brl(fut)}</span></div>
    <div style="margin-top:10px">${pv.repasse ? `<div class="kv small"><span>Repasse da cl\xEDnica previsto para ${dataCurta(rpAnt.data)}</span><span class="num">${brl(pv.repasse)}</span></div>` : ""}${pv.devendoTot ? `<div class="kv small"><span>Pacientes que ainda n\xE3o pagaram (${pv.devendo.length})</span><span class="num">${brl(pv.devendoTot)}</span></div>` : ""}${aConf ? `<div class="kv small"><span>Atendimentos a confirmar</span><span class="num">${brl(aConf)}</span></div>` : ""}${fut ? `<div class="kv small"><span>Agenda at\xE9 o fim do m\xEAs (pagos pelo paciente)</span><span class="num">${brl(fut)}</span></div>` : ""}</div>
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line)"><div class="row" style="align-items:baseline"><b class="grow">Produzido em ${MESES[+mk.slice(5) - 1].toLowerCase()}</b><button type="button" class="linkbtn mid" style="font-size:20px" data-act="det-mes" data-k="liq" data-mk="${mk}">${brl(pr.real)}</button></div>
    <div class="muted small">pela data do atendimento${meta ? ` \xB7 <b>${fmtN(pct(pr.real), 0)}%</b> da meta` : ""} \xB7 o que ainda n\xE3o entrou cai no extrato at\xE9 ${dataCurta(prox.data)}</div>
    <div class="bar" style="margin-top:8px"><i class="a" style="width:${wP}%"></i><i class="b" style="width:${wPA}%"></i></div>
    <div class="legend"><span>Realizado ${brl(pr.real)}</span><span class="lb">Agendado ${brl(pr.agend)}</span></div></div>
    ${meta ? `<p class="small" style="margin:10px 0 0">Pelo produzido, faltam <b>${brl(Math.max(0, meta - pr.real))}</b>${pr.agend ? ` (contando a agenda: ${meta - pr.real - pr.agend > 0 ? `faltariam ${brl(meta - pr.real - pr.agend)}` : "a meta j\xE1 \xE9 coberta"})` : ""}.</p>` : ""}
    ${meta ? `<p class="small" style="margin:6px 0 0">Pelo recebido: ${faltaRec > 0 ? `faltam <b>${brl(faltaRec)}</b>.` : "<b>meta do m\xEAs atingida!</b>"} ${faltaRec > 0 ? faltaPrev > 0 ? `Com tudo o que est\xE1 previsto (${brl(previsto)}), ainda faltariam <b>${brl(faltaPrev)}</b>${diasRest ? ` \u2014 cerca de ${brl(faltaPrev / diasRest)} por dia de atendimento (${diasRest} dia${diasRest > 1 ? "s" : ""})` : ""}.` : `O que est\xE1 previsto (${brl(previsto)}) j\xE1 cobre a meta.` : ""}</p>` : `<p class="small muted" style="margin:10px 0 0">Defina a meta mensal em Metas.</p>`}
    <button class="linkbtn small" data-view="financeiro" style="margin-top:8px">Ver extrato do m\xEAs</button></section>
    <section class="panel"><h2>Pr\xF3ximo repasse da cl\xEDnica</h2><p class="sub">Atendimentos de ${MESES[+mk.slice(5) - 1].toLowerCase()}, pagos em ${dataLonga(prox.data).toLowerCase()} (5\xBA dia \xFAtil).</p><div class="mid">${brl(prox.calc)}</div>
    <div class="kv small"><span>Valor feito pela cl\xEDnica</span><span class="num">${brl(prox.cheio)}</span></div><div class="kv small"><span>Total de descontos</span><span class="num neg">\u2212 ${brl(prox.nota + prox.combo + prox.sala)}</span></div>
    <p class="small muted" style="margin:4px 0 0">Sala ${brl(prox.sala)}${prox.nota ? " \xB7 nota " + brl(prox.nota) : ""}${prox.combo ? " \xB7 nota + sala 50% " + brl(prox.combo) : ""}</p>
    <p class="small muted" style="margin:8px 0 0">At\xE9 agora, considerando os atendimentos j\xE1 realizados.</p>
    <button class="linkbtn small" data-view="financeiro" style="margin-top:8px">Ver detalhes</button></section></div></div>`;
    return html;
  }
  function slotsDoDia(iso) {
    const c = S.config, wd = parseISO(iso).getDay(), wins = c.disponibilidade[wd] || [], dur = durPadrao(), step = dur + intervalo();
    const m = S.months[mkOf(iso)];
    const doDia = ((m == null ? void 0 : m.atendimentos) || []).filter((x) => x.data === iso);
    const ativos = doDia.filter((x) => !livreSt(x.status));
    const map = /* @__PURE__ */ new Map();
    doDia.forEach((x) => {
      if (!map.has(x.hora)) map.set(x.hora, { hora: x.hora, localId: x.localId, appts: [], disp: false });
      map.get(x.hora).appts.push(x);
    });
    for (const w of wins) {
      const a = hm(w.inicio), b = hm(w.fim);
      for (let t = a; t + dur <= b; t += step) {
        const k = tm(t);
        if (map.has(k)) {
          map.get(k).disp = true;
          continue;
        }
        if (ativos.some((x) => sobrepoe([t, t + step], bloco(x)))) continue;
        map.set(k, { hora: k, localId: w.localId, appts: [], disp: true });
      }
    }
    return [...map.values()].sort((a, b) => hm(a.hora) - hm(b.hora));
  }
  function vAgenda() {
    var _a, _b, _c;
    const d = S.dia, wd = (parseISO(d).getDay() + 6) % 7, ini = addDays(d, -wd), days = [...Array(7)].map((_, i) => addDays(ini, i));
    for (const mk of new Set(days.map(mkOf))) if (!M(mk)) return loadingHTML();
    const t = today(), cap = Math.max(1, num(S.config.turmaCapacidade) || 1);
    let html = head("Agenda", dataLonga(d), `<button class="iconbtn" data-act="semana" data-n="-1" aria-label="Semana anterior">\u2039</button><button class="btn small" data-act="hoje">Hoje</button><button class="iconbtn" data-act="semana" data-n="1" aria-label="Pr\xF3xima semana">\u203A</button><input type="date" value="${d}" id="irpara" aria-label="Ir para data" style="width:auto"><button class="btn primary" data-act="novo">+ Agendar</button>`);
    html += `<div class="week">${days.map((x) => {
      var _a2;
      const n = (((_a2 = S.months[mkOf(x)]) == null ? void 0 : _a2.atendimentos) || []).filter((a) => a.data === x && !livreSt(a.status)).length;
      const dd = parseISO(x);
      const off = !(S.config.disponibilidade[dd.getDay()] || []).length;
      return `<button class="day${x === t ? " today" : ""}${off ? " off" : ""}" data-act="dia" data-d="${x}" ${x === d ? 'aria-current="date"' : ""}><span class="dw">${DIAS_C[dd.getDay()]}</span><span class="dn">${dd.getDate()}</span><span class="dc">${n ? n + " at." : ""}</span></button>`;
    }).join("")}</div>`;
    const slots = slotsDoDia(d);
    const ativos = slots.flatMap((s) => s.appts).filter((a) => !livreSt(a.status));
    const prev = ativos.reduce((s, a) => s + num(a.valor), 0);
    const descNota = (a) => {
      if (a.cobranca === "plano" || !num(a.valor)) return null;
      const x = custoAt(a, null);
      if (x.combo) return { rot: "nota + sala 50%", v: x.combo };
      const p = [];
      if (x.al) p.push({ rot: "sala " + fmtN(x.alPct, 0) + "%", v: x.al });
      if (x.nf) p.push({ rot: "nota " + fmtN(x.pct, 0) + "%", v: x.nf });
      return p.length ? { rot: p.map((y) => y.rot).join(" + "), v: p.reduce((t, y) => t + y.v, 0) } : null;
    };
    const notaDia = ativos.reduce((s, a) => {
      const d = descNota(a);
      return s + (d ? d.v : 0);
    }, 0);
    html += `<section class="panel"><div class="row" style="margin-bottom:10px"><h2 class="grow">${ativos.length} atendimento${ativos.length === 1 ? "" : "s"}</h2><span class="muted small">Bruto ${brl(prev)}${notaDia ? ` \xB7 descontos \u2212 ${brl(notaDia)} \xB7 <b>${brl(prev - notaDia)}</b>` : ""}</span></div>`;
    if (!slots.length) html += `<div class="empty">Sem hor\xE1rio de atendimento neste dia. Voc\xEA pode agendar mesmo assim ou ajustar seus hor\xE1rios em Configura\xE7\xF5es.<br><br><button class="btn primary" data-act="novo">+ Agendar</button></div>`;
    html += '<div class="timeline">';
    for (const sl of slots) {
      const act = sl.appts.filter((a) => !livreSt(a.status)), canc = sl.appts.filter((a) => livreSt(a.status));
      let body = "";
      if (!act.length) body += `<button class="slot-free" data-act="novo" data-hora="${sl.hora}" data-local="${sl.localId}"><span>Livre \xB7 ${esc(((_a = localBy(sl.localId)) == null ? void 0 : _a.nome) || "")}</span><span class="plus">Agendar</span></button>`;
      const grupos = {};
      act.forEach((a) => {
        const s = serv(a.servicoId);
        const k = (s == null ? void 0 : s.grupo) ? "g:" + a.servicoId + "|" + a.localId : "i:" + a.id;
        (grupos[k] = grupos[k] || []).push(a);
      });
      for (const k in grupos) {
        const list = grupos[k], a0 = list[0], s = serv(a0.servicoId), cor = esc((s == null ? void 0 : s.cor) || "#15847D");
        if (k.startsWith("g:")) {
          const occ = list.reduce((t2, a) => t2 + vagasDe(a), 0);
          body += `<div class="turma" style="--c:${cor}"><div class="turma-head"><b>${esc(s.nome)}</b><span class="seats" aria-label="${occ} de ${cap} vagas">${[...Array(Math.max(cap, occ))].map((_, i) => `<i class="${i < occ ? "on" : ""}"></i>`).join("")}</span><span class="small muted">${occ} de ${cap} \xB7 ${esc(((_b = localBy(a0.localId)) == null ? void 0 : _b.nome) || "")}</span></div><div class="chips">${list.map((a) => `<button class="chip" data-act="edit" data-id="${a.id}"><span class="st ${a.status}"></span>${esc(nomeAt(a))}</button>`).join("")}${occ < cap ? `<button class="chip add" data-act="novo" data-hora="${sl.hora}" data-local="${a0.localId}" data-serv="${s.id}">+ aluno</button>` : ""}</div></div>`;
        } else {
          body += `<button class="appt" style="--c:${cor}" data-act="edit" data-id="${a0.id}"><span class="st ${a0.status}"></span><span class="grow"><span class="who">${esc(nomeAt(a0))}</span><br><span class="small muted">${esc((s == null ? void 0 : s.nome) || "Servi\xE7o")} \xB7 ${a0.duracao || (s == null ? void 0 : s.duracao) || 60} min \xB7 ${esc(((_c = localBy(a0.localId)) == null ? void 0 : _c.nome) || "")}</span></span><span class="num small" style="text-align:right">${a0.comprovante ? "\u{1F4CE} " : ""}${a0.nfArquivo ? "\u{1F9FE} " : ""}${a0.cobranca === "plano" ? "Plano" : brl(a0.valor)}${(() => {
            const d = descNota(a0);
            return d ? `<br><span style="color:var(--bad);white-space:nowrap">\u2212 ${brl(d.v)}</span><br><span class="muted" style="white-space:nowrap;font-size:11px">${d.rot}</span><br><b style="white-space:nowrap">= ${brl(num(a0.valor) - d.v)}</b>` : "";
          })()}</span>${stBadge(a0)}</button>`;
        }
      }
      if (canc.length) body += `<div class="canc">${canc.map((a) => `<button class="linkbtn canc" data-act="edit" data-id="${a.id}">${esc(nomeAt(a))} (${a.status === "desmarcado" ? "desmarcou" : "cancelado"})</button>`).join(", ")}</div>`;
      html += `<div class="slot${act.length ? " busy" : ""}"><div class="slot-time">${sl.hora}</div><div class="slot-body">${body}</div></div>`;
    }
    html += "</div></section>";
    return html;
  }
  const ORIGENS = [["particular", "Particular"], ["studio", "Studio"], ["indicacao", "Indica\xE7\xE3o"], ["redes", "Redes sociais"], ["outro", "Outro"]];
  const origemDe = (p) => p.origem && p.origem !== "app" ? p.origem : "";
  function origemLabel(p) {
    var _a, _b;
    const o = origemDe(p);
    if (o === "app") return ((_a = appBy(p.appId)) == null ? void 0 : _a.nome) || "Aplicativo";
    if (o === "studio") return ((_b = S.config.locais.find((l) => l.tipo === "studio")) == null ? void 0 : _b.nome) || "Studio";
    return (ORIGENS.find((x) => x[0] === o) || [, ""])[1];
  }
  function servicoPrincipal(p) {
    if (p.servicoPadrao && serv(p.servicoPadrao)) return serv(p.servicoPadrao);
    const cont = {};
    for (const mk in S.months) for (const a of S.months[mk].atendimentos) if (a.pacienteId === p.id && !livreSt(a.status)) cont[a.servicoId] = (cont[a.servicoId] || 0) + 1;
    const top = Object.entries(cont).sort((a, b) => b[1] - a[1])[0];
    return top ? serv(top[0]) : null;
  }
  function categoriaDe(p) {
    if (p.categoria) return p.categoria;
    if (p.tipoCobranca === "app" || p.tipoCobranca === "plano") return "aluno";
    const s = servicoPrincipal(p);
    if (s && (s.grupo || /pilates|funcional/i.test(s.nome))) return "aluno";
    return "paciente";
  }
  function formaPagtoTxt(p) {
    var _a, _b;
    if (p.tipoCobranca === "plano") return `${((_a = planoBy(p.planoId)) == null ? void 0 : _a.nome) || "Plano mensal"} \xB7 ${brl(valorMens(p))}/m\xEAs`;
    if (p.tipoCobranca === "app") return `Usa ${((_b = appBy(p.appId)) == null ? void 0 : _b.nome) || "aplicativo"}`;
    return num(p.valorPersonalizado) ? `Por sess\xE3o \xB7 ${brl(p.valorPersonalizado)}` : "Por sess\xE3o";
  }
  function vPacientes() {
    const f = S.filtroPac === "ativos" ? "todos" : S.filtroPac;
    S.filtroPac = f;
    const ativos = S.pacientes.filter((p) => p.ativo !== false), nA = ativos.filter((p) => categoriaDe(p) === "aluno").length;
    const segs = [["todos", "Todos"], ["aluno", "Alunos"], ["paciente", "Pacientes"], ["inativos", "Inativos"]];
    const orig = [["*", "Todas as origens"], ...ORIGENS, ["", "Origem n\xE3o informada"]];
    return head("Cadastro", `${nA} aluno${nA === 1 ? "" : "s"} \xB7 ${ativos.length - nA} paciente${ativos.length - nA === 1 ? "" : "s"} ativos`, `<button class="btn primary" data-act="novo-pac">+ Novo cadastro</button>`) + `<div class="row" style="margin-bottom:16px"><input id="busca" type="search" placeholder="Buscar por nome, telefone ou CPF" value="${esc(S.buscaPac)}" style="max-width:300px"><div class="seg">${segs.map(([k, l]) => `<button data-act="filtro" data-f="${k}" aria-pressed="${f === k}">${l}</button>`).join("")}</div><select id="forig" style="width:auto" aria-label="Filtrar por origem">${orig.map(([k, l]) => `<option value="${k}" ${S.filtroOrig === k ? "selected" : ""}>${l}</option>`).join("")}</select></div><div id="paclist"></div>`;
  }
  function waLink(tel) {
    let d = String(tel || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.length <= 11) d = "55" + d;
    return "https://wa.me/" + d;
  }
  function pacCard(p, m) {
    const n = ((m == null ? void 0 : m.atendimentos) || []).filter((a) => a.pacienteId === p.id && stEf(a) === "realizado").length;
    const ini = (p.nome || "?").trim().split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
    const wa = waLink(p.telefone), cat = categoriaDe(p), sv = servicoPrincipal(p), ol = origemLabel(p);
    return `<div class="pcard${p.ativo === false ? " inativo" : ""}" data-act="edit-pac" data-id="${p.id}" tabindex="0">
    <div class="row"><span class="avatar">${esc(ini)}</span><div class="grow" style="min-width:0"><div class="nm">${esc(p.nome)}</div><div class="small muted">${esc(p.telefone || "Sem telefone")}</div></div></div>
    <div class="row" style="gap:6px">${cat === "aluno" ? '<span class="badge b-mint">Aluno</span>' : '<span class="badge b-info">Paciente</span>'}${sv ? `<span class="badge"><span class="dot" style="--c:${esc(sv.cor || "#15847D")};width:8px;height:8px;margin-right:5px"></span>${esc(sv.nome)}</span>` : ""}${ol ? `<span class="badge b-warn">${esc(ol)}</span>` : '<span class="badge" style="opacity:.7">Origem n\xE3o informada</span>'}</div>
    <div class="row"><span class="small muted grow">${n} atendimento${n === 1 ? "" : "s"} realizado${n === 1 ? "" : "s"} no m\xEAs</span>${wa ? `<a class="btn small" href="${wa}" target="_blank" rel="noopener" data-stop>WhatsApp</a>` : ""}</div></div>`;
  }
  function renderPacList() {
    const el = $("#paclist");
    if (!el) return;
    const q = S.buscaPac.trim().toLowerCase(), f = S.filtroPac, fo = S.filtroOrig, m = S.months[mkOf(today())];
    const list = S.pacientes.filter((p) => {
      if (f === "inativos" ? p.ativo !== false : p.ativo === false) return false;
      if ((f === "aluno" || f === "paciente") && categoriaDe(p) !== f) return false;
      if (fo !== "*" && origemDe(p) !== fo) return false;
      if (q && !(p.nome || "").toLowerCase().includes(q) && !(String(p.telefone || "") + " " + String(p.cpf || "")).replace(/\D/g, "").includes(q.replace(/\D/g, "") || "\xA7")) return false;
      return true;
    }).sort((a, b) => a.nome.localeCompare(b.nome));
    if (!list.length) {
      el.innerHTML = `<div class="empty">${S.pacientes.length ? "Ningu\xE9m encontrado com esse filtro." : "Cadastre seu primeiro aluno ou paciente para come\xE7ar a agendar."}</div>`;
      return;
    }
    const grupos = [["aluno", "Alunos", "Pilates, funcional e aulas em grupo"], ["paciente", "Pacientes", "Atendimentos de fisioterapia"]];
    el.innerHTML = grupos.map(([k, t, sub]) => {
      const g = list.filter((p) => categoriaDe(p) === k);
      if (!g.length) return "";
      return `<section style="margin-bottom:22px"><div class="row" style="margin-bottom:10px;align-items:baseline"><h2 style="margin:0;font-size:18px">${t} <span class="muted" style="font-weight:600">${g.length}</span></h2><span class="small muted">${sub}</span></div><div class="plist">${g.map((p) => pacCard(p, m)).join("")}</div></section>`;
    }).join("");
  }
  // ===== Resumo do mês: faturado, descontos e líquido (pela data do atendimento) =====
  function resumoMes(mk) {
    const m = S.months[mk];
    if (!m) return null;
    const fat = { clinica: [], paciente: [], pacote: [], mens: [] }, desc = { sala: [], nota: [], combo: [] }, liq = [];
    for (const a of m.atendimentos) {
      if (!contaRealizado(a)) continue;
      const o = origemAt(a), s = serv(a.servicoId);
      if (o === "clinica") {
        const v = num(a.valor), vc = valorClinicaAt(a), d = Math.max(0, v - vc);
        fat.clinica.push({ a, v });
        if (d) (salaPctAt(a) && !ehServClinica(s) && a.cobranca === "avulso" ? desc.combo : desc.nota).push({ a, v, d, pct: salaPctAt(a) && !ehServClinica(s) && a.cobranca === "avulso" ? 50 : notaPctAt(a) });
      } else if (o === "paciente") {
        const v = num(a.valor), d = salaDebitoAt(a);
        fat.paciente.push({ a, v });
        if (d) desc.sala.push({ a, v, d, pct: salaPctAt(a) });
      } else if (o === "pacote") {
        const v = valorSessaoPac(pacoteBy(a.pacoteId)), d = salaDebitoAt(a);
        fat.pacote.push({ a, v });
        if (d) desc.sala.push({ a, v, d, pct: salaPctAt(a), pacote: true });
      }
    }
    for (const it of mensalidadesDoMes(mk)) fat.mens.push({ it, v: it.valor });
    const soma = (l, k = "v") => l.reduce((t, x) => t + x[k], 0);
    const faturado = soma(fat.clinica) + soma(fat.paciente) + soma(fat.pacote) + soma(fat.mens);
    const tSala = soma(desc.sala, "d"), tNota = soma(desc.nota, "d"), tCombo = soma(desc.combo, "d"), descontos = tSala + tNota + tCombo;
    return { mk, fat, desc, faturado, tSala, tNota, tCombo, descontos, liquido: faturado - descontos };
  }
  function resumoMesHTML(mk) {
    const r = resumoMes(mk);
    if (!r) return "";
    const tile = (k, rot, v, cls, sub) => `<button type="button" class="panel" data-act="det-mes" data-k="${k}" data-mk="${mk}" style="text-align:left;cursor:pointer;margin:0"><div class="small muted">${rot}</div><div class="big ${cls}" style="margin-top:4px">${brl(v)}</div><div class="small muted" style="margin-top:6px">${sub}</div><div class="small" style="margin-top:8px;color:var(--teal)">Ver detalhes \u203A</div></button>`;
    const partes = [r.tSala ? `sala ${brl(r.tSala)}` : "", r.tNota ? `nota ${brl(r.tNota)}` : "", r.tCombo ? `nota + sala 50% ${brl(r.tCombo)}` : ""].filter(Boolean).join(" \xB7 ");
    return `<h2 style="margin:0 0 10px">Resumo de ${MESES[+mk.slice(5) - 1].toLowerCase()}</h2><div class="cols-even" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
      ${tile("fat", "Faturado", r.faturado, "", "Valor cheio dos atendimentos realizados")}
      ${tile("desc", "Descontos", r.descontos, "neg", partes || "Sem descontos")}
      ${tile("liq", "L\xEDquido para voc\xEA", r.liquido, "", "Faturado \u2212 descontos")}
    </div>`;
  }
  function modalDetMes(k, mk) {
    const r = resumoMes(mk);
    if (!r) return;
    const nomeM = MESES[+mk.slice(5) - 1].toLowerCase();
    const sn = (a) => {
      var _a;
      return ((_a = serv(a.servicoId)) == null ? void 0 : _a.nome) || "Servi\xE7o";
    };
    const linhaAt = (x, cols) => `<tr><td class="num">${dataCurta(x.a.data)}</td><td><button class="linkbtn" data-act="edit" data-id="${x.a.id}">${esc(nomeAt(x.a))}</button><br><span class="small muted">${esc(sn(x.a))}</span></td>${cols}</tr>`;
    const grupo = (titulo, total, linhas, neg) => linhas ? `<div class="row" style="margin:16px 0 4px"><b class="grow">${titulo}</b><b class="num ${neg ? "neg" : ""}">${neg ? "\u2212 " : ""}${brl(total)}</b></div><div class="scroll"><table class="tbl"><tbody>${linhas}</tbody></table></div>` : "";
    let h = "";
    if (k === "fat") {
      const porServ = (l) => {
        const g = {};
        for (const x of l) {
          const n = sn(x.a), e = g[n] || (g[n] = { q: 0, v: 0 });
          e.q++;
          e.v += x.v;
        }
        return Object.entries(g).sort((a, b) => b[1].v - a[1].v).map(([n, e]) => `<tr><td>${esc(n)}</td><td class="n">${e.q}\xD7</td><td class="n">${brl(e.v)}</td></tr>`).join("");
      };
      const sv = (l) => l.reduce((t, x) => t + x.v, 0);
      h = `<h2>Faturado em ${nomeM}: ${brl(r.faturado)}</h2><p class="sub" style="margin-top:0">Valor cheio de todos os atendimentos realizados no m\xEAs, antes dos descontos.</p>
      ${grupo("Pagos pela cl\xEDnica (Pilates, Personal, aplicativos e atendimentos com nota)", sv(r.fat.clinica), porServ(r.fat.clinica))}
      ${grupo("Pagos direto pelo paciente", sv(r.fat.paciente), porServ(r.fat.paciente))}
      ${grupo("Sess\xF5es de pacote (valor da sess\xE3o)", sv(r.fat.pacote), porServ(r.fat.pacote))}
      ${r.fat.mens.length ? grupo("Mensalidades", sv(r.fat.mens), r.fat.mens.map((x) => `<tr><td>${esc(x.it.pac.nome)}</td><td class="n">${brl(x.v)}</td></tr>`).join("")) : ""}`;
    } else if (k === "desc") {
      const cols = (x, rot) => `<td class="n small muted">${rot}</td><td class="n">${brl(x.v)}</td><td class="n neg">\u2212 ${brl(x.d)}</td>`;
      h = `<h2>Descontos de ${nomeM}: ${brl(r.descontos)}</h2><p class="sub" style="margin-top:0">Tudo o que sai do valor faturado, por tipo de desconto.</p>
      <div class="kv"><span>Desconto de sala (atendimentos pagos direto pelo paciente)</span><span class="num neg">${brl(r.tSala)}</span></div>
      <div class="kv"><span>Desconto de nota</span><span class="num neg">${brl(r.tNota)}</span></div>
      <div class="kv"><span>Desconto nota + sala (50%)</span><span class="num neg">${brl(r.tCombo)}</span></div>
      <div class="kv total"><span>Total de descontos</span><span>${brl(r.descontos)}</span></div>
      ${grupo("Desconto de sala", r.tSala, r.desc.sala.map((x) => linhaAt(x, cols(x, "sala " + fmtN(x.pct, 0) + "%" + (x.pacote ? " (pacote)" : "")))).join(""), true)}
      ${grupo("Desconto de nota", r.tNota, r.desc.nota.map((x) => linhaAt(x, cols(x, "nota " + fmtN(x.pct, 0) + "%"))).join(""), true)}
      ${grupo("Desconto nota + sala (50%)", r.tCombo, r.desc.combo.map((x) => linhaAt(x, cols(x, "nota + sala 50%"))).join(""), true)}`;
    } else {
      const ex = extrato(mk), rp = repasseDoMes(mk), dev = pacientesDevendo(mk).filter((a) => mkOf(a.data) === mk);
      const recPac = r.fat.paciente.filter((x) => x.a.pago);
      const tRec = recPac.reduce((t, x) => t + x.v, 0), tDev = dev.reduce((t, a) => t + num(a.valor), 0), tPk = r.fat.pacote.reduce((t, x) => t + x.v, 0) + r.fat.mens.reduce((t, x) => t + x.v, 0);
      h = `<h2>L\xEDquido de ${nomeM}: ${brl(r.liquido)}</h2><p class="sub" style="margin-top:0">Faturado ${brl(r.faturado)} \u2212 descontos ${brl(r.descontos)}. \xC9 assim que esse valor chega at\xE9 voc\xEA:</p>
      <div class="kv"><span>Pacientes que j\xE1 pagaram</span><span class="num">${brl(tRec)}</span></div>
      ${tDev ? `<div class="kv"><span>Pacientes que ainda n\xE3o pagaram</span><span class="num">${brl(tDev)}</span></div>` : ""}
      ${tPk ? `<div class="kv"><span>Sess\xF5es de pacote e mensalidades (j\xE1 pagas)</span><span class="num">${brl(tPk)}</span></div>` : ""}
      <div class="kv"><span>Repasse da cl\xEDnica ${rp && rp.recebido ? "recebido em " + dataCurta(rp.recebidoEm || rp.data) : "previsto para " + dataCurta(rp ? rp.data : quintoDiaUtil(addMonth(mk, 1)))}</span><span class="num">${brl(rp ? rp.calc : 0)}</span></div>
      <div class="kv total"><span>L\xEDquido</span><span>${brl(r.liquido)}</span></div>
      ${rp ? `<p class="small muted" style="margin:10px 0 0">O repasse j\xE1 vem sem todos os descontos do m\xEAs (sala, nota e nota + sala): valor da cl\xEDnica ${brl(rp.cheio)} \u2212 descontos ${brl(rp.cheio - rp.calc)} = ${brl(rp.calc)}.</p>` : ""}
      ${grupo("Pacientes que ainda n\xE3o pagaram", tDev, dev.map((a) => linhaAt({ a }, `<td class="n">${brl(a.valor)}</td><td class="n"><button class="btn small" data-act="pagar" data-id="${a.id}">Recebido</button></td>`)).join(""))}`;
    }
    openModal(h + `<div class="modal-actions"><span class="grow"></span><button class="btn primary" data-close type="button">Fechar</button></div>`);
  }
  function vFinanceiro() {
    const mk = S.mesFin, m = M(mk);
    if (!m) return loadingHTML();
    const ex = extrato(mk);
    if (!ex) return loadingHTML();
    const pv = previstoDoMes(mk), rpAnt = pv.repasseInfo, rp = repasseDoMes(mk), mens = mensalidadesDoMes(mk);
    const nomeM = MESES[+mk.slice(5) - 1].toLowerCase(), nomeAnt = MESES[+addMonth(mk, -1).slice(5) - 1].toLowerCase();
    const servNome = (a) => {
      var _a;
      return ((_a = serv(a.servicoId)) == null ? void 0 : _a.nome) || "Servi\xE7o";
    };
    let html = head("Recebimentos", mesLabel(mk), `<button class="iconbtn" data-act="mes-fin" data-n="-1" aria-label="M\xEAs anterior">‹</button><button class="iconbtn" data-act="mes-fin" data-n="1" aria-label="Pr\xF3ximo m\xEAs">›</button>${Store.dl ? '<button class="btn" data-act="csv">Exportar planilha</button>' : ""}`);
    const aRec = pv.repasse + pv.devendoTot + pv.confirmarTot;
    html += resumoMesHTML(mk);
    html += `<h2 style="margin:22px 0 10px">Extrato de ${nomeM}</h2><div class="cols-even" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))"><section class="panel"><h2>Recebido em ${nomeM}</h2><p class="sub">Tudo o que entrou na conta neste m\xEAs.</p><div class="big">${brl(ex.total)}</div><p class="small muted" style="margin:4px 0 0">${ex.ent.length} entrada${ex.ent.length === 1 ? "" : "s"} no extrato</p></section>

    <section class="panel"><h2>Ainda deve entrar em ${nomeM}</h2><p class="sub">Previsto, mas ainda n\xE3o recebido.</p><div class="big">${brl(aRec + pv.futuroTot)}</div>
    ${pv.repasse ? `<div class="kv small"><span>Repasse da cl\xEDnica (${dataCurta(rpAnt.data)})</span><span class="num">${brl(pv.repasse)}</span></div>` : ""}
    ${pv.devendoTot ? `<div class="kv small"><span>Pacientes que ainda n\xE3o pagaram</span><span class="num">${brl(pv.devendoTot)}</span></div>` : ""}
    ${pv.confirmarTot ? `<div class="kv small"><span>Atendimentos a confirmar (j\xE1 passaram)</span><span class="num">${brl(pv.confirmarTot)}</span></div>` : ""}
    ${pv.futuroTot ? `<div class="kv small"><span>Agenda at\xE9 o fim do m\xEAs (paga pelo paciente)</span><span class="num">${brl(pv.futuroTot)}</span></div>` : ""}</section></div>`;
    // Extrato
    const ic = { paciente: "Paciente", pacote: "Pacote", repasse: "Cl\xEDnica", mensalidade: "Mensalidade" };
    html += `<section class="panel" style="margin-top:18px"><div class="row"><h2 class="grow">Extrato de ${nomeM}</h2><b class="num">${brl(ex.total)}</b></div><p class="sub">Entradas na data em que o dinheiro entrou. Atendimentos pagos pelo paciente usam a data do pagamento (ou do atendimento, se n\xE3o informada).</p>`;
    html += ex.ent.length ? `<div class="scroll"><table class="tbl"><tbody>${ex.ent.map((e) => `<tr><td class="num">${dataCurta(e.data)}</td><td><span class="badge ${e.tipo === "repasse" ? "b-mint" : e.tipo === "pacote" ? "b-info" : ""}">${ic[e.tipo]}</span> ${e.id ? `<button class="linkbtn" data-act="edit" data-id="${e.id}">${esc(e.desc)}</button>` : e.pacId ? `<button class="linkbtn" data-act="edit-pacote" data-id="${e.pacId}">${esc(e.desc)}</button>` : `<b>${esc(e.desc)}</b>`}<br><span class="small muted">${esc(e.det)}</span></td><td class="n ${e.valor < 0 ? "neg" : ""}"><b>${brl(e.valor)}</b></td><td class="n">${e.comp ? `<button class="btn small" data-comp-ver="${e.comp.id}">\u{1F4CE}</button>` : e.tipo === "repasse" ? `<button class="btn small ghost" data-act="repasse-desfazer" data-mk="${e.mk}">Desfazer</button>` : ""}</td></tr>`).join("")}</tbody></table></div>` : '<div class="empty">Nenhuma entrada neste m\xEAs.</div>';
    html += `</section>`;
    // Repasse que cai neste mês (atendimentos do mês anterior)
    if (rpAnt && (rpAnt.temAlgo || rpAnt.recebido)) {
      html += `<section class="panel" style="margin-top:18px"><div class="row"><h2 class="grow">Repasse da cl\xEDnica \xB7 atendimentos de ${nomeAnt}</h2>${rpAnt.recebido ? `<span class="badge b-ok">Recebido em ${dataCurta(rpAnt.recebidoEm || rpAnt.data)}</span>` : `<span class="badge b-warn">Previsto para ${dataCurta(rpAnt.data)}</span>`}</div>
      ${resumoRepasseHTML(rpAnt, "Calculado")}
      ${rpAnt.recebido && Math.abs(rpAnt.valor - rpAnt.calc) > 5e-3 ? `<div class="kv"><span>Valor que entrou</span><b class="num">${brl(rpAnt.valor)}</b></div><p class="note warn">Diferen\xE7a de ${brl(rpAnt.valor - rpAnt.calc)} em rela\xE7\xE3o ao calculado.</p>` : ""}
      <div class="row" style="margin-top:10px">${rpAnt.recebido ? `<button class="btn small ghost" data-act="repasse-desfazer" data-mk="${rpAnt.mk}">Desfazer recebimento</button>` : `<button class="btn small primary" data-act="repasse-receber" data-mk="${rpAnt.mk}">Marcar repasse como recebido</button>`}<button class="linkbtn small" data-act="mes-fin" data-n="-1">Ver detalhes em ${nomeAnt}</button></div></section>`;
    }
    // Repasse em formação (atendimentos deste mês)
    if (rp.temAlgo || rp.recebido) {
      const grupos = {};
      const notas = [];
      for (const x of rp.itens) {
        const s = serv(x.a.servicoId);
        if (ehServClinica(s) || x.a.cobranca === "app" || x.a.cobranca === "studio") {
          const k = servNome(x.a) + (x.a.cobranca === "app" ? " \xB7 " + (((appBy(x.a.appId)) || {}).nome || "aplicativo") : x.a.cobranca === "studio" ? " \xB7 pela cl\xEDnica" : " \xB7 avulso");
          const gq = grupos[k] || (grupos[k] = { q: 0, v: 0 });
          gq.q++;
          gq.v += x.v;
        } else notas.push(x);
      }
      html += `<section class="panel" style="margin-top:18px"><div class="row"><h2 class="grow">Repasse da cl\xEDnica \xB7 atendimentos de ${nomeM}</h2><b class="num">${brl(rp.calc)}</b></div><p class="sub">${rp.recebido ? `Recebido em ${dataCurta(rp.recebidoEm || rp.data)}.` : `Ser\xE1 pago em ${dataLonga(rp.data).toLowerCase()} (5\xBA dia \xFAtil). Atualiza conforme os atendimentos s\xE3o marcados como realizados.`}</p>`;
      html += `<h3 class="small" style="margin:14px 0 4px">Pilates, Personal e aplicativos (valor cheio)</h3>${Object.keys(grupos).length ? `<div class="scroll"><table class="tbl"><tbody>${Object.entries(grupos).sort((a, b) => b[1].v - a[1].v).map(([k, g]) => `<tr><td>${esc(k)}</td><td class="n">${g.q}\xD7</td><td class="n">${brl(g.v)}</td></tr>`).join("")}</tbody></table></div>` : '<p class="small muted" style="margin:0">Nenhum.</p>'}`;
      html += `<h3 class="small" style="margin:14px 0 4px">Atendimentos com nota</h3>${notas.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>Data</th><th>Paciente</th><th class="n">Valor</th><th class="n">Desconto</th><th class="n">Repasse</th></tr></thead><tbody>${notas.map((x) => `<tr><td class="num">${dataCurta(x.a.data)}</td><td><button class="linkbtn" data-act="edit" data-id="${x.a.id}">${esc(nomeAt(x.a))}</button><br><span class="small muted">${esc(servNome(x.a))} \xB7 ${x.combo ? "nota + sala: 50%" : "nota " + fmtN(notaPctAt(x.a), 2) + "%"}</span></td><td class="n">${brl(x.cheio)}</td><td class="n neg">\u2212 ${brl(x.combo || x.nota)}</td><td class="n"><b>${brl(x.v)}</b></td></tr>`).join("")}</tbody></table></div>` : '<p class="small muted" style="margin:0">Nenhum.</p>'}`;
      html += `<h3 class="small" style="margin:14px 0 4px">Desconto de sala dos atendimentos pagos direto pelo paciente</h3>${rp.salas.length ? `<div class="scroll"><table class="tbl"><tbody>${rp.salas.map((x) => {
        const pk = x.a.pacoteId && pacoteBy(x.a.pacoteId), base = pk ? valorSessaoPac(pk) : num(x.a.valor);
        return `<tr><td class="num">${dataCurta(x.a.data)}</td><td><button class="linkbtn" data-act="edit" data-id="${x.a.id}">${esc(nomeAt(x.a))}</button><br><span class="small muted">${esc(servNome(x.a))}${pk ? " \xB7 sess\xE3o de pacote" : ""}</span></td><td class="n small muted">${fmtN(salaPctAt(x.a), 2)}% de ${brl(base)}</td><td class="n neg">− ${brl(x.v)}</td></tr>`;
      }).join("")}</tbody></table></div>` : '<p class="small muted" style="margin:0">Nenhuma.</p>'}`;
      html += `<div style="margin-top:12px">${resumoRepasseHTML(rp, "Repasse previsto")}</div></section>`;
    }
    // Pacientes devendo
    const dev = pacientesDevendo(mk);
    html += `<div class="cols-even" style="margin-top:18px"><section class="panel"><div class="row"><h2 class="grow">Pacientes que ainda n\xE3o pagaram</h2>${dev.length ? `<b class="num">${brl(dev.reduce((t, a) => t + num(a.valor), 0))}</b>` : ""}</div><p class="sub">Atendimentos realizados, pagos direto pelo paciente e ainda sem pagamento. Ao marcar como recebido, entra no extrato de hoje.</p>`;
    html += dev.length ? `<div class="scroll"><table class="tbl"><tbody>${dev.map((a) => `<tr><td class="num">${dataCurta(a.data)}</td><td><button class="linkbtn" data-act="edit" data-id="${a.id}">${esc(nomeAt(a))}</button><br><span class="small muted">${esc(servNome(a))}</span></td><td class="n">${brl(a.valor)}</td><td class="n"><button class="btn small" data-act="pagar" data-id="${a.id}">Recebido</button></td></tr>`).join("")}</tbody></table></div>` : '<div class="empty">Ningu\xE9m devendo.</div>';
    html += `</section>`;
    // Pacotes vendidos no mês
    const pks = (S.pacotes || []).filter((p) => p.pagoEm && mkOf(p.pagoEm) === mk || !p.pagoEm && p.inicio && mkOf(p.inicio) === mk);
    html += `<section class="panel"><h2>Pacotes de ${nomeM}</h2><p class="sub">Entram inteiros no extrato no dia do pagamento. Cadastre pelo Cadastro do paciente.</p>${pks.length ? `<div class="scroll"><table class="tbl"><tbody>${pks.map((p) => {
      const u = usoPacote(p);
      return `<tr><td><button class="linkbtn" data-act="edit-pacote" data-id="${p.id}">${esc((pacBy(p.pacienteId) || {}).nome || "Paciente")}</button><br><span class="small muted">${u.usadas}/${u.total} sess\xF5es${p.pagoEm ? " \xB7 pago em " + dataCurta(p.pagoEm) : " \xB7 <b>n\xE3o pago</b>"}</span></td><td class="n">${brl(valorFinalPac(p))}</td></tr>`;
    }).join("")}</tbody></table></div>` : '<div class="empty">Nenhum pacote neste m\xEAs.</div>'}</section></div>`;
    if (mens.length) {
      html += `<section class="panel" style="margin-top:18px"><h2>Mensalidades</h2><p class="sub">Alunos com plano ativo. Ajuste o valor se houve desconto neste m\xEAs.</p><div class="scroll"><table class="tbl"><thead><tr><th>Aluno</th><th>Valor</th><th></th></tr></thead><tbody>${mens.map((it) => {
        var _a2;
        return `<tr><td><b>${esc(it.pac.nome)}</b><br><span class="small muted">${esc(((_a2 = it.plano) == null ? void 0 : _a2.nome) || "Plano")}</span></td><td style="width:120px"><input type="number" step="0.01" inputmode="decimal" value="${it.valor}" data-mensval="${it.pac.id}" aria-label="Valor da mensalidade de ${esc(it.pac.nome)}"></td><td class="n"><button class="btn small ${it.pago ? "ok" : ""}" data-act="mens-pagar" data-pid="${it.pac.id}">${it.pago ? "✓ Paga" : "Marcar paga"}</button></td></tr>`;
      }).join("")}</tbody></table></div></section>`;
    }
    // Por serviço (competência)
    const r = calcMes(mk, ["realizado"]), ps = Object.entries(r.porServ).sort((a, b) => b[1].liq - a[1].liq);
    html += `<section class="panel" style="margin-top:18px"><h2>Atendimentos realizados em ${nomeM}, por servi\xE7o</h2><p class="sub">Pela data do atendimento, n\xE3o do pagamento. L\xEDquido = valor \u2212 desconto de sala \u2212 desconto de nota. Com nota + sala, desconto \xFAnico de 50%.</p>${ps.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>Servi\xE7o</th><th class="n">Qtd.</th><th class="n">Bruto</th><th class="n">Sala</th><th class="n">Nota</th><th class="n">Nota + sala (50%)</th><th class="n">L\xEDquido</th></tr></thead><tbody>${ps.map(([id, x]) => {
      const s = serv(id);
      return `<tr><td><span class="dot" style="--c:${esc((s == null ? void 0 : s.cor) || "#999")}"></span>${esc((s == null ? void 0 : s.nome) || "Servi\xE7o removido")}</td><td class="n">${x.qtd}</td><td class="n">${brl(x.bruto)}</td><td class="n neg">${x.al ? "\u2212 " + brl(x.al) : "\u2014"}</td><td class="n neg">${x.nf ? "\u2212 " + brl(x.nf) : "\u2014"}</td><td class="n neg">${x.combo ? "\u2212 " + brl(x.combo) : "\u2014"}</td><td class="n"><b>${brl(x.liq)}</b></td></tr>`;
    }).join("")}<tr><td><b>Total</b></td><td class="n">${ps.reduce((t, [, x]) => t + x.qtd, 0)}</td><td class="n"><b>${brl(ps.reduce((t, [, x]) => t + x.bruto, 0))}</b></td><td class="n neg"><b>\u2212 ${brl(ps.reduce((t, [, x]) => t + x.al, 0))}</b></td><td class="n neg"><b>\u2212 ${brl(ps.reduce((t, [, x]) => t + x.nf, 0))}</b></td><td class="n neg"><b>\u2212 ${brl(ps.reduce((t, [, x]) => t + (x.combo || 0), 0))}</b></td><td class="n"><b>${brl(ps.reduce((t, [, x]) => t + x.liq, 0))}</b></td></tr></tbody></table></div>` : '<div class="empty">Nenhum atendimento realizado neste m\xEAs.</div>'}</section>`;
    return html;
  }
  async function exportCSV() {
    var _a, _b;
    const mk = S.mesFin, m = S.months[mk];
    if (!m || !Store.dl) return;
    const q = (v) => '"' + String(v != null ? v : "").replace(/"/g, '""') + '"';
    const f = (n) => (+n || 0).toFixed(2).replace(".", ",");
    const seen = /* @__PURE__ */ new Set();
    const rows = [["Data", "Hora", "Paciente", "Servi\xE7o", "Local", "Situa\xE7\xE3o", "Cobran\xE7a", "Valor", "Sala %", "Desconto de sala", "Nota %", "Desconto de nota", "Desconto nota + sala (50%)", "Deslocamento", "L\xEDquido", "Pago", "Quem paga", "Data do pagamento", "Valor no extrato", "Sala no repasse"].map(q).join(";")];
    const quem = { clinica: "Cl\xEDnica (repasse)", paciente: "Paciente", pacote: "Pacote", plano: "Mensalidade" };
    for (const a2 of [...m.atendimentos].sort((a3, b) => (a3.data + a3.hora).localeCompare(b.data + b.hora))) {
      const s = serv(a2.servicoId), x = custoAt(a2, stEf(a2) === "realizado" ? seen : null), v = x.v;
      rows.push([dataCurta(a2.data), a2.hora, nomeAt(a2), s == null ? void 0 : s.nome, (_a = localBy(a2.localId)) == null ? void 0 : _a.nome, a2.status, a2.cobranca, f(v), x.combo ? "" : fmtN(x.alPct, 2), f(x.combo ? 0 : x.al), x.combo ? "" : fmtN(x.pct, 2), f(x.combo ? 0 : x.nf), f(x.combo), f(x.desl), f(x.liq), a2.pago ? "sim" : "n\xE3o", quem[origemAt(a2)], origemAt(a2) === "clinica" ? dataCurta(quintoDiaUtil(addMonth(mk, 1))) : origemAt(a2) === "paciente" && a2.pago ? dataCurta(a2.pagoEm || a2.data) : "", f(origemAt(a2) === "clinica" ? valorClinicaAt(a2) : origemAt(a2) === "paciente" ? v : 0), f(salaDebitoAt(a2))].map(q).join(";"));
    }
    for (const it of mensalidadesDoMes(mk)) {
      const x = taxaMens(it.plano, it.valor);
      rows.push(["", "", it.pac.nome, "Mensalidade " + (((_b = it.plano) == null ? void 0 : _b.nome) || ""), "", "", "plano", f(it.valor), "0", f(x.al), "0", f(x.nf), "0,00", "0,00", f(x.liq), it.pago ? "sim" : "n\xE3o"].map(q).join(";"));
    }
    const blob = new Blob(["\uFEFF" + rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "financeiro-" + mk + ".csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1e3);
  }
  // ===== Relatórios: frequência por aluno/paciente no mês =====
  const ST_ROT = { realizado: "Realizado", falta: "Faltou", desmarcado: "Desmarcou", cancelado: "Cancelado", agendado: "Agendado" };
  function freqDoMes(mk) {
    const m = S.months[mk];
    if (!m) return null;
    const por = {};
    for (const a of m.atendimentos) {
      if (!a.pacienteId) continue;
      const r = por[a.pacienteId] || (por[a.pacienteId] = { id: a.pacienteId, realizado: 0, falta: 0, desmarcado: 0, cancelado: 0, agendado: 0, bruto: 0, liq: 0, lista: [] });
      const st = a.status in r ? a.status : "agendado";
      r[st]++;
      r.lista.push(a);
      if (contaRealizado(a)) {
        r.bruto += num(a.valor);
        r.liq += rendeAt(a);
      }
    }
    return por;
  }
  // ===== Relatórios financeiros (abas) =====
  const ABAS_REL = [["freq", "Frequ\xEAncia"], ["evol", "Evolu\xE7\xE3o"], ["serv", "Servi\xE7os e locais"], ["receber", "A receber"], ["desc", "Descontos e repasses"]];
  function abasRelHTML() {
    const aba = verValores() ? S.relAba || "freq" : "freq";
    if (!verValores()) return "";
    return `<div class="seg" role="tablist" style="margin-bottom:16px;flex-wrap:wrap">${ABAS_REL.map(([k, l]) => `<button type="button" role="tab" data-act="rel-aba" data-aba="${k}" aria-pressed="${aba === k}">${l}</button>`).join("")}</div>`;
  }
  const mesesAte = (mk, n) => [...Array(n)].map((_, i) => addMonth(mk, i - n + 1));
  const rotMes = (k) => MESES[+k.slice(5) - 1].slice(0, 3) + "/" + k.slice(2, 4);
  const tabela = (id, cab, total, linhas, vazio = "Sem dados.") => linhas.length ? `<div class="scroll"><table class="tbl" id="${id}"><thead><tr>${cab.map(([t, n]) => `<th${n ? ' class="n"' : ""}>${t}</th>`).join("")}</tr>${total ? `<tr class="rel-total" style="background:var(--mint-2)">${total.map(([v, n]) => `<td${n ? ' class="n"' : ""}><b>${v}</b></td>`).join("")}</tr>` : ""}</thead><tbody>${linhas.join("")}</tbody></table></div>` : `<div class="empty">${vazio}</div>`;
  const td = (v, n, cls = "") => `<td class="${n ? "n " : ""}${cls}">${v}</td>`;
  function relFinHTML(aba, mk) {
    const nomeM = MESES[+mk.slice(5) - 1].toLowerCase();
    if (aba === "evol") {
      const ks = mesesAte(mk, 12);
      if (ks.map((k) => M(k)).some((x) => !x)) return loadingHTML();
      const lin = ks.map((k) => {
        const r = resumoMes(k), ex = extrato(k), real = (S.months[k].atendimentos || []).filter(contaRealizado).length;
        return { k, r, rec: ex ? ex.total : null, real };
      }).filter((x) => x.r.faturado || x.rec || x.real);
      const T = lin.reduce((t, x) => (t.fat += x.r.faturado, t.desc += x.r.descontos, t.liq += x.r.liquido, t.rec += x.rec || 0, t.real += x.real, t), { fat: 0, desc: 0, liq: 0, rec: 0, real: 0 }), KS = lin.map((x) => x.k).join(",");
      const mx = Math.max(1, ...lin.map((x) => x.r.liquido));
      return `<section class="panel"><h2>Evolu\xE7\xE3o dos \xFAltimos 12 meses</h2><p class="sub">Faturado, descontos e l\xEDquido pela data do atendimento; recebido pelo extrato (dinheiro que entrou no m\xEAs).</p>${tabela("rel-tab", [["M\xEAs"], ["Atendimentos", 1], ["Faturado", 1], ["Descontos", 1], ["L\xEDquido", 1], ["Recebido no m\xEAs", 1], [""]], [["Total"], [nbt(T.real, "at", KS, "", "q"), 1], [nbt(brl(T.fat), "at", KS, "", "fat"), 1], [nbt("\u2212 " + brl(T.desc), "at", KS, "d:todos", "desc"), 1], [nbt(brl(T.liq), "at", KS, "", "liq"), 1], [nbt(brl(T.rec), "rec", KS), 1], [""]], lin.map((x) => `<tr>${td(`<button class="linkbtn" data-act="rel-mes" data-mk="${x.k}">${rotMes(x.k)}</button>`)}${td(nbt(x.real, "at", x.k, "", "q"), 1)}${td(nbt(brl(x.r.faturado), "at", x.k, "", "fat"), 1)}${td(nbt("\u2212 " + brl(x.r.descontos), "at", x.k, "d:todos", "desc"), 1, "neg")}${td(`<b>${nbt(brl(x.r.liquido), "at", x.k, "", "liq")}</b>`, 1)}${td(x.rec == null ? "\u2026" : nbt(brl(x.rec), "rec", x.k), 1)}<td style="width:30%"><div class="bar" style="height:10px"><i class="a" style="width:${x.r.liquido / mx * 100}%"></i></div></td></tr>`), "Nenhum m\xEAs com atendimentos.")}</section>`;
    }
    if (aba === "serv") {
      if (!M(mk)) return loadingHTML();
      const m = S.months[mk], porS = {}, porL = {};
      for (const a of m.atendimentos) {
        if (!contaRealizado(a)) continue;
        const o = origemAt(a), bruto = o === "pacote" ? valorSessaoPac(pacoteBy(a.pacoteId)) : num(a.valor), liq = rendeAt(a), desc = bruto - liq;
        const add = (g, k, nome, cor) => {
          const x = g[k] || (g[k] = { f: k, nome, cor, q: 0, fat: 0, desc: 0, liq: 0 });
          x.q++;
          x.fat += bruto;
          x.desc += desc;
          x.liq += liq;
        };
        const s = serv(a.servicoId), l = localBy(a.localId);
        add(porS, "s:" + a.servicoId, (s || {}).nome || "Servi\xE7o removido", (s || {}).cor);
        add(porL, "l:" + a.localId, (l || {}).nome || "Local removido");
      }
      const bloco = (titulo, id, g) => {
        const arr = Object.values(g).sort((a, b) => b.liq - a.liq), T = arr.reduce((t, x) => (t.q += x.q, t.fat += x.fat, t.desc += x.desc, t.liq += x.liq, t), { q: 0, fat: 0, desc: 0, liq: 0 });
        return `<section class="panel" style="margin-top:18px"><h2>${titulo}</h2>${tabela(id, [[titulo === "Por servi\xE7o" ? "Servi\xE7o" : "Local"], ["Atendimentos", 1], ["Faturado", 1], ["Descontos", 1], ["L\xEDquido", 1], ["% do l\xEDquido", 1]], [["Total"], [nbt(T.q, "at", mk, "", "q"), 1], [nbt(brl(T.fat), "at", mk, "", "fat"), 1], [nbt("\u2212 " + brl(T.desc), "at", mk, "d:todos", "desc"), 1], [nbt(brl(T.liq), "at", mk, "", "liq"), 1], ["100%", 1]], arr.map((x) => `<tr>${td(`${x.cor ? `<span class="dot" style="--c:${esc(x.cor)}"></span>` : ""}${nbt(esc(x.nome), "at", mk, x.f, "q")}`)}${td(nbt(x.q, "at", mk, x.f, "q"), 1)}${td(nbt(brl(x.fat), "at", mk, x.f, "fat"), 1)}${td(x.desc ? nbt("\u2212 " + brl(x.desc), "at", mk, x.f, "desc") : "\u2014", 1, x.desc ? "neg" : "")}${td(`<b>${nbt(brl(x.liq), "at", mk, x.f, "liq")}</b>`, 1)}${td(fmtN(T.liq ? x.liq / T.liq * 100 : 0, 0) + "%", 1)}</tr>`), "Nenhum atendimento realizado neste m\xEAs.")}</section>`;
      };
      return `<p class="sub" style="margin:0">Atendimentos realizados em ${nomeM}, pela data do atendimento.</p>` + bloco("Por servi\xE7o", "rel-tab", porS) + bloco("Por local", "rel-tab2", porL);
    }
    if (aba === "receber") {
      const ks = mesesAte(mk, 6);
      if (ks.map((k) => M(k)).some((x) => !x)) return loadingHTML();
      const t = today(), dias = (d) => Math.max(0, Math.round((parseISO(t) - parseISO(d)) / 864e5));
      const dev = [];
      for (const k of ks) for (const a of S.months[k].atendimentos) if (contaRealizado(a) && origemAt(a) === "paciente" && !a.pago && num(a.valor) > 0) dev.push(a);
      const porP = {};
      for (const a of dev) {
        const x = porP[a.pacienteId] || (porP[a.pacienteId] = { id: a.pacienteId, q: 0, v: 0, desde: a.data, lista: [] });
        x.q++;
        x.v += num(a.valor);
        if (a.data < x.desde) x.desde = a.data;
        x.lista.push(a);
      }
      const arr = Object.values(porP).sort((a, b) => a.desde.localeCompare(b.desde));
      const reps = ks.map((k) => repasseDoMes(k)).filter((r) => r && r.temAlgo && !r.recebido);
      const tDev = arr.reduce((s, x) => s + x.v, 0), tRep = reps.reduce((s, r) => s + r.calc, 0), KS = ks.join(",");
      const card = (rot, v, sub, t, f = "") => `<button type="button" class="panel" data-act="rel-det" data-t="${t}" data-mk="${KS}" data-f="${f}" style="margin:0;text-align:left;cursor:pointer"><div class="small muted">${rot}</div><div class="big" style="margin-top:4px">${brl(v)}</div>${sub ? `<div class="small muted">${sub}</div>` : ""}<div class="small" style="margin-top:8px;color:var(--teal)">Ver detalhes \u203A</div></button>`;
      return `<div class="cols-even" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${card("Total a receber", tDev + tRep, "", "areceber")}${card("De pacientes", tDev, `${arr.length} pessoa${arr.length === 1 ? "" : "s"}`, "dev")}${card("Repasses da cl\xEDnica pendentes", tRep, `${reps.length} repasse${reps.length === 1 ? "" : "s"}`, "rep", "pend")}</div>
      <section class="panel" style="margin-top:18px"><h2>Pacientes que ainda n\xE3o pagaram</h2><p class="sub">Atendimentos realizados nos \xFAltimos 6 meses, pagos direto pelo paciente e ainda sem pagamento. Ordenado pelo mais antigo.</p>${tabela("rel-tab", [["Nome"], ["Atendimentos", 1], ["Valor", 1], ["Em aberto desde", 1], ["Dias", 1]], [["Total"], [nbt(arr.reduce((s, x) => s + x.q, 0), "dev", KS), 1], [nbt(brl(tDev), "dev", KS), 1], ["", 1], ["", 1]], arr.map((x) => {
        const d = dias(x.desde);
        return `<tr>${td(`<button class="linkbtn" data-act="rel-pac" data-id="${x.id}" data-aba="freq">${esc((pacBy(x.id) || {}).nome || "Paciente removido")}</button><br><span class="small muted">${x.lista.map((a) => dataCurta(a.data)).join(", ")}</span>`)}${td(nbt(x.q, "dev", KS, x.id), 1)}${td(`<b>${nbt(brl(x.v), "dev", KS, x.id)}</b>`, 1)}${td(dataCurta(x.desde), 1)}${td(d > 30 ? `<span class="badge b-bad">${d}</span>` : d > 7 ? `<span class="badge b-warn">${d}</span>` : d, 1)}</tr>`;
      }), "Ningu\xE9m devendo. \u{1F389}")}</section>
      <section class="panel" style="margin-top:18px"><h2>Repasses da cl\xEDnica pendentes</h2><p class="sub">Repasses calculados e ainda n\xE3o marcados como recebidos em Recebimentos.</p>${tabela("rel-tab2", [["Atendimentos de"], ["Previsto para", 1], ["Valor", 1], ["Situa\xE7\xE3o", 1]], [["Total"], ["", 1], [nbt(brl(tRep), "rep", KS, "pend"), 1], ["", 1]], reps.map((r) => `<tr>${td(`<button class="linkbtn" data-act="rel-receb" data-mk="${r.mk}">${mesLabel(r.mk)}</button>`)}${td(dataCurta(r.data), 1)}${td(`<b>${nbt(brl(r.calc), "rep", r.mk)}</b>`, 1)}${td(r.data < t ? '<span class="badge b-bad">Atrasado</span>' : '<span class="badge b-info">A vencer</span>', 1)}</tr>`), "Nenhum repasse pendente.")}</section>`;
    }
    if (aba === "desc") {
      const ks = mesesAte(mk, 12);
      if (ks.map((k) => M(k)).some((x) => !x)) return loadingHTML();
      const lin = ks.map((k) => ({ k, r: resumoMes(k), rp: repasseDoMes(k) })).filter((x) => x.r.descontos || x.rp && x.rp.temAlgo);
      const KS = lin.map((x) => x.k).join(",");
      const T = lin.reduce((t, x) => (t.sala += x.r.tSala, t.nota += x.r.tNota, t.combo += x.r.tCombo, t.desc += x.r.descontos, t.calc += x.rp ? x.rp.calc : 0, t.rec += x.rp && x.rp.recebido ? x.rp.valor : 0, t), { sala: 0, nota: 0, combo: 0, desc: 0, calc: 0, rec: 0 });
      return `<section class="panel"><h2>Descontos e repasses \xB7 \xFAltimos 12 meses</h2><p class="sub">Descontos pela data do atendimento. O repasse de cada m\xEAs \xE9 pago no 5\xBA dia \xFAtil do m\xEAs seguinte.</p>${tabela("rel-tab", [["M\xEAs"], ["Sala", 1], ["Nota", 1], ["Nota + sala 50%", 1], ["Total de descontos", 1], ["Repasse calculado", 1], ["Repasse recebido", 1], ["Diferen\xE7a", 1]], [["Total"], [nbt(brl(T.sala), "at", KS, "d:sala", "desc"), 1], [nbt(brl(T.nota), "at", KS, "d:nota", "desc"), 1], [nbt(brl(T.combo), "at", KS, "d:combo", "desc"), 1], [nbt(brl(T.desc), "at", KS, "d:todos", "desc"), 1], [nbt(brl(T.calc), "rep", KS), 1], [nbt(brl(T.rec), "rep", KS, "", "rec"), 1], ["", 1]], lin.map((x) => {
        const rp = x.rp, dif = rp && rp.recebido ? rp.valor - rp.calc : null;
        return `<tr>${td(rotMes(x.k))}${td(x.r.tSala ? nbt(brl(x.r.tSala), "at", x.k, "d:sala", "desc") : "\u2014", 1)}${td(x.r.tNota ? nbt(brl(x.r.tNota), "at", x.k, "d:nota", "desc") : "\u2014", 1)}${td(x.r.tCombo ? nbt(brl(x.r.tCombo), "at", x.k, "d:combo", "desc") : "\u2014", 1)}${td(`<b>${nbt(brl(x.r.descontos), "at", x.k, "d:todos", "desc")}</b>`, 1)}${td(rp && rp.temAlgo ? nbt(brl(rp.calc), "rep", x.k) : "\u2014", 1)}${td(rp && rp.recebido ? nbt(brl(rp.valor), "rep", x.k, "", "rec") + `<br><span class="small muted">${dataCurta(rp.recebidoEm || rp.data)}</span>` : rp && rp.temAlgo ? `<span class="small muted">previsto ${dataCurta(rp.data)}</span>` : "—", 1)}${td(dif == null ? "—" : Math.abs(dif) < 5e-3 ? "ok" : `<span class="${dif < 0 ? "neg" : ""}">${dif > 0 ? "+" : ""}${brl(dif)}</span>`, 1)}</tr>`;
      }), "Nenhum desconto ou repasse no per\xEDodo.")}</section>`;
    }
    return "";
  }
  // ===== Detalhe ao clicar nos números dos relatórios =====
  // nbt(): número clicável. Parâmetros: t = tipo do detalhe, mk = mês ou lista "AAAA-MM,AAAA-MM", f = filtro, k = número clicado.
  const nbt = (txt, t, mk, f = "", k = "") => `<button type="button" class="numbtn" data-act="rel-det" data-t="${t}" data-mk="${mk}" data-f="${esc(f)}" data-k="${k}" title="Ver detalhe">${txt}</button>`;
  function infoAt(a) {
    const o = origemAt(a), bruto = o === "pacote" ? valorSessaoPac(pacoteBy(a.pacoteId)) : num(a.valor), liq = rendeAt(a), d = Math.max(0, bruto - liq);
    let tipo = "";
    if (d) tipo = o === "clinica" ? salaEmbutidaAt(a) ? "combo" : "nota" : "sala";
    return { a, bruto, liq, d, tipo };
  }
  const ROT_DESC = { sala: "Desconto de sala", nota: "Desconto de nota", combo: "Desconto nota + sala (50%)", todos: "Todos os descontos" };
  const periodoTxt = (ks) => ks.length === 1 ? mesLabel(ks[0]) : rotMes(ks[0]) + " a " + rotMes(ks[ks.length - 1]);
  function modalRel(t, mkStr, f, k) {
    S.relDet = [t, mkStr, f, k];
    const ks = mkStr.split(",").filter(Boolean).sort(), per = periodoTxt(ks), hoje = today();
    const sn = (a) => (serv(a.servicoId) || {}).nome || "Servi\xE7o", ln = (a) => (localBy(a.localId) || {}).nome || "";
    const nomeCel = (a, extra = "") => `<button class="linkbtn" data-act="edit" data-id="${a.id}">${esc(nomeAt(a))}</button><br><span class="small muted">${esc(sn(a))}${ln(a) ? " \xB7 " + esc(ln(a)) : ""}${extra}</span>`;
    const tbl = (cab, tot, linhas, vazio) => linhas.length ? `<div class="scroll" style="margin-top:12px"><table class="tbl"><thead><tr>${cab.map(([x, n]) => `<th${n ? ' class="n"' : ""}>${x}</th>`).join("")}</tr><tr class="rel-total" style="background:var(--mint-2)">${tot.map(([x, n]) => `<td${n ? ' class="n"' : ""}><b>${x}</b></td>`).join("")}</tr></thead><tbody>${linhas.join("")}</tbody></table></div>` : `<div class="empty">${vazio}</div>`;
    let h = "";
    if (t === "at") {
      let lista = [];
      for (const mk of ks) for (const a of (S.months[mk] || { atendimentos: [] }).atendimentos) if (contaRealizado(a)) lista.push(infoAt(a));
      let rot = "Todos os atendimentos realizados";
      if (f.startsWith("s:")) { const id = f.slice(2); lista = lista.filter((x) => x.a.servicoId === id); rot = (serv(id) || {}).nome || "Servi\xE7o removido"; }
      else if (f.startsWith("l:")) { const id = f.slice(2); lista = lista.filter((x) => x.a.localId === id); rot = (localBy(id) || {}).nome || "Local removido"; }
      else if (f.startsWith("d:")) { const d = f.slice(2); lista = lista.filter((x) => x.d && (d === "todos" || x.tipo === d)); rot = ROT_DESC[d] || "Descontos"; }
      if (k === "desc" && !f.startsWith("d:")) { lista = lista.filter((x) => x.d); rot += " \xB7 s\xF3 com desconto"; }
      lista.sort((x, y) => (x.a.data + x.a.hora).localeCompare(y.a.data + y.a.hora));
      const T = lista.reduce((t, x) => (t.fat += x.bruto, t.d += x.d, t.liq += x.liq, t), { fat: 0, d: 0, liq: 0 });
      const foco = { q: ["Atendimentos", lista.length], fat: ["Faturado", brl(T.fat)], desc: ["Descontos", brl(T.d)], liq: ["L\xEDquido", brl(T.liq)] }[k] || ["Atendimentos", lista.length];
      const etiqueta = (x) => x.tipo === "combo" ? "nota + sala 50%" : x.tipo === "nota" ? "nota " + fmtN(notaPctAt(x.a), 0) + "%" : x.tipo === "sala" ? "sala " + fmtN(salaPctAt(x.a), 0) + "%" + (origemAt(x.a) === "pacote" ? " (pacote)" : "") : "";
      h = `<h2>${foco[0]}: ${foco[1]}</h2><p class="sub" style="margin-top:0">${esc(rot)} \xB7 ${per}</p>
      <div class="kv"><span>Atendimentos</span><span class="num">${lista.length}</span></div><div class="kv"><span>Faturado</span><span class="num">${brl(T.fat)}</span></div><div class="kv"><span>Descontos</span><span class="num neg">\u2212 ${brl(T.d)}</span></div><div class="kv total"><span>L\xEDquido</span><span>${brl(T.liq)}</span></div>
      ${tbl([["Data"], ["Nome"], ["Faturado", 1], ["Desconto", 1], ["L\xEDquido", 1]], [[lista.length + " atend."], [""], [brl(T.fat), 1], ["\u2212 " + brl(T.d), 1], [brl(T.liq), 1]], lista.map((x) => `<tr><td class="num">${dataCurta(x.a.data)}</td><td>${nomeCel(x.a)}</td><td class="n">${brl(x.bruto)}</td><td class="n">${x.d ? `<span class="neg">\u2212 ${brl(x.d)}</span><br><span class="small muted">${etiqueta(x)}</span>` : "\u2014"}</td><td class="n"><b>${brl(x.liq)}</b></td></tr>`), "Nenhum atendimento.")}`;
    } else if (t === "rec") {
      const ent = [];
      for (const mk of ks) { const ex = extrato(mk); if (ex) ent.push(...ex.ent); }
      const tot = ent.reduce((s, e) => s + e.valor, 0), rotT = { paciente: "Paciente", pacote: "Pacote", repasse: "Repasse", mensalidade: "Mensalidade" };
      h = `<h2>Recebido: ${brl(tot)}</h2><p class="sub" style="margin-top:0">Dinheiro que entrou \xB7 ${per}, pela data do pagamento.</p>
      ${tbl([["Data"], ["Descri\xE7\xE3o"], ["Tipo"], ["Valor", 1]], [[ent.length + " entradas"], [""], [""], [brl(tot), 1]], ent.map((e) => `<tr><td class="num">${dataCurta(e.data)}</td><td>${e.id ? `<button class="linkbtn" data-act="edit" data-id="${e.id}">${esc(e.desc)}</button>` : `<b>${esc(e.desc)}</b>`}<br><span class="small muted">${esc(e.det)}</span></td><td class="small muted">${rotT[e.tipo] || ""}</td><td class="n"><b>${brl(e.valor)}</b></td></tr>`), "Nenhuma entrada no per\xEDodo.")}`;
    } else if (t === "rep") {
      const reps = ks.map((mk) => repasseDoMes(mk)).filter((r) => r && r.temAlgo && (f !== "pend" || !r.recebido));
      const tot = reps.reduce((s, r) => s + (k === "rec" ? r.recebido ? r.valor : 0 : r.calc), 0);
      h = `<h2>${k === "rec" ? "Repasse recebido" : f === "pend" ? "Repasses pendentes" : "Repasse calculado"}: ${brl(tot)}</h2><p class="sub" style="margin-top:0">Repasse da cl\xEDnica \xB7 atendimentos de ${per}</p>` + (reps.length ? reps.map((r) => {
        const linhas = [...r.itens.map((x) => `<tr><td class="num">${dataCurta(x.a.data)}</td><td>${nomeCel(x.a)}</td><td class="n">${brl(x.cheio)}</td><td class="n">${x.cheio - x.v ? `<span class="neg">\u2212 ${brl(x.cheio - x.v)}</span><br><span class="small muted">${x.combo ? "nota + sala 50%" : "nota"}</span>` : "\u2014"}</td><td class="n"><b>${brl(x.v)}</b></td></tr>`), ...r.salas.map((x) => `<tr><td class="num">${dataCurta(x.a.data)}</td><td>${nomeCel(x.a, " \xB7 pago pelo paciente")}</td><td class="n">\u2014</td><td class="n"><span class="neg">\u2212 ${brl(x.v)}</span><br><span class="small muted">sala</span></td><td class="n neg">\u2212 ${brl(x.v)}</td></tr>`)];
        return `<div style="margin-top:18px;padding-top:12px;border-top:1px solid var(--line)"><div class="row" style="align-items:baseline"><b class="grow">Atendimentos de ${mesLabel(r.mk)}</b>${r.recebido ? `<span class="badge b-ok">Recebido em ${dataCurta(r.recebidoEm || r.data)}: ${brl(r.valor)}</span>` : `<span class="badge ${r.data < hoje ? "b-bad" : "b-info"}">${r.data < hoje ? "Atrasado" : "Previsto"} \xB7 ${dataCurta(r.data)}</span>`}</div>
        ${resumoRepasseHTML(r, "Repasse calculado")}${r.recebido && Math.abs(r.valor - r.calc) >= 5e-3 ? `<div class="kv small"><span>Diferen\xE7a entre recebido e calculado</span><span class="num ${r.valor < r.calc ? "neg" : ""}">${brl(r.valor - r.calc)}</span></div>` : ""}
        ${tbl([["Data"], ["Nome"], ["Valor cheio", 1], ["Desconto", 1], ["Repasse", 1]], [[r.itens.length + r.salas.length + " itens"], [""], [brl(r.cheio), 1], ["\u2212 " + brl(r.cheio - r.calc), 1], [brl(r.calc), 1]], linhas, "")}</div>`;
      }).join("") : `<div class="empty">Nenhum repasse.</div>`);
    } else if (t === "dev" || t === "areceber") {
      const dev = [];
      for (const mk of ks) for (const a of (S.months[mk] || { atendimentos: [] }).atendimentos) if (contaRealizado(a) && origemAt(a) === "paciente" && !a.pago && num(a.valor) > 0 && (!f || a.pacienteId === f)) dev.push(a);
      dev.sort((x, y) => (x.data + x.hora).localeCompare(y.data + y.hora));
      const tDev = dev.reduce((s, a) => s + num(a.valor), 0);
      const dias = (d) => Math.max(0, Math.round((parseISO(hoje) - parseISO(d)) / 864e5));
      const tabDev = tbl([["Data"], ["Nome"], ["Dias", 1], ["Valor", 1], [""]], [[dev.length + " atend."], [""], ["", 1], [brl(tDev), 1], [""]], dev.map((a) => `<tr><td class="num">${dataCurta(a.data)}</td><td>${nomeCel(a)}</td><td class="n">${dias(a.data)}</td><td class="n"><b>${brl(a.valor)}</b></td><td class="n"><button class="btn small" data-act="rel-pagar" data-id="${a.id}">Recebido</button></td></tr>`), "Ningu\xE9m devendo.");
      if (t === "dev") h = `<h2>${f ? esc((pacBy(f) || {}).nome || "Paciente") + ": " : "Pacientes que ainda n\xE3o pagaram: "}${brl(tDev)}</h2><p class="sub" style="margin-top:0">Atendimentos realizados e ainda sem pagamento \xB7 ${per}. Marque "Recebido" quando o paciente pagar.</p>${tabDev}`;
      else {
        const reps = ks.map((mk) => repasseDoMes(mk)).filter((r) => r && r.temAlgo && !r.recebido), tRep = reps.reduce((s, r) => s + r.calc, 0);
        h = `<h2>Total a receber: ${brl(tDev + tRep)}</h2><p class="sub" style="margin-top:0">${per}</p><div class="kv"><span>De pacientes</span><span class="num">${brl(tDev)}</span></div><div class="kv"><span>Repasses da cl\xEDnica pendentes</span><span class="num">${brl(tRep)}</span></div><div class="kv total"><span>Total</span><span>${brl(tDev + tRep)}</span></div>
        <h3 style="margin:18px 0 0">Pacientes</h3>${tabDev}<h3 style="margin:18px 0 0">Repasses</h3>${tbl([["Atendimentos de"], ["Previsto para", 1], ["Valor", 1]], [["Total"], ["", 1], [brl(tRep), 1]], reps.map((r) => `<tr><td>${nbt(mesLabel(r.mk), "rep", r.mk, "pend")}</td><td class="n">${dataCurta(r.data)}</td><td class="n"><b>${brl(r.calc)}</b></td></tr>`), "Nenhum repasse pendente.")}`;
      }
    }
    openModal(h + `<div class="modal-actions"><span class="grow"></span><button class="btn primary" data-close type="button">Fechar</button></div>`);
  }
  // Exporta para planilha a(s) tabela(s) da aba aberta.
  function exportTabelaCSV(nome) {
    if (!Store.dl) return;
    const q = (v) => '"' + String(v != null ? v : "").replace(/"/g, '""') + '"';
    const rows = [];
    document.querySelectorAll("#rel-tab, #rel-tab2").forEach((t, i) => {
      if (i) rows.push("");
      t.querySelectorAll("tr").forEach((tr) => {
        if (tr.hidden) return;
        rows.push([...tr.children].map((c) => q(c.innerText.replace(/\s+/g, " ").trim())).join(";"));
      });
    });
    const blob = new Blob(["﻿" + rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nome + ".csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1e3);
  }
  function vRelatorios() {
    const mk = S.mesRel || (S.mesRel = mkOf(today())), ant = addMonth(mk, -1);
    const m = M(mk), mA = M(ant);
    if (!m || !mA) return loadingHTML();
    const adm = verValores(), fq = freqDoMes(mk), fqA = freqDoMes(ant), nomeM = MESES[+mk.slice(5) - 1].toLowerCase();
    const cat = S.relCat || "todos";
    let html = head("Relat\xF3rios", (ABAS_REL.find((x) => x[0] === (adm ? S.relAba || "freq" : "freq")) || ABAS_REL[0])[1] + " \xB7 " + mesLabel(mk), `<button class="iconbtn" data-act="mes-rel" data-n="-1" aria-label="M\xEAs anterior">‹</button><button class="iconbtn" data-act="mes-rel" data-n="1" aria-label="Pr\xF3ximo m\xEAs">›</button>${Store.dl ? '<button class="btn" data-act="rel-csv">Exportar planilha</button>' : ""}`);
    html += abasRelHTML();
    if (adm && (S.relAba || "freq") !== "freq") return html + relFinHTML(S.relAba, mk);
    // ---- detalhe de uma pessoa
    if (S.relPac) {
      const p = pacBy(S.relPac) || { nome: "Paciente removido" }, r = fq[S.relPac] || { realizado: 0, falta: 0, desmarcado: 0, cancelado: 0, agendado: 0, bruto: 0, liq: 0, lista: [] };
      const meses = [...Array(6)].map((_, i) => addMonth(mk, i - 5));
      const hist = meses.map((k) => {
        const f = M(k) ? freqDoMes(k) : null;
        return { k, n: f ? (f[S.relPac] || {}).realizado || 0 : null, fal: f ? (f[S.relPac] || {}).falta || 0 : null };
      });
      const maxH = Math.max(1, ...hist.map((x) => x.n || 0));
      const card = (rot, v, cls = "") => `<section class="panel" style="margin:0;padding:14px 16px"><div class="small muted">${rot}</div><div class="mid ${cls}" style="margin-top:6px;font-size:22px;white-space:nowrap">${v}</div></section>`;
      html += `<div class="row" style="margin-bottom:14px"><button class="btn small" data-act="rel-pac" data-id="">‹ Todos</button><h2 class="grow" style="margin:0">${esc(p.nome)}</h2>${p.id ? `<button class="btn small" data-act="edit-pac" data-id="${p.id}">Abrir cadastro</button>` : ""}</div>`;
      html += `<div class="cols-even" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px">${card("Realizados em " + nomeM, r.realizado)}${card("Faltas", r.falta, r.falta ? "neg" : "")}${card("Desmarcou / cancelou", r.desmarcado + r.cancelado)}${card("Ainda agendados", r.agendado)}${adm ? card("Faturado", brl(r.bruto)) + card("L\xEDquido", brl(r.liq)) : ""}</div>`;
      html += `<section class="panel" style="margin-top:18px"><h2>Atendimentos de ${nomeM}</h2>${r.lista.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>Data</th><th>Servi\xE7o</th><th>Situa\xE7\xE3o</th>${adm ? '<th class="n">Valor</th>' : ""}</tr></thead><tbody>${[...r.lista].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)).map((a) => {
        var _a;
        return `<tr><td class="num"><button class="linkbtn" data-act="edit" data-id="${a.id}">${dataCurta(a.data)} ${a.hora}</button></td><td>${esc(((_a = serv(a.servicoId)) == null ? void 0 : _a.nome) || "")}</td><td>${stBadge(a) || esc(ST_ROT[a.status] || a.status)}</td>${adm ? `<td class="n">${brl(a.valor)}</td>` : ""}</tr>`;
      }).join("")}</tbody></table></div>` : '<div class="empty">Nenhum atendimento neste m\xEAs.</div>'}</section>`;
      html += `<section class="panel" style="margin-top:18px"><h2>\xDAltimos 6 meses</h2><p class="sub">Atendimentos realizados por m\xEAs.</p>${hist.map((x) => `<div class="row small" style="margin:6px 0;gap:10px"><span style="width:70px">${MESES[+x.k.slice(5) - 1].slice(0, 3)}/${x.k.slice(2, 4)}</span><div class="bar grow" style="height:10px"><i class="a" style="width:${x.n == null ? 0 : x.n / maxH * 100}%"></i></div><b class="num" style="width:90px;text-align:right">${x.n == null ? "…" : x.n + (x.fal ? ` <span class="small muted">(${x.fal} falta${x.fal > 1 ? "s" : ""})</span>` : "")}</b></div>`).join("")}</section>`;
      return html;
    }
    // ---- visão geral
    const linhas = Object.values(fq).map((r) => ({ r, p: pacBy(r.id) })).filter((x) => cat === "todos" || x.p && categoriaDe(x.p) === cat);
    linhas.sort((a, b) => b.r.realizado - a.r.realizado || ((a.p || {}).nome || "").localeCompare((b.p || {}).nome || ""));
    const tot = linhas.reduce((t, x) => (t.real += x.r.realizado, t.falta += x.r.falta, t.desm += x.r.desmarcado + x.r.cancelado, t.ag += x.r.agendado, t.bruto += x.r.bruto, t.liq += x.r.liq, t), { real: 0, falta: 0, desm: 0, ag: 0, bruto: 0, liq: 0 });
    const pessoas = linhas.filter((x) => x.r.realizado > 0).length;
    const taxaFalta = tot.real + tot.falta ? tot.falta / (tot.real + tot.falta) * 100 : 0;
    const card = (rot, v, sub = "") => `<section class="panel" style="margin:0"><div class="small muted">${rot}</div><div class="big" style="margin-top:4px">${v}</div>${sub ? `<div class="small muted" style="margin-top:4px">${sub}</div>` : ""}</section>`;
    html += `<div class="cols-even" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">${card("Pessoas atendidas", pessoas)}${card("Atendimentos realizados", tot.real)}${card("M\xE9dia por pessoa", pessoas ? fmtN(tot.real / pessoas, 1) : "—")}${card("Faltas", tot.falta, fmtN(taxaFalta, 0) + "% dos atendimentos")}</div>`;
    html += `<section class="panel" style="margin-top:18px"><div class="row" style="flex-wrap:wrap;gap:8px;margin-bottom:10px"><input id="rel-busca" placeholder="Buscar por nome" value="${esc(S.relBusca || "")}" style="flex:1;min-width:180px"><div class="seg">${[["todos", "Todos"], ["aluno", "Alunos"], ["paciente", "Pacientes"]].map(([k, l]) => `<button type="button" data-act="rel-cat" data-c="${k}" aria-pressed="${cat === k}">${l}</button>`).join("")}</div></div>`;
    html += linhas.length ? `<div class="scroll"><table class="tbl" id="rel-tab"><thead><tr><th>Nome</th><th class="n">Realizados</th><th class="n">M\xEAs anterior</th><th class="n">Faltas</th><th class="n">Desmarcou / cancelou</th><th class="n">Agendados</th>${adm ? '<th class="n">Faturado</th><th class="n">L\xEDquido</th>' : ""}</tr><tr class="rel-total" style="background:var(--mint-2)"><td><b>Total (${linhas.length} pessoa${linhas.length === 1 ? "" : "s"})</b></td><td class="n"><b>${tot.real}</b></td><td></td><td class="n"><b>${tot.falta}</b></td><td class="n"><b>${tot.desm}</b></td><td class="n"><b>${tot.ag}</b></td>${adm ? `<td class="n"><b>${brl(tot.bruto)}</b></td><td class="n"><b>${brl(tot.liq)}</b></td>` : ""}</tr></thead><tbody>${linhas.map(({ r, p }) => {
      const a = fqA[r.id] ? fqA[r.id].realizado : 0, dif = r.realizado - a;
      return `<tr data-nome="${esc(((p || {}).nome || "").toLowerCase())}"><td><button class="linkbtn" data-act="rel-pac" data-id="${r.id}">${esc((p || {}).nome || "Paciente removido")}</button><br><span class="small muted">${p ? categoriaDe(p) === "aluno" ? "Aluno" : "Paciente" : ""}</span></td><td class="n"><b>${r.realizado}</b></td><td class="n">${a}${dif ? ` <span class="small" style="color:${dif > 0 ? "var(--ok)" : "var(--bad)"}">${dif > 0 ? "▲" : "▼"}${Math.abs(dif)}</span>` : ""}</td><td class="n ${r.falta ? "neg" : ""}">${r.falta || "—"}</td><td class="n">${r.desmarcado + r.cancelado || "—"}</td><td class="n">${r.agendado || "—"}</td>${adm ? `<td class="n">${brl(r.bruto)}</td><td class="n"><b>${brl(r.liq)}</b></td>` : ""}</tr>`;
    }).join("")}</tbody></table></div>` : `<div class="empty">Nenhum atendimento em ${nomeM}.</div>`;
    html += `<p class="small muted" style="margin:10px 0 0">Clique no nome para ver os atendimentos da pessoa no m\xEAs e a evolu\xE7\xE3o dos \xFAltimos 6 meses.</p></section>`;
    return html;
  }
  function exportRelCSV() {
    const mk = S.mesRel, fq = freqDoMes(mk);
    if (!fq || !Store.dl) return;
    const adm = verValores(), q = (v) => '"' + String(v != null ? v : "").replace(/"/g, '""') + '"', f = (n) => (+n || 0).toFixed(2).replace(".", ",");
    const cab = ["Nome", "Tipo", "Realizados", "Faltas", "Desmarcou", "Cancelou", "Agendados"].concat(adm ? ["Faturado", "L\xEDquido"] : []);
    const rows = [cab.map(q).join(";")];
    Object.values(fq).map((r) => ({ r, p: pacBy(r.id) })).sort((a, b) => ((a.p || {}).nome || "").localeCompare((b.p || {}).nome || "")).forEach(({ r, p }) => {
      rows.push([(p || {}).nome || "Paciente removido", p ? categoriaDe(p) === "aluno" ? "Aluno" : "Paciente" : "", r.realizado, r.falta, r.desmarcado, r.cancelado, r.agendado].concat(adm ? [f(r.bruto), f(r.liq)] : []).map(q).join(";"));
    });
    const blob = new Blob(["\uFEFF" + rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "frequencia-" + mk + ".csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1e3);
  }
  function ligarRelatorios() {
    const inp = $("#rel-busca");
    if (!inp) return;
    const filtrar = () => {
      S.relBusca = inp.value;
      const q = inp.value.trim().toLowerCase();
      document.querySelectorAll("#rel-tab tbody tr[data-nome]").forEach((tr) => {
        tr.hidden = !!q && !tr.dataset.nome.includes(q);
      });
    };
    inp.oninput = filtrar;
    filtrar();
  }
  function vMetas() {
    const mk = S.mesMeta, m = M(mk);
    if (!m) return loadingHTML();
    const c = S.config, meta = num(c.metaMensal), cap = Math.max(1, num(c.turmaCapacidade) || 1);
    const ex = extrato(mk);
    if (!ex) return loadingHTML();
    const pv = previstoDoMes(mk), real = { liq: ex.total }, proj = { liq: ex.total + pv.repasse + pv.devendoTot + pv.confirmarTot + pv.futuroTot };
    const dS = horasDisp(mk, "studio"), dH = horasDisp(mk, "home"), oc = horasOcup(mk);
    const pA = meta ? Math.min(100, real.liq / meta * 100) : 0, pB = meta ? Math.min(100 - pA, Math.max(0, (proj.liq - real.liq) / meta * 100)) : 0;
    const ops = opcoes().sort((a, b) => b.liqHora - a.liqHora);
    let html = head("Metas", mesLabel(mk), `<button class="iconbtn" data-act="mes-meta" data-n="-1" aria-label="M\xEAs anterior">\u2039</button><button class="iconbtn" data-act="mes-meta" data-n="1" aria-label="Pr\xF3ximo m\xEAs">\u203A</button>`);
    html += `<div class="cols"><section class="panel"><h2>Quanto voc\xEA quer receber por m\xEAs?</h2><p class="sub">Valor l\xEDquido, depois do aluguel da sala, da nota fiscal e do deslocamento.</p>
    <label class="f" style="max-width:240px">Meta mensal l\xEDquida (R$)<input type="number" step="50" inputmode="decimal" value="${meta}" data-cfg="metaMensal" data-type="num" data-rerender="1"></label>
    <div class="bar" style="margin-top:16px"><i class="a" style="width:${pA}%"></i><i class="b" style="width:${pB}%"></i></div>
    <div class="legend"><span>Recebido ${brl(real.liq)}</span><span class="lb">Previsto ${brl(proj.liq - real.liq)}</span></div>
    <p class="small muted" style="margin:8px 0 0">Pelo extrato: recebido no m\xEAs + repasse previsto, pacientes devendo e agenda paga pelo paciente.</p>
    ${(() => {
      const pr = producaoDoMes(mk);
      return pr ? `<div class="kv" style="margin-top:10px"><span>Produzido no m\xEAs (pela data do atendimento)</span><b class="num">${brl(pr.real)}</b></div><div class="kv"><span>Produzido + agenda</span><span class="num">${brl(pr.real + pr.agend)}</span></div>` : "";
    })()}
    <p style="margin:12px 0 0">${meta - proj.liq > 0 ? `Com a agenda atual faltam <b>${brl(meta - proj.liq)}</b>.` : `A agenda atual j\xE1 passa a meta em <b>${brl(proj.liq - meta)}</b>.`}</p></section>
    <section class="panel"><h2>Seu tempo em ${MESES[+mk.slice(5) - 1]}</h2><p class="sub">Calculado a partir dos hor\xE1rios de atendimento cadastrados.</p>
    ${horasBar("Studio", oc.studio, dS)}${horasBar("Home care", oc.home, dH)}
    <p class="small muted" style="margin:10px 0 0">Cada hor\xE1rio ocupa ${durPadrao()} min de atendimento + ${intervalo()} min de organiza\xE7\xE3o.</p></section></div>`;
    html += `<section class="panel" style="margin-top:18px"><h2>Quanto rende cada hora</h2><p class="sub">L\xEDquido de cada op\xE7\xE3o e quantos seriam necess\xE1rios para bater ${brl(meta)} s\xF3 com ela. Os descontos de aluguel e nota s\xE3o a m\xE9dia dos atendimentos j\xE1 lan\xE7ados de cada servi\xE7o.</p><div class="scroll"><table class="tbl"><thead><tr><th>Op\xE7\xE3o</th><th class="n">Cobra</th><th class="n">Fica pra voc\xEA</th><th class="n">Por hora</th><th class="n">S\xF3 com esta op\xE7\xE3o</th><th>Cabe na agenda?</th></tr></thead><tbody>`;
    for (const o of ops) {
      const n = o.liq > 0 ? Math.ceil(meta / o.liq) : Infinity, hrs = n * o.horasUnid, disp = o.tipo === "home" ? dH : dS;
      const fit = !isFinite(n) ? '<span class="fits no">N\xE3o d\xE1 lucro</span>' : disp <= 0 ? '<span class="muted small">Sem hor\xE1rio cadastrado</span>' : hrs <= disp ? `<span class="fits yes">Sim</span> <span class="small muted">${fmtN(hrs, 1)} de ${fmtN(disp, 0)} h</span>` : `<span class="fits no">N\xE3o</span> <span class="small muted">${fmtN(hrs, 1)} de ${fmtN(disp, 0)} h</span>`;
      const qt = !isFinite(n) ? "\u2014" : o.key.startsWith("p:") ? `${n} alunos (${fmtN(n * o.vagasSemana, 0)} vagas/semana)` : `${n} ${o.unid === "check-in" ? "check-ins" : o.unid === "aula-aluno" ? "alunos-aula" : o.unid === "aula" ? "aulas" : "atendimentos"}`;
      html += `<tr><td><span class="dot" style="--c:${esc(o.cor || "#15847D")}"></span>${esc(o.nome)}<br><span class="small muted">por ${o.unid === "aula-aluno" ? "aluno por aula" : o.unid}</span></td><td class="n">${brl(o.v)}</td><td class="n">${brl(o.liq)}</td><td class="n"><b>${brl(o.liqHora)}</b></td><td class="n">${qt}</td><td>${fit}</td></tr>`;
    }
    html += `</tbody></table></div></section>`;
    html += `<div class="cols" style="margin-top:18px"><section class="panel"><div class="row"><h2 class="grow">Monte seu m\xEAs ideal</h2><button class="btn small" data-act="sim-agenda">Usar a agenda deste m\xEAs</button><button class="btn small ghost" data-act="sim-zerar">Zerar</button></div><p class="sub">Digite quantos de cada voc\xEA quer atender no m\xEAs. O resultado ao lado mostra se chega na meta e se cabe nos seus hor\xE1rios.</p><div id="sim-rows">${opcoes().map((o) => `<div class="sim-row"><div><span class="dot" style="--c:${esc(o.cor || "#15847D")}"></span>${esc(o.nome)}<div class="u">${o.uLabel} \xB7 ${brl(o.liq)} l\xEDquido cada</div></div><input type="number" min="0" step="1" inputmode="numeric" value="${num(c.simulacao[o.key]) || ""}" placeholder="0" data-sim="${o.key}" aria-label="${esc(o.nome)}"></div>`).join("")}</div></section><section class="panel sticky" id="sim-result"></section></div>`;
    return html;
  }
  function horasBar(label, usado, disp) {
    const p = disp ? Math.min(100, usado / disp * 100) : 0, over = disp && usado > disp;
    return `<div style="margin:10px 0 4px" class="row"><b class="grow">${label}</b><span class="num small">${fmtN(usado, 1)} h marcadas de ${fmtN(disp, 0)} h</span></div><div class="bar"><i class="${over ? "over" : "a"}" style="width:${disp ? p : 0}%"></i></div>${!disp ? '<p class="small muted" style="margin:4px 0 0">Nenhum hor\xE1rio cadastrado para este local.</p>' : ""}`;
  }
  function renderSim() {
    const el = $("#sim-result");
    if (!el) return;
    const mk = S.mesMeta, meta = num(S.config.metaMensal), r = simCalc(), dS = horasDisp(mk, "studio"), dH = horasDisp(mk, "home");
    const diff = meta - r.liq, cap = Math.max(1, num(S.config.turmaCapacidade) || 1);
    const okS = r.hS <= dS + 1e-9, okH = r.hH <= dH + 1e-9 || r.hH === 0;
    let h = `<h2>Resultado</h2><p class="sub">Estimativa para ${mesLabel(mk)}.</p><div class="big">${brl(r.liq)}</div><div class="muted small">l\xEDquido estimado \xB7 bruto ${brl(r.bruto)}</div>
  <div class="bar" style="margin:12px 0 4px"><i class="${diff > 0 ? "a" : "a"}" style="width:${meta ? Math.min(100, r.liq / meta * 100) : 0}%"></i></div>
  <p style="margin:6px 0 14px">${!meta ? "Defina uma meta acima." : diff > 0 ? `Faltam <b>${brl(diff)}</b> para a meta de ${brl(meta)}.` : `Passa a meta em <b>${brl(-diff)}</b>.`}</p>`;
    h += `<div class="kv"><span>Horas no studio</span><span class="num ${okS ? "fits yes" : "fits no"}">${fmtN(r.hS, 1)} de ${fmtN(dS, 0)} h</span></div>`;
    h += `<div class="kv"><span>Horas em home care</span><span class="num ${okH ? "" : "fits no"}">${fmtN(r.hH, 1)} de ${fmtN(dH, 0)} h</span></div>`;
    if (r.turmas) h += `<div class="kv"><span>Turmas de pilates no m\xEAs</span><span class="num">${r.turmas} (~${fmtN(r.turmas / SEMANAS, 1)} por semana)</span></div>`;
    const avisos = [];
    if (!okS) avisos.push(`O plano precisa de ${fmtN(r.hS - dS, 1)} h a mais do que seus hor\xE1rios no studio permitem. Reduza quantidades, amplie hor\xE1rios ou troque por op\xE7\xF5es que rendem mais por hora.`);
    if (!okH) avisos.push(dH ? `Home care passa em ${fmtN(r.hH - dH, 1)} h o hor\xE1rio cadastrado.` : `Voc\xEA colocou atendimentos em home care, mas n\xE3o tem hor\xE1rio de home care cadastrado em Configura\xE7\xF5es.`);
    for (const sid in r.seats) {
      const s = serv(sid);
      const vagas = r.seats[sid];
      const ocup = vagas / (Math.ceil(vagas / cap - 1e-9) * cap);
      if (ocup < 0.75 && vagas > 0) avisos.push(`As turmas de ${esc((s == null ? void 0 : s.nome) || "pilates")} ficariam com ${fmtN(ocup * 100, 0)}% das vagas ocupadas. Encaixar alunos em turmas j\xE1 existentes rende mais do que abrir turma nova.`);
    }
    if (avisos.length) h += `<ul class="sugg">${avisos.map((a) => `<li>${a}</li>`).join("")}</ul>`;
    if (diff > 0 && meta) {
      const livreS = Math.max(0, dS - r.hS), livreH = Math.max(0, dH - r.hH);
      const cands = opcoes().filter((o) => o.liq > 0 && (o.tipo !== "home" || dH > 0)).map((o) => {
        const n = Math.ceil(diff / o.liq), hrs = n * o.horasUnid, livre = o.tipo === "home" ? livreH : livreS;
        return { o, n, hrs, cabe: hrs <= livre + 1e-9 };
      }).sort((a, b) => b.cabe - a.cabe || b.o.liqHora - a.o.liqHora).slice(0, 4);
      h += `<h2 style="margin-top:18px;font-size:15px">Para fechar a diferen\xE7a</h2><ul class="sugg">` + cands.map(({ o, n, hrs, cabe }) => {
        const u = o.key.startsWith("p:") ? `${n} aluno${n > 1 ? "s" : ""} no ${esc(o.nome)}` : `${n} ${o.unid === "check-in" ? "check-ins" : o.unid === "aula-aluno" ? "alunos-aula" : o.unid === "aula" ? "aulas" : "atendimentos"} de ${esc(o.nome)}`;
        return `<li>${u}, cerca de ${fmtN(hrs, 1)} h. <span class="fits ${cabe ? "yes" : "no"}">${cabe ? "Cabe no tempo livre." : "N\xE3o cabe no tempo livre."}</span></li>`;
      }).join("") + `</ul>`;
    }
    el.innerHTML = h;
  }
  function simDaAgenda() {
    var _a;
    const mk = S.mesMeta, m = S.months[mk];
    if (!m) return;
    const sim = {};
    const inc = (k, n = 1) => sim[k] = (sim[k] || 0) + n;
    for (const a of m.atendimentos) {
      if (livreSt(a.status) || a.status === "falta" || a.cobranca === "plano") continue;
      if (a.cobranca === "app") {
        const id = a.appId || ((_a = pacBy(a.pacienteId)) == null ? void 0 : _a.appId);
        if (id && appBy(id)) {
          inc("a:" + id);
          continue;
        }
      }
      if (serv(a.servicoId)) inc((tipoLocal(a.localId) === "home" ? "h:" : "s:") + a.servicoId);
    }
    for (const it of mensalidadesDoMes(mk)) if (it.plano) inc("p:" + it.plano.id);
    S.config.simulacao = sim;
    save("config");
    render();
  }
  function vConfig() {
    const c = S.config;
    if (!perm("config")) return head("Minha conta", "") + painelConta();
    const localOpts = (sel) => c.locais.map((l) => `<option value="${l.id}" ${l.id === sel ? "selected" : ""}>${esc(l.nome)}</option>`).join("");
    const servOpts = (sel) => c.servicos.map((s) => `<option value="${s.id}" ${s.id === sel ? "selected" : ""}>${esc(s.nome)}</option>`).join("");
    let h = head("Configura\xE7\xF5es", "Tudo o que muda aqui passa a valer para novos agendamentos e para os c\xE1lculos.");
    h += `<div class="stack">`;
    h += `<section class="panel"><h2>Identifica\xE7\xE3o</h2><p class="sub">Aparece no topo do sistema.</p><div class="row" style="align-items:flex-start;gap:18px"><div class="logo-prev">${markHTML(c)}</div><div class="grid2 grow">
    <label class="f">Nome<input value="${esc(c.perfil.nome)}" data-cfg="perfil.nome" data-rerender="1"></label>
    <label class="f">Profiss\xE3o<input value="${esc(c.perfil.titulo)}" data-cfg="perfil.titulo" data-rerender="1"></label>
    <label class="f">CREFITO<input value="${esc(c.perfil.crefito)}" data-cfg="perfil.crefito" data-rerender="1" placeholder="Ex.: 123456-F"></label>
    <div class="f"><span class="small muted">Logo pr\xF3prio (opcional)</span><div class="row"><label class="btn small" style="cursor:pointer">Enviar imagem<input type="file" accept="image/*" id="logo-in" hidden></label>${c.perfil.logo ? '<button class="btn small ghost danger" data-act="logo-rm">Usar emblema padr\xE3o</button>' : ""}</div></div>
  </div></div></section>`;
    h += `<section class="panel"><div class="row"><h2 class="grow">Locais de atendimento</h2><button class="btn small" data-act="add-local">+ Local</button></div><p class="sub">Cadastre todos os lugares onde voc\xEA atende. Eles aparecem no agendamento e nos hor\xE1rios.</p><div class="cfg-list">`;
    c.locais.forEach((l, i) => {
      h += `<div class="cfg-item"><label class="f" style="grid-column:span 2">Nome do local<input value="${esc(l.nome)}" data-cfg="locais.${i}.nome"></label><label class="f">Tipo<select data-cfg="locais.${i}.tipo"><option value="studio" ${l.tipo !== "home" ? "selected" : ""}>Studio, cl\xEDnica ou consult\xF3rio</option><option value="home" ${l.tipo === "home" ? "selected" : ""}>Home care (na casa do paciente)</option></select></label>${c.locais.length > 1 ? `<button class="btn small ghost danger" data-act="rm" data-arr="locais" data-i="${i}">Remover</button>` : ""}</div>`;
    });
    h += `</div><label class="f" style="max-width:300px;margin-top:12px">Custo de deslocamento por atendimento em home care (R$)<input type="number" step="0.01" value="${c.deslocamentoHome}" data-cfg="deslocamentoHome" data-type="num"></label></section>`;
    h += `<section class="panel"><div class="row"><h2 class="grow">Servi\xE7os e valores</h2><button class="btn small" data-act="add-serv">+ Servi\xE7o</button></div>${c.servicos.length ? "" : '<div class="empty" style="margin-bottom:10px">Nenhum servi\xE7o cadastrado. Ex.: Pilates, Pilates personal, Libera\xE7\xE3o miofascial, Drenagem.</div>'}<p class="sub">Aqui fica s\xF3 o valor e a dura\xE7\xE3o padr\xE3o. Aluguel da sala, nota fiscal e aplicativo s\xE3o escolhidos em cada agendamento.</p><label class="f" style="max-width:320px;margin-bottom:12px">Anteced\xEAncia m\xEDnima para desmarcar sem pagar (horas)<input type="number" min="0" step="0.5" value="${limiteDesm()}" data-cfg="antecedenciaDesmarcar" data-type="num" data-rerender="1"></label><p class="small muted" style="margin:-6px 0 12px">Nos servi\xE7os com \u201CRegra de desmarca\xE7\xE3o\u201D, ao clicar em Desmarcou o sistema pergunta se foi com essa anteced\xEAncia: Sim, tem direito a remarcar; N\xE3o, fica como falta e a aula \xE9 cobrada. J\xE1 vem marcada nos servi\xE7os com Pilates ou Personal no nome.</p><div class="cfg-list">`;
    c.servicos.forEach((s, i) => {
      h += `<div class="cfg-item">
    <label class="f" style="grid-column:span 2">Nome<input value="${esc(s.nome)}" data-cfg="servicos.${i}.nome"></label>
    <label class="f">Valor padr\xE3o (R$)<input type="number" step="0.01" value="${s.valor}" data-cfg="servicos.${i}.valor" data-type="num"></label>
    <label class="f">Dura\xE7\xE3o (min)<input type="number" step="5" value="${s.duracao}" data-cfg="servicos.${i}.duracao" data-type="num"></label>
    <label class="check" style="grid-column:span 2"><input type="checkbox" ${regraDesm(s) ? "checked" : ""} data-cfg="servicos.${i}.regraDesmarcacao">Regra de desmarca\xE7\xE3o (${fmtN(limiteDesm(), 1)} h)</label>
    <label class="check"><input type="checkbox" ${s.ativo !== false ? "checked" : ""} data-cfg="servicos.${i}.ativo">Ativo</label>
    <label class="f">Cor<input type="color" value="${esc(s.cor || "#15847D")}" data-cfg="servicos.${i}.cor"></label>
    <button class="btn small ghost danger" data-act="rm" data-arr="servicos" data-i="${i}">Remover</button></div>`;
    });
    h += `</div></section>`;
    h += `<section class="panel"><div class="row"><h2 class="grow">Formas de pagamento</h2><button class="btn small" data-act="add-forma">+ Forma</button></div><p class="sub">Aparecem no agendamento. Marque \u201CRepasse da cl\xEDnica\u201D nas formas em que quem paga \xE9 a cl\xEDnica: esses atendimentos entram em \u201CA receber da cl\xEDnica\u201D.</p><div class="cfg-list">`;
    formasCfg().forEach((f, i) => {
      h += `<div class="cfg-item"><label class="f" style="grid-column:span 2">Nome<input value="${esc(f.nome)}" data-forma="${i}" data-campo="nome"></label><label class="check"><input type="checkbox" ${f.repasse ? "checked" : ""} data-forma="${i}" data-campo="repasse">Repasse da cl\xEDnica</label><button class="btn small ghost danger" data-act="rm-forma" data-i="${i}">Remover</button></div>`;
    });
    h += `</div></section>`;
    h += `<section class="panel"><div class="row"><h2 class="grow">Aplicativos (TotalPass, Wellhub e outros)</h2><button class="btn small" data-act="add-app">+ Aplicativo</button></div><p class="sub">Informe quanto voc\xEA recebe por check-in. O valor s\xF3 \xE9 usado quando, no agendamento, \u201CAplicativo\u201D estiver marcado.</p><div class="cfg-list">`;
    c.apps.forEach((a, i) => {
      h += `<div class="cfg-item"><label class="f" style="grid-column:span 2">Nome<input value="${esc(a.nome)}" data-cfg="apps.${i}.nome"></label><label class="f">Valor por check-in (R$)<input type="number" step="0.01" value="${a.valor}" data-cfg="apps.${i}.valor" data-type="num"></label><button class="btn small ghost danger" data-act="rm" data-arr="apps" data-i="${i}">Remover</button></div>`;
    });
    h += `</div></section>`;
    h += `<section class="panel"><h2>Hor\xE1rios de atendimento</h2><p class="sub">Define os hor\xE1rios livres na agenda e o tempo dispon\xEDvel no m\xF3dulo de metas.</p>
    <div class="grid2" style="max-width:520px;margin-bottom:8px"><label class="f">Dura\xE7\xE3o do atendimento (min)<input type="number" min="10" step="5" value="${durPadrao()}" data-cfg="duracaoAtendimento" data-type="num"></label><label class="f">Intervalo para organiza\xE7\xE3o (min)<input type="number" min="0" step="5" value="${intervalo()}" data-cfg="intervaloAgenda" data-type="num"></label></div><p class="small muted" style="margin:0 0 8px">A agenda abre hor\xE1rios a cada ${durPadrao() + intervalo()} min (${durPadrao()} de atendimento + ${intervalo()} de organiza\xE7\xE3o). O intervalo n\xE3o fica dispon\xEDvel para agendamento.</p>`;
    for (const wd of WEEK_ORDER) {
      const ws = c.disponibilidade[wd] || [];
      h += `<div class="win"><b>${DIAS[wd]}</b><div class="win-rows">${ws.length ? "" : '<span class="small muted">N\xE3o atende</span>'}${ws.map((w, i) => `<div class="win-row"><select data-cfg="disponibilidade.${wd}.${i}.localId" aria-label="Local">${localOpts(w.localId)}</select><input type="time" value="${w.inicio}" data-cfg="disponibilidade.${wd}.${i}.inicio" aria-label="In\xEDcio"><input type="time" value="${w.fim}" data-cfg="disponibilidade.${wd}.${i}.fim" aria-label="Fim"><button class="iconbtn" data-act="rm-win" data-wd="${wd}" data-i="${i}" aria-label="Remover hor\xE1rio">\xD7</button></div>`).join("")}<div><button class="linkbtn small" data-act="add-win" data-wd="${wd}">+ hor\xE1rio</button></div></div></div>`;
    }
    h += `</section>`;
    h += `<section class="panel"><h2>Apar\xEAncia</h2><div class="seg">${[["auto", "Autom\xE1tico"], ["light", "Claro"], ["dark", "Escuro"]].map(([k, l]) => `<button data-act="tema" data-t="${k}" aria-pressed="${(c.tema || "auto") === k}">${l}</button>`).join("")}</div><p class="small muted" style="margin:12px 0 0">${"Seus dados ficam salvos na pasta \u201CSistema Rafa Fisio - Dados\u201D do Google Drive."}</p></section>`;
    if (isAdmin()) h += `<section class="panel"><h2>Recome\xE7ar do zero</h2><p class="sub">Apaga pacientes, agenda, recebimentos, carteira e configura\xE7\xF5es. N\xE3o d\xE1 para desfazer.</p><button class="btn danger" data-act="reset-all">Apagar todos os dados</button></section>`;
    h += painelConta() + (isAdmin() ? painelUsuarios() : "");
    h += `</div>`;
    return h;
  }
  function applyTheme() {
    var _a;
    const t = ((_a = S.config) == null ? void 0 : _a.tema) || "auto";
    if (t === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  }
  const CATS = [
    ["moradia", "Moradia (aluguel, financiamento, condom\xEDnio)", "ess"],
    ["contas", "Contas da casa (luz, \xE1gua, g\xE1s, internet, celular)", "ess"],
    ["mercado", "Mercado", "ess"],
    ["combustivel", "Combust\xEDvel", "ess"],
    ["moto", "Moto (parcela, seguro, manuten\xE7\xE3o)", "ess"],
    ["carro", "Carro (parcela, seguro, manuten\xE7\xE3o)", "ess"],
    ["transporte", "Transporte (app, \xF4nibus, estacionamento)", "ess"],
    ["saude", "Sa\xFAde (plano, farm\xE1cia, consultas)", "ess"],
    ["impostos", "Impostos e taxas (DAS/MEI, IPVA, licenciamento)", "ess"],
    ["trabalho", "Trabalho (materiais, conselho, cursos)", "ess"],
    ["educacao", "Educa\xE7\xE3o", "ess"],
    ["filhos", "Filhos e fam\xEDlia", "ess"],
    ["dividas", "Empr\xE9stimos e acordos de d\xEDvida", "div"],
    ["vestuario", "Vestu\xE1rio e cal\xE7ados", "est"],
    ["alimentacao", "Alimenta\xE7\xE3o fora e delivery", "est"],
    ["beleza", "Beleza e cuidados pessoais", "est"],
    ["lazer", "Lazer e viagens", "est"],
    ["assinaturas", "Assinaturas (streaming, apps, academia)", "est"],
    ["casa", "Casa (m\xF3veis, utens\xEDlios, reformas)", "est"],
    ["pets", "Pets", "est"],
    ["presentes", "Presentes e doa\xE7\xF5es", "est"],
    ["investimentos", "Reserva e investimentos", "fut"],
    ["outros", "Outros", "est"]
  ];
  const GRUPOS = { ess: ["Essenciais", 55, "at\xE9 55%"], est: ["Estilo de vida", 25, "at\xE9 25%"], div: ["D\xEDvidas", 10, "at\xE9 10%"], fut: ["Reserva e investimentos", 20, "20% ou mais"] };
  const catBy = (k) => CATS.find((c) => c[0] === k) || CATS[CATS.length - 1];
  const catOpts = (sel) => Object.keys(GRUPOS).map((g) => `<optgroup label="${GRUPOS[g][0]}">${CATS.filter((c) => c[2] === g).map((c) => `<option value="${c[0]}" ${c[0] === sel ? "selected" : ""}>${esc(c[1])}</option>`).join("")}</optgroup>`).join("");
  const cartaoBy = (id) => S.fin.cartoes.find((c) => c.id === id);
  const formaOpts = (sel) => `<option value="conta" ${!sel || sel === "conta" ? "selected" : ""}>Pix, d\xE9bito, dinheiro ou boleto</option>` + S.fin.cartoes.map((c) => `<option value="${c.id}" ${c.id === sel ? "selected" : ""}>Cart\xE3o ${esc(c.nome)}</option>`).join("");
  const formaNome = (f) => {
    var _a;
    return !f || f === "conta" ? "Conta" : "Cart\xE3o " + (((_a = cartaoBy(f)) == null ? void 0 : _a.nome) || "removido");
  };
  function defaultFin() {
    return { fixas: [], rendas: [], cartoes: [], reserva: 0, capacidade: null, estrategia: "avalanche", usarPrevistos: false };
  }
  function mergeFin(f) {
    const d = defaultFin();
    if (!f) return d;
    const o = __spreadValues(__spreadValues({}, d), f);
    ["fixas", "rendas", "cartoes"].forEach((k) => {
      if (!Array.isArray(o[k])) o[k] = [];
    });
    return o;
  }
  const obj = (x) => x && typeof x === "object" && !Array.isArray(x) ? x : {};
  const normFM = (d) => ({ saidas: Array.isArray(d == null ? void 0 : d.saidas) ? d.saidas : [], entradas: Array.isArray(d == null ? void 0 : d.entradas) ? d.entradas : [], fixas: obj(d == null ? void 0 : d.fixas), rendas: obj(d == null ? void 0 : d.rendas), faturas: obj(d == null ? void 0 : d.faturas) });
  const loadingF = {};
  function ensureFM(mk) {
    if (S.fmonths[mk]) return Promise.resolve(S.fmonths[mk]);
    if (!loadingF[mk]) loadingF[mk] = Store.get("f-" + mk).then((d) => {
      S.fmonths[mk] = normFM(d);
      return S.fmonths[mk];
    }).catch(() => {
      S.fmonths[mk] = __spreadProps(__spreadValues({}, normFM(null)), { _err: true });
      return S.fmonths[mk];
    });
    return loadingF[mk];
  }
  function FM(mk) {
    if (S.fmonths[mk]) return S.fmonths[mk];
    if (!aguardaF.has(mk)) {
      aguardaF.add(mk);
      ensureFM(mk).then(() => {
        aguardaF.delete(mk);
        render();
      });
    }
    return null;
  }
  const vigente = (x, mk) => (!x.inicio || x.inicio <= mk) && (!x.fim || mk <= x.fim);
  const mDiff = (a, b) => {
    const [ay, am] = a.split("-").map(Number), [by, bm] = b.split("-").map(Number);
    return (by - ay) * 12 + (bm - am);
  };
  function mesPagamento(iso, card) {
    const f = num(card.fechamento) || 1, v = num(card.vencimento) || 10, mk = mkOf(iso);
    const fech = parseISO(iso).getDate() < f ? mk : addMonth(mk, 1);
    return v > f ? fech : addMonth(fech, 1);
  }
  function parcelasMes(card, mk) {
    let t = 0;
    for (const p of card.parcelamentos || []) {
      if (!p.primeira) continue;
      const i = mDiff(p.primeira, mk);
      if (i >= 0 && i < num(p.total)) t += num(p.valor);
    }
    return t;
  }
  function parcelasFuturas(card, mk) {
    let t = 0;
    for (const p of card.parcelamentos || []) {
      if (!p.primeira) continue;
      const feitas = Math.max(0, mDiff(p.primeira, mk) + 1);
      t += Math.max(0, num(p.total) - feitas) * num(p.valor);
    }
    return t;
  }
  function ultimaParcela() {
    let last = "";
    for (const c of S.fin.cartoes) for (const p of c.parcelamentos || []) {
      if (!p.primeira) continue;
      const m = addMonth(p.primeira, num(p.total) - 1);
      if (m > last) last = m;
    }
    return last;
  }
  function faturaEstimada(card, mk) {
    var _a, _b;
    let compras = 0;
    for (let k = -2; k <= 0; k++) {
      const x = addMonth(mk, k), fm = S.fmonths[x];
      if (fm) {
        for (const s of fm.saidas) if (s.forma === card.id && mesPagamento(s.data, card) === mk) compras += num(s.valor);
      }
      for (const f of S.fin.fixas) if (f.forma === card.id && vigente(f, x)) {
        const d = x + "-" + pad(Math.min(28, num(f.dia) || 1));
        if (mesPagamento(d, card) === mk) compras += num((_b = (_a = fm == null ? void 0 : fm.fixas[f.id]) == null ? void 0 : _a.valor) != null ? _b : f.valor);
      }
    }
    const parc = parcelasMes(card, mk);
    return { valor: compras + parc, compras, parc };
  }
  function fatura(card, mk) {
    var _a, _b;
    const e = (_b = (_a = S.fmonths[mk]) == null ? void 0 : _a.faturas) == null ? void 0 : _b[card.id];
    const est = faturaEstimada(card, mk);
    const inf = e && e.valor != null && e.valor !== "";
    return { valor: inf ? num(e.valor) : est.valor, informada: inf, pago: !!(e == null ? void 0 : e.pago), est };
  }
  function dividaCartao(card, mk) {
    const f = fatura(card, mk);
    return num(card.rotativo) + (f.pago ? 0 : f.valor) + parcelasFuturas(card, mk);
  }
  function saudeCartao(card, mk) {
    const d = dividaCartao(card, mk), lim = num(card.limite), uso = lim ? d / lim : 0;
    if (num(card.rotativo) > 0) return { uso, d, nivel: "bad", txt: "Cr\xEDtico: d\xEDvida no rotativo" };
    if (uso > 0.7) return { uso, d, nivel: "bad", txt: "Cr\xEDtico: limite quase todo usado" };
    if (uso > 0.3) return { uso, d, nivel: "warn", txt: "Aten\xE7\xE3o" };
    return { uso, d, nivel: "ok", txt: "Saud\xE1vel" };
  }
  function fluxo(mk) {
    var _a, _b, _c, _d;
    const fm = S.fmonths[mk] || normFM(null), fin = S.fin;
    const exM = S.months[mk] ? extrato(mk) : null, pvM = exM && fin.usarPrevistos ? previstoDoMes(mk) : null;
    const atend = exM ? exM.total + (pvM ? pvM.repasse + pvM.devendoTot + pvM.confirmarTot + pvM.futuroTot : 0) : 0;
    let rendas = 0;
    for (const r of fin.rendas) if (vigente(r, mk)) rendas += num((_b = (_a = fm.rendas[r.id]) == null ? void 0 : _a.valor) != null ? _b : r.valor);
    const extras = fm.entradas.reduce((s, e) => s + num(e.valor), 0);
    const E = atend + rendas + extras;
    const porCat = {}, add = (c, v) => {
      if (v) porCat[c] = (porCat[c] || 0) + v;
    };
    let conta = 0, fixasTot = 0, parcTot = 0;
    for (const f of fin.fixas) if (vigente(f, mk)) {
      const v = num((_d = (_c = fm.fixas[f.id]) == null ? void 0 : _c.valor) != null ? _d : f.valor);
      add(f.categoria, v);
      fixasTot += v;
      if (!f.forma || f.forma === "conta") conta += v;
    }
    for (const s of fm.saidas) {
      add(s.categoria, num(s.valor));
      if (!s.forma || s.forma === "conta") conta += num(s.valor);
    }
    let faturas = 0, rotativo = 0, limite = 0, divida = 0;
    for (const c of fin.cartoes) {
      for (const p of c.parcelamentos || []) {
        if (!p.primeira) continue;
        const i = mDiff(p.primeira, mk);
        if (i >= 0 && i < num(p.total)) {
          add(p.categoria || "outros", num(p.valor));
          parcTot += num(p.valor);
        }
      }
      faturas += fatura(c, mk).valor;
      rotativo += num(c.rotativo);
      limite += num(c.limite);
      divida += dividaCartao(c, mk);
    }
    const grupos = { ess: 0, est: 0, div: 0, fut: 0 };
    for (const k in porCat) grupos[catBy(k)[2]] += porCat[k];
    const saidas = conta + faturas;
    return { E, atend, rendas, extras, conta, faturas, saidas, saldo: E - saidas, porCat, grupos, gastos: Object.values(porCat).reduce((a, b) => a + b, 0), fixasTot, parcTot, rotativo, limite, divida };
  }
  function saude(f) {
    const E = f.E, ind = [];
    let pts = 0;
    const pct = (x) => E > 0 ? x / E : 0;
    const sobra = pct(f.saldo);
    const sP = E <= 0 ? 0 : sobra >= 0.2 ? 30 : sobra >= 0.1 ? 20 : sobra >= 0 ? 10 : 0;
    pts += sP;
    ind.push({ nome: "Sobra do m\xEAs", val: E ? fmtN(sobra * 100, 0) + "%" : "\u2014", meta: "20% ou mais das entradas", nivel: sP >= 20 ? "ok" : sP >= 10 ? "warn" : "bad", txt: f.saldo >= 0 ? `Sobram ${brl(f.saldo)}` : `Faltam ${brl(-f.saldo)}` });
    const ess = pct(f.grupos.ess);
    const eP = E <= 0 ? 0 : ess <= 0.55 ? 20 : ess <= 0.65 ? 14 : ess <= 0.75 ? 7 : 0;
    pts += eP;
    ind.push({ nome: "Gastos essenciais", val: E ? fmtN(ess * 100, 0) + "%" : "\u2014", meta: "at\xE9 55% das entradas", nivel: eP >= 14 ? eP === 20 ? "ok" : "warn" : "bad", txt: brl(f.grupos.ess) });
    const div = pct(f.parcTot + f.grupos.div - 0 * 1);
    const dRaw = f.parcTot + (f.porCat.dividas || 0);
    const dv = pct(dRaw);
    const dP = E <= 0 ? 0 : f.rotativo > 0 ? 0 : dv <= 0.1 ? 20 : dv <= 0.2 ? 14 : dv <= 0.3 ? 7 : 0;
    pts += dP;
    ind.push({ nome: "Comprometido com d\xEDvidas", val: E ? fmtN(dv * 100, 0) + "%" : "\u2014", meta: "at\xE9 10%, nunca acima de 30%", nivel: dP >= 14 ? dP === 20 ? "ok" : "warn" : "bad", txt: (f.rotativo > 0 ? `Rotativo de ${brl(f.rotativo)} \xB7 ` : "") + `${brl(dRaw)} em parcelas e empr\xE9stimos no m\xEAs` });
    const uso = f.limite ? f.divida / f.limite : 0;
    const uP = !S.fin.cartoes.length ? 15 : uso <= 0.3 ? 15 : uso <= 0.5 ? 10 : uso <= 0.7 ? 5 : 0;
    pts += uP;
    ind.push({ nome: "Uso do limite dos cart\xF5es", val: S.fin.cartoes.length ? fmtN(uso * 100, 0) + "%" : "\u2014", meta: "at\xE9 30% do limite", nivel: uP >= 15 ? "ok" : uP >= 5 ? "warn" : "bad", txt: S.fin.cartoes.length ? `${brl(f.divida)} de ${brl(f.limite)}` : "Nenhum cart\xE3o cadastrado" });
    const custo = f.grupos.ess + f.parcTot + (f.porCat.dividas || 0);
    const meses = custo > 0 ? num(S.fin.reserva) / custo : 0;
    const rP = meses >= 6 ? 15 : meses >= 3 ? 10 : meses >= 1 ? 5 : 0;
    pts += rP;
    ind.push({ nome: "Reserva de emerg\xEAncia", val: custo > 0 ? fmtN(meses, 1) + " meses" : "\u2014", meta: "6 meses do custo essencial", nivel: rP >= 15 ? "ok" : rP >= 5 ? "warn" : "bad", txt: `${brl(S.fin.reserva)} guardados` });
    const nivel = E <= 0 ? "none" : pts >= 70 ? "ok" : pts >= 40 ? "warn" : "bad";
    return { pts, nivel, ind, label: { ok: "Saud\xE1vel", warn: "Aten\xE7\xE3o", bad: "Cr\xEDtica", none: "Sem dados" }[nivel] };
  }
  function recomendacoes(f, h) {
    const r = [];
    if (f.E <= 0) {
      r.push("Registre suas entradas do m\xEAs (atendimentos realizados e outras rendas) para o sistema avaliar sua sa\xFAde financeira.");
      return r;
    }
    if (f.rotativo > 0) r.push(`Voc\xEA tem ${brl(f.rotativo)} no rotativo, que costuma ter os juros mais altos do mercado. Quitar isso vem antes de qualquer outro objetivo. Vale pedir ao banco o parcelamento da fatura ou comparar com um empr\xE9stimo pessoal de juros menores.`);
    if (f.saldo < 0) {
      const top = Object.entries(f.porCat).filter(([k]) => catBy(k)[2] === "est").sort((a, b) => b[1] - a[1]).slice(0, 3);
      r.push(`O m\xEAs fecha negativo em ${brl(-f.saldo)}.${top.length ? " Os maiores gastos de estilo de vida foram " + top.map(([k, v]) => catBy(k)[1].split(" (")[0].toLowerCase() + " (" + brl(v) + ")").join(", ") + ". \xC9 por a\xED que o corte costuma ter menos impacto." : ""}`);
    }
    if (f.E > 0 && f.grupos.ess / f.E > 0.65) r.push("Os gastos essenciais passam de 65% das entradas. Moradia, ve\xEDculos e combust\xEDvel s\xE3o os que mais pesam normalmente; renegociar ou trocar um deles d\xE1 mais resultado do que cortar v\xE1rios gastos pequenos.");
    const uso = f.limite ? f.divida / f.limite : 0;
    if (uso > 0.5) r.push(`Os cart\xF5es comprometem ${fmtN(uso * 100, 0)}% do limite. Enquanto estiver quitando, evite novas compras parceladas.`);
    const custo = f.grupos.ess + f.parcTot + (f.porCat.dividas || 0);
    if (custo > 0 && num(S.fin.reserva) / custo < 3 && f.rotativo <= 0 && f.saldo > 0) r.push(`Com a sobra de ${brl(f.saldo)}, d\xE1 para montar a reserva. A meta de 6 meses de custo essencial \xE9 ${brl(custo * 6)}.`);
    if (!r.length) r.push("As contas est\xE3o equilibradas. Mantenha a sobra indo para a reserva e para investimentos.");
    return r;
  }
  function simQuit(estr, C, mk0) {
    const cards = S.fin.cartoes.map((c) => {
      const f = fatura(c, mk0);
      return { id: c.id, nome: c.nome, r: num(c.jurosMes) / 100, saldo: num(c.rotativo), fat0: f.pago ? 0 : f.valor, card: c };
    });
    const fim = ultimaParcela();
    const rows = [];
    let juros = 0, deficit = 0;
    for (let m = 0; m < 120; m++) {
      const mk = addMonth(mk0, m);
      for (const c of cards) {
        const j = c.saldo * c.r;
        c.saldo += j;
        juros += j;
      }
      const obrig = cards.map((c) => m === 0 ? c.fat0 : parcelasMes(c.card, mk));
      const totObrig = obrig.reduce((a, b) => a + b, 0);
      let disp = C - totObrig;
      const pag = {};
      cards.forEach((c, i) => pag[c.id] = obrig[i]);
      if (disp < 0) {
        deficit++;
        const falta = -disp;
        cards.forEach((c, i) => {
          const parte = totObrig ? falta * obrig[i] / totObrig : 0;
          c.saldo += parte;
          pag[c.id] -= parte;
        });
        disp = 0;
      }
      const ord = cards.filter((c) => c.saldo > 5e-3).sort(estr === "avalanche" ? (a, b) => b.r - a.r || a.saldo - b.saldo : (a, b) => a.saldo - b.saldo || b.r - a.r);
      for (const c of ord) {
        if (disp <= 0) break;
        const p = Math.min(disp, c.saldo);
        c.saldo -= p;
        disp -= p;
        pag[c.id] += p;
      }
      const saldo = cards.reduce((s, c) => s + c.saldo, 0);
      rows.push({ mk, pag, obrig: totObrig, saldo, sobra: disp });
      if (saldo < 0.01 && (!fim || mk >= fim)) return { meses: m + 1, fim: mk, juros, rows, deficit, ok: true };
    }
    return { meses: 120, juros, rows, deficit, ok: false };
  }
  function vCarteira() {
    const mk = S.mesCart;
    const need = [M(mk), FM(mk), FM(addMonth(mk, -1)), FM(addMonth(mk, -2))];
    if (need.some((x) => !x)) return loadingHTML();
    const tabs = [["resumo", "Resumo"], ["saidas", "Sa\xEDdas"], ["entradas", "Entradas"], ["cartoes", "Cart\xF5es"], ["quitar", "Quitar cart\xF5es"]];
    let h = head("Carteira", `Suas finan\xE7as pessoais em ${mesLabel(mk)}`, `<button class="iconbtn" data-act="mes-cart" data-n="-1" aria-label="M\xEAs anterior">\u2039</button><button class="iconbtn" data-act="mes-cart" data-n="1" aria-label="Pr\xF3ximo m\xEAs">\u203A</button>`);
    h += `<div class="seg" style="margin-bottom:18px">${tabs.map(([k, l]) => `<button data-act="cart-tab" data-t="${k}" aria-pressed="${S.cartTab === k}">${l}</button>`).join("")}</div>`;
    const f = fluxo(mk);
    h += ({ resumo: tResumo, saidas: tSaidas, entradas: tEntradas, cartoes: tCartoes, quitar: tQuitar }[S.cartTab] || tResumo)(mk, f);
    return h;
  }
  function ring(p, nivel) {
    const r = 46, c = 2 * Math.PI * r, col = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)", none: "var(--line)" }[nivel];
    return `<svg viewBox="0 0 110 110" width="120" height="120" aria-hidden="true"><circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--mint-2)" stroke-width="11"/><circle cx="55" cy="55" r="${r}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${c * p / 100} ${c}" transform="rotate(-90 55 55)"/><text x="55" y="61" text-anchor="middle" font-size="26" font-weight="800" fill="currentColor">${nivel === "none" ? "\u2014" : Math.round(p)}</text></svg>`;
  }
  const nb = (n) => ({ ok: "b-ok", warn: "b-warn", bad: "b-bad" })[n] || "";
  function tResumo(mk, f) {
    var _a;
    const hs = saude(f);
    let h = `<div class="cols"><section class="panel"><div class="row" style="gap:20px;align-items:center"><div style="color:var(--ink)">${ring(hs.pts, hs.nivel)}</div><div class="grow"><h2>Sa\xFAde financeira: ${hs.label}</h2><p class="sub" style="margin:0">Nota de 0 a 100, pela sobra do m\xEAs, peso dos gastos essenciais, d\xEDvidas, uso dos cart\xF5es e reserva.</p></div></div>
    <div class="cols-even" style="margin-top:16px;gap:12px">
      <div><div class="small muted">Entradas</div><div class="mid">${brl(f.E)}</div></div>
      <div><div class="small muted">Sa\xEDdas do caixa</div><div class="mid">${brl(f.saidas)}</div></div>
      <div><div class="small muted">Saldo do m\xEAs</div><div class="mid" style="color:${f.saldo < 0 ? "var(--bad)" : "var(--ok)"}">${brl(f.saldo)}</div></div>
    </div><p class="small muted" style="margin:10px 0 0">Sa\xEDdas do caixa = contas pagas em Pix, d\xE9bito, dinheiro ou boleto + faturas dos cart\xF5es deste m\xEAs.</p></section>
    <section class="panel"><h2>O que fazer agora</h2><ul class="sugg">${recomendacoes(f, hs).map((x) => `<li>${x}</li>`).join("")}</ul></section></div>`;
    h += `<section class="panel" style="margin-top:18px"><h2>Indicadores</h2><div class="scroll"><table class="tbl"><thead><tr><th>Indicador</th><th class="n">Hoje</th><th>Refer\xEAncia</th><th></th></tr></thead><tbody>${hs.ind.map((i) => `<tr><td><b>${i.nome}</b><br><span class="small muted">${i.txt}</span></td><td class="n"><b>${i.val}</b></td><td class="small muted">${i.meta}</td><td class="n"><span class="badge ${nb(f.E > 0 || i.nome.startsWith("Uso") ? i.nivel : "")}">${f.E > 0 || i.nome.startsWith("Uso") ? { ok: "Bom", warn: "Aten\xE7\xE3o", bad: "Cr\xEDtico" }[i.nivel] : "\u2014"}</span></td></tr>`).join("")}</tbody></table></div></section>`;
    const cats = Object.entries(f.porCat).sort((a, b) => b[1] - a[1]);
    const mx = ((_a = cats[0]) == null ? void 0 : _a[1]) || 1;
    h += `<div class="cols-even" style="margin-top:18px"><section class="panel"><h2>Para onde foi o dinheiro</h2><p class="sub">Todos os gastos do m\xEAs, inclusive os feitos no cart\xE3o e as parcelas: ${brl(f.gastos)}.</p>${cats.length ? cats.map(([k, v]) => `<div style="margin:8px 0"><div class="row small"><span class="grow">${esc(catBy(k)[1].split(" (")[0])}</span><b class="num">${brl(v)}</b><span class="muted num" style="width:44px;text-align:right">${f.gastos ? fmtN(v / f.gastos * 100, 0) : 0}%</span></div><div class="bar" style="height:8px"><i class="a" style="width:${v / mx * 100}%"></i></div></div>`).join("") : '<div class="empty">Nenhum gasto lan\xE7ado neste m\xEAs.</div>'}</section>
    <section class="panel"><h2>Divis\xE3o das entradas</h2><p class="sub">Quanto de cada R$ 100 que entram vai para cada grupo.</p>${Object.entries(GRUPOS).map(([g, [nome, ideal, tx]]) => {
      const v = f.grupos[g], p = f.E ? v / f.E * 100 : 0;
      const ok = g === "fut" ? p >= ideal : p <= ideal;
      return `<div style="margin:10px 0"><div class="row small"><b class="grow">${nome}</b><span class="num">${brl(v)} \xB7 ${fmtN(p, 0)}%</span></div><div class="bar" style="height:8px"><i class="${ok ? "a" : "over"}" style="width:${Math.min(100, p)}%"></i></div><div class="small muted">Refer\xEAncia: ${tx}</div></div>`;
    }).join("")}</section></div>`;
    h += `<section class="panel" style="margin-top:18px"><h2>\xDAltimos 6 meses</h2><p class="sub">Entradas e sa\xEDdas do caixa.</p>${evolucao(mk)}</section>`;
    return h;
  }
  function evolucao(mk) {
    const ms = [...Array(6)].map((_, i) => addMonth(mk, i - 5));
    const faltam = ms.flatMap((m) => [M(m), FM(m), FM(addMonth(m, -1)), FM(addMonth(m, -2))]).some((x) => !x);
    if (faltam) return loadingHTML();
    const data = ms.map((m) => ({ m, f: fluxo(m) }));
    const mx = Math.max(1, ...data.map((d) => Math.max(d.f.E, d.f.saidas)));
    return `<div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;align-items:end;height:170px">${data.map((d) => `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end"><div style="display:flex;gap:3px;align-items:flex-end;height:120px;width:100%;justify-content:center"><i title="Entradas ${brl(d.f.E)}" style="display:block;width:38%;max-width:22px;background:var(--teal);border-radius:4px 4px 0 0;height:${d.f.E / mx * 100}%"></i><i title="Sa\xEDdas ${brl(d.f.saidas)}" style="display:block;width:38%;max-width:22px;background:var(--warn);opacity:.75;border-radius:4px 4px 0 0;height:${d.f.saidas / mx * 100}%"></i></div><span class="small muted">${MESES[+d.m.slice(5) - 1].slice(0, 3)}</span><span class="small num" style="color:${d.f.saldo < 0 ? "var(--bad)" : "var(--ok)"}">${fmtN(d.f.saldo, 0)}</span></div>`).join("")}</div><div class="legend"><span>Entradas</span><span style="--x:1" class="ls">Sa\xEDdas</span></div>`;
  }
  function tSaidas(mk, f) {
    const fm = S.fmonths[mk];
    const d0 = mkOf(today()) === mk ? today() : mk + "-01";
    let h = `<section class="panel"><h2>Lan\xE7ar gasto</h2><p class="sub">Gastos do dia a dia. Contas que se repetem todo m\xEAs ficam em \u201CContas fixas\u201D, logo abaixo.</p><div class="grid2">
    <label class="f">Data<input type="date" id="s-data" value="${d0}"></label>
    <label class="f">Descri\xE7\xE3o<input id="s-desc" placeholder="Ex.: Mercado do m\xEAs"></label>
    <label class="f">Categoria<select id="s-cat">${catOpts("mercado")}</select></label>
    <label class="f">Valor (R$)<input type="number" step="0.01" inputmode="decimal" id="s-val"></label>
    <label class="f">Como pagou<select id="s-forma">${formaOpts("conta")}</select></label>
    <div class="f" style="justify-content:flex-end"><button class="btn primary" data-act="add-saida">Lan\xE7ar gasto</button></div></div><p class="note small" id="s-msg" style="margin:10px 0 0"></p></section>`;
    const fixas = S.fin.fixas.filter((x) => vigente(x, mk)).sort((a, b) => num(a.dia) - num(b.dia));
    h += `<section class="panel" style="margin-top:18px"><div class="row"><h2 class="grow">Contas fixas</h2><button class="btn small" data-act="nova-fixa">+ Conta fixa</button></div><p class="sub">Moradia, contas da casa, parcela do carro ou da moto, plano de sa\xFAde, assinaturas\u2026 Cadastre uma vez e elas aparecem todo m\xEAs. Ajuste o valor quando mudar.</p>`;
    h += fixas.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>Conta</th><th>Vence</th><th>Valor no m\xEAs</th><th></th></tr></thead><tbody>${fixas.map((x) => {
      var _a;
      const e = fm.fixas[x.id] || {};
      const cartao = x.forma && x.forma !== "conta";
      return `<tr><td><button class="linkbtn" data-act="edit-fixa" data-id="${x.id}">${esc(x.nome)}</button><br><span class="small muted">${esc(catBy(x.categoria)[1].split(" (")[0])} \xB7 ${esc(formaNome(x.forma))}</span></td><td class="num">dia ${num(x.dia) || "\u2014"}</td><td style="width:130px"><input type="number" step="0.01" value="${num((_a = e.valor) != null ? _a : x.valor)}" data-fixval="${x.id}" aria-label="Valor de ${esc(x.nome)}"></td><td class="n">${cartao ? '<span class="small muted">vai na fatura</span>' : `<button class="btn small ${e.pago ? "ok" : ""}" data-act="fixa-pagar" data-id="${x.id}">${e.pago ? "\u2713 Paga" : "Marcar paga"}</button>`}</td></tr>`;
    }).join("")}</tbody></table></div>` : '<div class="empty">Nenhuma conta fixa cadastrada.</div>';
    h += `</section>`;
    const list = [...fm.saidas].sort((a, b) => b.data.localeCompare(a.data));
    h += `<section class="panel" style="margin-top:18px"><div class="row"><h2 class="grow">Gastos lan\xE7ados em ${MESES[+mk.slice(5) - 1]}</h2><span class="num"><b>${brl(list.reduce((s, x) => s + num(x.valor), 0))}</b></span></div>`;
    h += list.length ? `<div class="scroll"><table class="tbl"><tbody>${list.map((x) => `<tr><td class="num">${dataCurta(x.data)}</td><td><b>${esc(x.desc || catBy(x.categoria)[1].split(" (")[0])}</b><br><span class="small muted">${esc(catBy(x.categoria)[1].split(" (")[0])} \xB7 ${esc(formaNome(x.forma))}</span></td><td class="n">${brl(x.valor)}</td><td class="n"><button class="iconbtn" data-act="rm-saida" data-id="${x.id}" aria-label="Excluir">\xD7</button></td></tr>`).join("")}</tbody></table></div>` : '<div class="empty">Nenhum gasto lan\xE7ado.</div>';
    return h + `</section>`;
  }
  function tEntradas(mk, f) {
    const fm = S.fmonths[mk];
    let h = `<div class="cols-even"><section class="panel"><h2>Atendimentos</h2><p class="sub">Dinheiro que entrou no m\xEAs pelo extrato: pacientes, pacotes e repasse da cl\xEDnica (j\xE1 sem sala e nota).</p><div class="big">${brl(f.atend)}</div>
    <label class="check" style="margin-top:12px"><input type="checkbox" ${S.fin.usarPrevistos ? "checked" : ""} data-fin="usarPrevistos" data-rerender="1">Contar tamb\xE9m o que ainda est\xE1 agendado</label></section>
    <section class="panel"><h2>Reserva guardada</h2><p class="sub">Quanto voc\xEA tem hoje guardado para emerg\xEAncias. Atualize sempre que mudar.</p><label class="f" style="max-width:220px">Valor (R$)<input type="number" step="0.01" inputmode="decimal" value="${num(S.fin.reserva)}" data-fin="reserva" data-type="num" data-rerender="1"></label></section></div>`;
    const rendas = S.fin.rendas.filter((r) => vigente(r, mk));
    h += `<section class="panel" style="margin-top:18px"><div class="row"><h2 class="grow">Outras rendas fixas</h2><button class="btn small" data-act="nova-renda">+ Renda fixa</button></div><p class="sub">Outro emprego, aluguel recebido, pens\xE3o\u2026 Entram todo m\xEAs.</p>`;
    h += rendas.length ? `<div class="scroll"><table class="tbl"><tbody>${rendas.map((r) => {
      var _a;
      const e = fm.rendas[r.id] || {};
      return `<tr><td><button class="linkbtn" data-act="edit-renda" data-id="${r.id}">${esc(r.nome)}</button></td><td style="width:130px"><input type="number" step="0.01" value="${num((_a = e.valor) != null ? _a : r.valor)}" data-rendaval="${r.id}" aria-label="Valor de ${esc(r.nome)}"></td><td class="n"><button class="btn small ${e.recebido ? "ok" : ""}" data-act="renda-receber" data-id="${r.id}">${e.recebido ? "\u2713 Recebida" : "Marcar recebida"}</button></td></tr>`;
    }).join("")}</tbody></table></div>` : '<div class="empty">Nenhuma renda fixa al\xE9m dos atendimentos.</div>';
    h += `</section><section class="panel" style="margin-top:18px"><h2>Entradas avulsas</h2><p class="sub">Um trabalho extra, uma venda, um reembolso.</p><div class="grid2"><label class="f">Data<input type="date" id="e-data" value="${mkOf(today()) === mk ? today() : mk + "-01"}"></label><label class="f">Descri\xE7\xE3o<input id="e-desc"></label><label class="f">Valor (R$)<input type="number" step="0.01" id="e-val"></label><div class="f" style="justify-content:flex-end"><button class="btn primary" data-act="add-entrada">Lan\xE7ar entrada</button></div></div>`;
    h += fm.entradas.length ? `<div class="scroll" style="margin-top:12px"><table class="tbl"><tbody>${[...fm.entradas].sort((a, b) => b.data.localeCompare(a.data)).map((x) => `<tr><td class="num">${dataCurta(x.data)}</td><td>${esc(x.desc || "Entrada")}</td><td class="n">${brl(x.valor)}</td><td class="n"><button class="iconbtn" data-act="rm-entrada" data-id="${x.id}" aria-label="Excluir">\xD7</button></td></tr>`).join("")}</tbody></table></div>` : "";
    h += `<div class="kv total" style="margin-top:14px"><span>Total de entradas no m\xEAs</span><span>${brl(f.E)}</span></div></section>`;
    return h;
  }
  function tCartoes(mk, f) {
    var _a;
    const cs = S.fin.cartoes;
    let h = `<section class="panel"><div class="row"><h2 class="grow">Vis\xE3o geral dos cart\xF5es</h2><button class="btn primary small" data-act="novo-cartao">+ Cart\xE3o</button></div>`;
    if (!cs.length) return h + `<div class="empty" style="margin-top:12px">Cadastre seus cart\xF5es de cr\xE9dito com limite, datas e compras parceladas para acompanhar a sa\xFAde de cada um.</div></section>`;
    const uso = f.limite ? f.divida / f.limite : 0;
    h += `<div class="cols-even" style="gap:12px;margin-top:12px"><div><div class="small muted">D\xEDvida total nos cart\xF5es</div><div class="mid">${brl(f.divida)}</div></div><div><div class="small muted">Limite total</div><div class="mid">${brl(f.limite)}</div></div><div><div class="small muted">Faturas deste m\xEAs</div><div class="mid">${brl(f.faturas)}</div></div><div><div class="small muted">No rotativo</div><div class="mid" style="color:${f.rotativo > 0 ? "var(--bad)" : "inherit"}">${brl(f.rotativo)}</div></div></div>
    <div class="bar" style="margin-top:14px"><i class="${uso > 0.7 ? "over" : "a"}" style="width:${Math.min(100, uso * 100)}%"></i></div><p class="small muted" style="margin:6px 0 0">${fmtN(uso * 100, 0)}% do limite total comprometido. Refer\xEAncia: at\xE9 30%.</p></section>`;
    h += `<div class="cols-even" style="margin-top:18px">`;
    for (const c of cs) {
      const s = saudeCartao(c, mk), ft = fatura(c, mk), e = S.fmonths[mk].faturas[c.id] || {};
      const prox = [1, 2, 3, 4, 5, 6].map((i) => ({ m: addMonth(mk, i), v: parcelasMes(c, addMonth(mk, i)) }));
      h += `<section class="panel" style="border-top:5px solid ${esc(c.cor || "#2A6294")}"><div class="row"><h2 class="grow">${esc(c.nome)}</h2><span class="badge ${nb(s.nivel)}">${s.txt}</span></div>
      <p class="sub">Fecha dia ${num(c.fechamento) || "\u2014"} \xB7 vence dia ${num(c.vencimento) || "\u2014"}${num(c.jurosMes) ? ` \xB7 juros ${fmtN(c.jurosMes, 2)}% a.m.` : ""}</p>
      <div class="row small"><span class="grow">Uso do limite</span><b class="num">${brl(s.d)} de ${brl(c.limite)}</b></div><div class="bar" style="height:10px;margin:4px 0 12px"><i class="${s.nivel === "bad" ? "over" : "a"}" style="width:${Math.min(100, s.uso * 100)}%"></i></div>
      <div class="row" style="align-items:flex-end"><label class="f grow">Fatura de ${MESES[+mk.slice(5) - 1]} (R$)<input type="number" step="0.01" value="${(_a = e.valor) != null ? _a : ""}" placeholder="${fmtN(ft.est.valor, 2)} estimado" data-fatval="${c.id}"></label><button class="btn small ${ft.pago ? "ok" : ""}" data-act="fat-pagar" data-id="${c.id}">${ft.pago ? "\u2713 Paga" : "Marcar paga"}</button></div>
      <p class="small muted" style="margin:6px 0 0">Estimativa: ${brl(ft.est.parc)} em parcelas + ${brl(ft.est.compras)} em compras lan\xE7adas. Digite o valor real quando a fatura fechar.</p>
      ${num(c.rotativo) > 0 ? `<p class="small" style="margin:8px 0 0;color:var(--bad)"><b>${brl(c.rotativo)}</b> no rotativo.</p>` : ""}
      <div class="small muted" style="margin-top:10px">Parcelas nos pr\xF3ximos meses</div><div class="row small num" style="gap:6px 12px;margin-top:4px">${prox.map((p) => `<span>${MESES[+p.m.slice(5) - 1].slice(0, 3)} <b>${fmtN(p.v, 0)}</b></span>`).join("")}</div>
      <div style="margin-top:12px"><button class="btn small" data-act="edit-cartao" data-id="${c.id}">Editar cart\xE3o e parcelas</button></div></section>`;
    }
    return h + `</div>`;
  }
  function tQuitar(mk, f) {
    var _a;
    const cs = S.fin.cartoes;
    if (!cs.length) return `<section class="panel"><h2>Plano para quitar os cart\xF5es</h2><div class="empty">Cadastre seus cart\xF5es na aba Cart\xF5es para montar o plano.</div></section>`;
    const sug = Math.max(0, f.E - f.conta);
    const C = S.fin.capacidade == null || S.fin.capacidade === "" ? sug : num(S.fin.capacidade);
    const est = S.fin.estrategia || "avalanche";
    const a = simQuit(est, C, mk), b = simQuit(est === "avalanche" ? "bolaneve" : "avalanche", C, mk);
    const semJuros = cs.filter((c) => num(c.rotativo) > 0 && !num(c.jurosMes));
    let h = `<div class="cols"><section class="panel"><h2>Quanto d\xE1 para pagar por m\xEAs</h2><p class="sub">Valor total que voc\xEA consegue destinar \xE0s faturas, contando parcelas e o que for para abater d\xEDvida.</p>
    <label class="f" style="max-width:240px">Valor por m\xEAs para os cart\xF5es (R$)<input type="number" step="50" value="${(_a = S.fin.capacidade) != null ? _a : ""}" placeholder="${fmtN(sug, 2)}" data-fin="capacidade" data-type="numnull" data-rerender="1"></label>
    <p class="small" style="margin:8px 0 0">Sugest\xE3o pelo m\xEAs atual: <b>${brl(sug)}</b> (entradas menos contas pagas fora do cart\xE3o). ${S.fin.capacidade != null && S.fin.capacidade !== "" ? '<button class="linkbtn small" data-act="cap-sug">Usar sugest\xE3o</button>' : ""}</p>
    <div class="f" style="margin-top:14px"><span class="small muted">Estrat\xE9gia</span><div class="seg"><button data-act="estrategia" data-e="avalanche" aria-pressed="${est === "avalanche"}">Maior juros primeiro</button><button data-act="estrategia" data-e="bolaneve" aria-pressed="${est === "bolaneve"}">Menor d\xEDvida primeiro</button></div></div>
    <p class="small muted" style="margin:8px 0 0">${est === "avalanche" ? "Paga menos juros no total: o dinheiro extra vai primeiro para o cart\xE3o com juros mais altos." : "D\xE1 sensa\xE7\xE3o de progresso mais r\xE1pido: quita primeiro a menor d\xEDvida e libera o valor para a pr\xF3xima."}</p>
    ${semJuros.length ? `<p class="note warn small" style="margin-top:12px">Informe os juros ao m\xEAs de ${semJuros.map((c) => esc(c.nome)).join(", ")} para o c\xE1lculo ficar certo. Rotativo costuma passar de 10% ao m\xEAs.</p>` : ""}</section>
    <section class="panel"><h2>Resultado</h2>${a.ok ? `<div class="big">${a.meses} ${a.meses === 1 ? "m\xEAs" : "meses"}</div><p class="muted small" style="margin:2px 0 12px">Tudo quitado em ${mesLabel(a.fim)}</p>` : `<div class="mid" style="color:var(--bad)">N\xE3o quita em 10 anos</div><p class="small" style="margin:6px 0 12px">Com ${brl(C)} por m\xEAs a d\xEDvida n\xE3o termina. \xC9 preciso aumentar o valor mensal ou renegociar.</p>`}
      <div class="kv"><span>Juros pagos no caminho</span><b class="num">${brl(a.juros)}</b></div>
      <div class="kv"><span>Na outra estrat\xE9gia</span><span class="num">${b.ok ? b.meses + " meses \xB7 " + brl(b.juros) + " de juros" : "n\xE3o quita"}</span></div>
      ${a.deficit ? `<p class="note warn small" style="margin-top:12px">Em ${a.deficit} ${a.deficit === 1 ? "m\xEAs" : "meses"} o valor n\xE3o cobre nem as parcelas j\xE1 assumidas. A diferen\xE7a vira rotativo e gera juros.</p>` : ""}</section></div>`;
    const cols = cs.map((c) => c.id);
    h += `<section class="panel" style="margin-top:18px"><h2>M\xEAs a m\xEAs</h2><p class="sub">Quanto pagar em cada cart\xE3o, sem novas compras. Primeiro m\xEAs inclui a fatura atual.</p><div class="scroll"><table class="tbl"><thead><tr><th>M\xEAs</th>${cs.map((c) => `<th class="n">${esc(c.nome)}</th>`).join("")}<th class="n">D\xEDvida restante</th></tr></thead><tbody>${a.rows.slice(0, 18).map((r) => `<tr><td>${MESES[+r.mk.slice(5) - 1].slice(0, 3)}/${r.mk.slice(2, 4)}</td>${cols.map((id) => `<td class="n">${r.pag[id] > 4e-3 ? brl(r.pag[id]) : "\u2014"}</td>`).join("")}<td class="n"><b>${brl(r.saldo + parcRestantesApos(r.mk))}</b></td></tr>`).join("")}</tbody></table></div>${a.rows.length > 18 ? `<p class="small muted">Mostrando os primeiros 18 meses.</p>` : ""}</section>`;
    const dicas = [];
    if (f.rotativo > 0) dicas.push("Ligue para o banco e pe\xE7a o parcelamento da fatura ou um acordo. Parcelamento costuma ter juros bem menores que o rotativo.");
    if (f.rotativo > 0) dicas.push("Compare com um empr\xE9stimo pessoal ou consignado: se os juros forem menores, trocar a d\xEDvida do rotativo por ele reduz o custo.");
    dicas.push("Durante a quita\xE7\xE3o, use s\xF3 um cart\xE3o (o de menor uso) ou pague tudo no d\xE9bito e Pix. Cada compra nova no cart\xE3o alonga o prazo.");
    dicas.push("Nunca pague s\xF3 o m\xEDnimo: o restante entra no rotativo.");
    if (f.saldo < 0) dicas.push("Seu m\xEAs fecha negativo. Antes de acelerar a quita\xE7\xE3o, reveja os gastos de estilo de vida na aba Resumo.");
    dicas.push("Quando um cart\xE3o for quitado, mantenha o mesmo valor mensal indo para o pr\xF3ximo e depois para a reserva.");
    h += `<section class="panel" style="margin-top:18px"><h2>Caminho sugerido</h2><ul class="sugg">${dicas.map((d) => `<li>${d}</li>`).join("")}</ul><p class="small muted">As contas s\xE3o uma estimativa com os dados informados. Para decis\xF5es como renegocia\xE7\xE3o ou empr\xE9stimo, confirme as condi\xE7\xF5es com o banco.</p></section>`;
    return h;
  }
  function parcRestantesApos(mk) {
    let t = 0;
    for (const c of S.fin.cartoes) t += parcelasFuturas(c, mk);
    return t;
  }
  function modalFixa(id) {
    const isNew = !id, x = isNew ? { id: uid(), nome: "", categoria: "moradia", valor: "", dia: "", forma: "conta", inicio: S.mesCart } : __spreadValues({}, S.fin.fixas.find((a) => a.id === id));
    openModal(`<h2>${isNew ? "Nova conta fixa" : esc(x.nome)}</h2><div class="grid2">
    <label class="f span2">Nome<input id="x-nome" value="${esc(x.nome)}" placeholder="Ex.: Aluguel, Parcela da moto, Internet"></label>
    <label class="f">Categoria<select id="x-cat">${catOpts(x.categoria)}</select></label>
    <label class="f">Valor mensal (R$)<input type="number" step="0.01" id="x-val" value="${esc(x.valor)}"></label>
    <label class="f">Dia de vencimento<input type="number" min="1" max="31" id="x-dia" value="${esc(x.dia)}"></label>
    <label class="f">Como paga<select id="x-forma">${formaOpts(x.forma)}</select></label>
    <label class="f">Come\xE7a em<input type="month" id="x-ini" value="${esc(x.inicio || S.mesCart)}"></label>
    <label class="f">Termina em (opcional)<input type="month" id="x-fim" value="${esc(x.fim || "")}"></label></div>
    <p class="small muted" style="margin:0">Para parcelas com fim (carro, moto, empr\xE9stimo), informe o m\xEAs da \xFAltima.</p>
    <div class="modal-actions">${isNew ? "" : '<button class="btn ghost danger" id="x-del" type="button">Parar a partir deste m\xEAs</button>'}<span class="grow"></span><button class="btn" data-close type="button">Cancelar</button><button class="btn primary" id="x-save" type="button">Salvar</button></div>`);
    $("#x-save").onclick = () => {
      const nome = $("#x-nome").value.trim();
      if (!nome) return $("#x-nome").focus();
      Object.assign(x, { nome, categoria: $("#x-cat").value, valor: num($("#x-val").value), dia: num($("#x-dia").value), forma: $("#x-forma").value, inicio: $("#x-ini").value || S.mesCart, fim: $("#x-fim").value || "" });
      if (isNew) S.fin.fixas.push(x);
      else S.fin.fixas[S.fin.fixas.findIndex((a) => a.id === x.id)] = x;
      save("fin");
      closeModal();
      render();
    };
    if (!isNew) $("#x-del").onclick = () => {
      const i = S.fin.fixas.findIndex((a) => a.id === x.id);
      const fim = addMonth(S.mesCart, -1);
      if (x.inicio && fim < x.inicio) S.fin.fixas.splice(i, 1);
      else S.fin.fixas[i] = __spreadProps(__spreadValues({}, x), { fim });
      save("fin");
      closeModal();
      render();
    };
  }
  function modalRenda(id) {
    const isNew = !id, x = isNew ? { id: uid(), nome: "", valor: "", inicio: S.mesCart } : __spreadValues({}, S.fin.rendas.find((a) => a.id === id));
    openModal(`<h2>${isNew ? "Nova renda fixa" : esc(x.nome)}</h2><div class="grid2"><label class="f span2">Nome<input id="x-nome" value="${esc(x.nome)}"></label><label class="f">Valor mensal (R$)<input type="number" step="0.01" id="x-val" value="${esc(x.valor)}"></label><label class="f">Come\xE7a em<input type="month" id="x-ini" value="${esc(x.inicio || S.mesCart)}"></label></div>
    <div class="modal-actions">${isNew ? "" : '<button class="btn ghost danger" id="x-del" type="button">Parar a partir deste m\xEAs</button>'}<span class="grow"></span><button class="btn" data-close type="button">Cancelar</button><button class="btn primary" id="x-save" type="button">Salvar</button></div>`);
    $("#x-save").onclick = () => {
      const nome = $("#x-nome").value.trim();
      if (!nome) return $("#x-nome").focus();
      Object.assign(x, { nome, valor: num($("#x-val").value), inicio: $("#x-ini").value || S.mesCart });
      if (isNew) S.fin.rendas.push(x);
      else S.fin.rendas[S.fin.rendas.findIndex((a) => a.id === x.id)] = x;
      save("fin");
      closeModal();
      render();
    };
    if (!isNew) $("#x-del").onclick = () => {
      const i = S.fin.rendas.findIndex((a) => a.id === x.id);
      const fim = addMonth(S.mesCart, -1);
      if (x.inicio && fim < x.inicio) S.fin.rendas.splice(i, 1);
      else S.fin.rendas[i] = __spreadProps(__spreadValues({}, x), { fim });
      save("fin");
      closeModal();
      render();
    };
  }
  function modalCartao(id) {
    const isNew = !id, c = isNew ? { id: uid(), nome: "", limite: "", fechamento: "", vencimento: "", jurosMes: "", rotativo: 0, cor: "#2A6294", parcelamentos: [] } : JSON.parse(JSON.stringify(S.fin.cartoes.find((a) => a.id === id)));
    const prow = (p) => {
      var _a, _b;
      return `<div class="cfg-item" data-prow="${p.id}"><label class="f" style="grid-column:span 2">Compra<input data-p="desc" value="${esc(p.desc || "")}" placeholder="Ex.: Celular"></label><label class="f">Categoria<select data-p="categoria">${catOpts(p.categoria || "outros")}</select></label><label class="f">Valor da parcela<input type="number" step="0.01" data-p="valor" value="${esc((_a = p.valor) != null ? _a : "")}"></label><label class="f">N\xBA de parcelas<input type="number" min="1" data-p="total" value="${esc((_b = p.total) != null ? _b : "")}"></label><label class="f">1\xAA parcela na fatura de<input type="month" data-p="primeira" value="${esc(p.primeira || mkOf(today()))}"></label><button class="btn small ghost danger" type="button" data-prm>Remover</button></div>`;
    };
    openModal(`<h2>${isNew ? "Novo cart\xE3o" : esc(c.nome)}</h2><div class="grid2">
    <label class="f span2">Nome do cart\xE3o<input id="c-nome" value="${esc(c.nome)}" placeholder="Ex.: Nubank, Ita\xFA Visa"></label>
    <label class="f">Limite total (R$)<input type="number" step="0.01" id="c-lim" value="${esc(c.limite)}"></label>
    <label class="f">Dia de fechamento<input type="number" min="1" max="31" id="c-fec" value="${esc(c.fechamento)}"></label>
    <label class="f">Dia de vencimento<input type="number" min="1" max="31" id="c-ven" value="${esc(c.vencimento)}"></label>
    <label class="f">Juros do rotativo (% ao m\xEAs)<input type="number" step="0.01" id="c-jur" value="${esc(c.jurosMes)}" placeholder="Veja na fatura"></label>
    <label class="f">D\xEDvida no rotativo ou em atraso (R$)<input type="number" step="0.01" id="c-rot" value="${esc(c.rotativo)}"></label>
    <label class="f">Cor<input type="color" id="c-cor" value="${esc(c.cor || "#2A6294")}"></label></div>
    <div class="row"><h2 class="grow" style="font-size:16px">Compras parceladas</h2><button class="btn small" type="button" id="c-padd">+ Parcelamento</button></div>
    <div class="cfg-list" id="c-plist">${(c.parcelamentos || []).map(prow).join("") || ""}</div>
    <div class="modal-actions">${isNew ? "" : '<button class="btn ghost danger" id="c-del" type="button">Excluir cart\xE3o</button>'}<span class="grow"></span><button class="btn" data-close type="button">Cancelar</button><button class="btn primary" id="c-save" type="button">Salvar</button></div>`);
    $("#c-padd").onclick = () => {
      $("#c-plist").insertAdjacentHTML("beforeend", prow({ id: uid() }));
    };
    $("#c-plist").onclick = (e) => {
      if (e.target.closest("[data-prm]")) e.target.closest("[data-prow]").remove();
    };
    $("#c-save").onclick = () => {
      const nome = $("#c-nome").value.trim();
      if (!nome) return $("#c-nome").focus();
      const parc = [...document.querySelectorAll("#c-plist [data-prow]")].map((r) => {
        const g = (k) => r.querySelector(`[data-p="${k}"]`).value;
        return { id: r.dataset.prow, desc: g("desc").trim(), categoria: g("categoria"), valor: num(g("valor")), total: num(g("total")), primeira: g("primeira") };
      }).filter((p) => p.valor > 0 && p.total > 0 && p.primeira);
      Object.assign(c, { nome, limite: num($("#c-lim").value), fechamento: num($("#c-fec").value), vencimento: num($("#c-ven").value), jurosMes: num($("#c-jur").value), rotativo: num($("#c-rot").value), cor: $("#c-cor").value, parcelamentos: parc });
      if (isNew) S.fin.cartoes.push(c);
      else S.fin.cartoes[S.fin.cartoes.findIndex((a) => a.id === c.id)] = c;
      save("fin");
      closeModal();
      render();
    };
    if (!isNew) $("#c-del").onclick = async () => {
      if (!await confirmar(`Excluir o cart\xE3o ${c.nome} e as parcelas dele?`, "Excluir")) return;
      S.fin.cartoes = S.fin.cartoes.filter((a) => a.id !== c.id);
      save("fin");
      closeModal();
      render();
    };
  }
  function carteiraAct(act, b) {
    const mk = S.mesCart, fm = S.fmonths[mk];
    switch (act) {
      case "cart-tab":
        S.cartTab = b.dataset.t;
        render();
        return true;
      case "mes-cart":
        S.mesCart = addMonth(mk, num(b.dataset.n));
        render();
        return true;
      case "add-saida": {
        const v = num($("#s-val").value), d = $("#s-data").value;
        if (!v || !d) {
          const m = $("#s-msg");
          m.textContent = "Informe data e valor.";
          m.className = "note small warn";
          return true;
        }
        const t = mkOf(d);
        ensureFM(t).then((x) => {
          x.saidas.push({ id: uid(), data: d, desc: $("#s-desc").value.trim(), categoria: $("#s-cat").value, valor: v, forma: $("#s-forma").value });
          save("f-" + t);
          render();
        });
        return true;
      }
      case "rm-saida":
        fm.saidas = fm.saidas.filter((x) => x.id !== b.dataset.id);
        save("f-" + mk);
        render();
        return true;
      case "add-entrada": {
        const v = num($("#e-val").value), d = $("#e-data").value;
        if (!v || !d) return true;
        const t = mkOf(d);
        ensureFM(t).then((x) => {
          x.entradas.push({ id: uid(), data: d, desc: $("#e-desc").value.trim(), valor: v });
          save("f-" + t);
          render();
        });
        return true;
      }
      case "rm-entrada":
        fm.entradas = fm.entradas.filter((x) => x.id !== b.dataset.id);
        save("f-" + mk);
        render();
        return true;
      case "fixa-pagar": {
        const x = S.fin.fixas.find((a) => a.id === b.dataset.id);
        const e = fm.fixas[x.id] || {};
        fm.fixas[x.id] = __spreadProps(__spreadValues({}, e), { pago: !e.pago });
        save("f-" + mk);
        render();
        return true;
      }
      case "renda-receber": {
        const e = fm.rendas[b.dataset.id] || {};
        fm.rendas[b.dataset.id] = __spreadProps(__spreadValues({}, e), { recebido: !e.recebido });
        save("f-" + mk);
        render();
        return true;
      }
      case "fat-pagar": {
        const e = fm.faturas[b.dataset.id] || {};
        fm.faturas[b.dataset.id] = __spreadProps(__spreadValues({}, e), { pago: !e.pago });
        save("f-" + mk);
        render();
        return true;
      }
      case "nova-fixa":
        modalFixa(null);
        return true;
      case "edit-fixa":
        modalFixa(b.dataset.id);
        return true;
      case "nova-renda":
        modalRenda(null);
        return true;
      case "edit-renda":
        modalRenda(b.dataset.id);
        return true;
      case "novo-cartao":
        modalCartao(null);
        return true;
      case "edit-cartao":
        modalCartao(b.dataset.id);
        return true;
      case "estrategia":
        S.fin.estrategia = b.dataset.e;
        save("fin");
        render();
        return true;
      case "cap-sug":
        S.fin.capacidade = null;
        save("fin");
        render();
        return true;
    }
    return false;
  }
  function carteiraChange(t) {
    const mk = S.mesCart, fm = S.fmonths[mk];
    if (t.dataset.fin) {
      const v = t.type === "checkbox" ? t.checked : t.dataset.type === "num" ? num(t.value) : t.dataset.type === "numnull" ? t.value === "" ? null : num(t.value) : t.value;
      setPath(S.fin, t.dataset.fin, v);
      save("fin");
      if (t.dataset.rerender) render();
      return true;
    }
    if (!fm) return false;
    if (t.dataset.fixval) {
      const e = fm.fixas[t.dataset.fixval] || {};
      fm.fixas[t.dataset.fixval] = __spreadProps(__spreadValues({}, e), { valor: num(t.value) });
      save("f-" + mk);
      render();
      return true;
    }
    if (t.dataset.rendaval) {
      const e = fm.rendas[t.dataset.rendaval] || {};
      fm.rendas[t.dataset.rendaval] = __spreadProps(__spreadValues({}, e), { valor: num(t.value) });
      save("f-" + mk);
      render();
      return true;
    }
    if (t.dataset.fatval) {
      const e = fm.faturas[t.dataset.fatval] || {};
      fm.faturas[t.dataset.fatval] = __spreadProps(__spreadValues({}, e), { valor: t.value === "" ? null : num(t.value) });
      save("f-" + mk);
      render();
      return true;
    }
    return false;
  }
  function openModal(html) {
    $("#sheet").innerHTML = html;
    $("#modal").hidden = false;
    if (Auth.user && !podeEditar()) {
      const travar = () => {
        const sh = $("#sheet");
        sh.querySelectorAll("input,select,textarea").forEach((el) => el.disabled = true);
        sh.querySelectorAll("button,a.btn").forEach((el) => {
          if (el.hasAttribute("data-close") || el.classList.contains("numbtn") || el.hasAttribute("data-comp-ver")) return;
          if (el.classList.contains("linkbtn") && el.dataset.act && !ACOES_EDICAO.has(el.dataset.act)) return;
          el.hidden = true;
        });
        sh.querySelectorAll("input[type=file]").forEach((el) => {
          const l = el.closest("label");
          if (l) l.hidden = true;
        });
        if (!sh.querySelector(".aviso-ro")) {
          const ac = sh.querySelector(".modal-actions");
          if (ac) ac.insertAdjacentHTML("beforebegin", '<p class="small muted aviso-ro" style="margin:12px 0 0">Somente visualiza\xE7\xE3o.</p>');
        }
      };
      travar();
      setTimeout(travar, 0);
    }
    setTimeout(() => {
      const f = $("#sheet input:not([type=hidden]),#sheet select");
      f && f.focus({ preventScroll: true });
    }, 30);
  }
  function closeModal() {
    $("#modal").hidden = true;
    $("#sheet").innerHTML = "";
  }
  function escolher(msg, opts) {
    return new Promise((res) => {
      $("#csheet").innerHTML = `<p style="margin:0;font-size:16px">${esc(msg)}</p><div class="modal-actions"><span class="grow"></span><button class="btn" data-c="">Voltar</button>${opts.map(([v, l], i) => `<button class="btn ${i === opts.length - 1 ? "primary" : ""}" data-c="${v}">${esc(l)}</button>`).join("")}</div>`;
      const box = $("#confirm");
      box.hidden = false;
      const done = (v) => {
        box.hidden = true;
        box.onclick = null;
        res(v);
      };
      box.onclick = (e) => {
        const b = e.target.closest("[data-c]");
        if (b) done(b.dataset.c || null);
        else if (e.target === box) done(null);
      };
      setTimeout(() => {
        var _a;
        return (_a = $("#csheet .primary")) == null ? void 0 : _a.focus();
      }, 30);
    });
  }
  const confirmar = (msg, ok) => escolher(msg, [["ok", ok]]).then((v) => v === "ok");
  function pacOptions(sel) {
    const ativos = S.pacientes.filter((p) => p.ativo !== false || p.id === sel).sort((a, b) => a.nome.localeCompare(b.nome));
    return `<option value="">Escolha\u2026</option>` + ativos.map((p) => `<option value="${p.id}" ${p.id === sel ? "selected" : ""}>${esc(p.nome)}</option>`).join("");
  }
  function dentroDisp(a) {
    const wins = S.config.disponibilidade[parseISO(a.data).getDay()] || [];
    const ini = hm(a.hora), fim = ini + (num(a.duracao) || 60);
    return wins.some((w) => w.localId === a.localId && ini >= hm(w.inicio) && fim <= hm(w.fim));
  }
  function conflito(a) {
    const m = S.months[mkOf(a.data)];
    if (!m) return "";
    const s = serv(a.servicoId);
    const outros = m.atendimentos.filter((x) => x.id !== a.id && x.data === a.data && !livreSt(x.status));
    const turma = (s == null ? void 0 : s.grupo) ? outros.filter((x) => x.hora === a.hora && x.localId === a.localId && x.servicoId === a.servicoId) : [];
    if (turma.length) {
      const cap = Math.max(1, num(S.config.turmaCapacidade) || 1);
      if (a.pacienteId && turma.some((x) => x.pacienteId === a.pacienteId)) return "Este aluno j\xE1 est\xE1 nesta turma.";
      const ocup = turma.reduce((t, x) => t + vagasDe(x), 0);
      if (ocup + vagasDe(a) > cap) return `Esta turma j\xE1 est\xE1 com ${ocup} de ${cap} vagas ocupadas.`;
    }
    const blk = bloco(a);
    const choque = outros.find((x) => !turma.includes(x) && sobrepoe(blk, bloco(x)));
    if (choque) {
      const f = bloco(choque)[1];
      return `Conflita com ${nomeAt(choque)} \xE0s ${choque.hora}, que ocupa a agenda at\xE9 ${tm(f)}${intervalo() ? ` (j\xE1 contando ${intervalo()} min de organiza\xE7\xE3o)` : ""}.`;
    }
    return "";
  }
  const LIMITE_COMP = () => Store.mode === "local" ? 180 * 1024 : 4 * 1024 * 1024;
  function lerArquivo(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => rej(new Error("N\xE3o foi poss\xEDvel ler o arquivo."));
      r.readAsDataURL(file);
    });
  }
  function carregarImg(src) {
    return new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("Imagem inv\xE1lida."));
      i.src = src;
    });
  }
  async function salvarComprovante(file) {
    let data = await lerArquivo(file), mime = file.type || "application/octet-stream", nome = file.name || "comprovante";
    const lim = LIMITE_COMP(), tam = (d) => Math.ceil((d.length - d.indexOf(",") - 1) * 3 / 4);
    if (mime.startsWith("image/")) {
      const img = await carregarImg(data);
      let lado = 1600, q = 0.8;
      for (let t = 0; t < 8; t++) {
        const sc = Math.min(1, lado / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * sc);
        cv.height = Math.round(img.height * sc);
        const cx = cv.getContext("2d");
        cx.fillStyle = "#fff";
        cx.fillRect(0, 0, cv.width, cv.height);
        cx.drawImage(img, 0, 0, cv.width, cv.height);
        data = cv.toDataURL("image/jpeg", q);
        mime = "image/jpeg";
        if (tam(data) <= Math.min(lim, 600 * 1024)) break;
        q -= 0.1;
        lado = Math.round(lado * 0.8);
      }
      nome = nome.replace(/\.[^.]+$/, "") + ".jpg";
    }
    if (tam(data) > lim) throw new Error(`Arquivo grande demais (m\xE1ximo ${Math.round(lim / 1024)} KB${Store.mode !== "local" ? "" : ". Prefira uma foto do comprovante"}).`);
    const id = uid();
    await Store.set("cp-" + id, { nome, mime, data, criadoEm: agoraLocal() });
    return { id, nome, mime };
  }
  async function verComprovante(id) {
    const box = $("#confirm"), sh = $("#csheet");
    sh.innerHTML = '<p class="muted" style="margin:0">Carregando arquivo\u2026</p>';
    box.hidden = false;
    const fechar = () => {
      box.hidden = true;
      box.onclick = null;
    };
    box.onclick = (e) => {
      if (e.target === box || e.target.closest("[data-c]")) fechar();
    };
    try {
      const d = await Store.get("cp-" + id);
      if (!d || !d.data) throw new Error("Arquivo n\xE3o encontrado.");
      const bin = atob(d.data.split(",")[1]), arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([arr], { type: d.mime }));
      sh.innerHTML = `<h2 style="font-size:17px">${esc(d.nome || "Comprovante")}</h2>${d.mime.startsWith("image/") ? `<img src="${url}" alt="Comprovante" style="max-width:100%;max-height:65vh;border-radius:10px;border:1px solid var(--line)">` : '<p style="margin:0">Arquivo PDF.</p>'}<div class="modal-actions"><a class="btn" href="${url}" download="${esc(d.nome || "comprovante")}">Baixar</a>${d.mime.startsWith("image/") ? "" : `<a class="btn" href="${url}" target="_blank" rel="noopener">Abrir</a>`}<span class="grow"></span><button class="btn primary" data-c="">Fechar</button></div>`;
    } catch (e) {
      sh.innerHTML = `<p style="margin:0">${esc(e.message || e)}</p><div class="modal-actions"><span class="grow"></span><button class="btn primary" data-c="">Fechar</button></div>`;
    }
  }
  function flagsPadrao(p, sid, pag) {
    const c = S.config, base = { alOn: false, alPct: num(c.ultimoAlPct), nfOn: false, nfPct: num(c.ultimoNfPct) };
    if (pag === "app" || pag === "studio" || pag === "plano") return base;
    let ult = null;
    if (p) {
      for (const mk in S.months) for (const x of S.months[mk].atendimentos) if (x.pacienteId === p.id && x.servicoId === sid && x.alOn != null && (!ult || x.data + x.hora > ult.data + ult.hora)) ult = x;
    }
    const r = ult ? { alOn: !!ult.alOn, alPct: num(ult.alPct), nfOn: !!ult.nfOn, nfPct: num(ult.nfPct) } : base;
    if ((p == null ? void 0 : p.notaFiscal) === "sempre") r.nfOn = true;
    if ((p == null ? void 0 : p.notaFiscal) === "nunca") r.nfOn = false;
    return r;
  }
  function valorPara(pag, p, s, appId) {
    var _a;
    if (pag === "plano") return 0;
    if (pag === "app") return num((_a = appBy(appId)) == null ? void 0 : _a.valor);
    if (pag === "studio") return num(s == null ? void 0 : s.valor);
    return p && p.tipoCobranca !== "plano" && num(p.valorPersonalizado) || num(s == null ? void 0 : s.valor);
  }
  const FORMAS_PADRAO = [{ nome: "Pix" }, { nome: "Dinheiro" }, { nome: "Cart\xE3o de cr\xE9dito" }, { nome: "Cart\xE3o de d\xE9bito" }, { nome: "Transfer\xEAncia" }, { nome: "Cl\xEDnica", repasse: true }];
  const formasCfg = () => Array.isArray(S.config.formasPagamento) ? S.config.formasPagamento : FORMAS_PADRAO;
  const ehRepasse = (nome) => !!nome && formasCfg().some((f) => f.nome === nome && f.repasse);
  function formaPagOpts(sel) {
    const l = formasCfg().map((f) => f.nome).filter(Boolean);
    if (sel && !l.includes(sel)) l.push(sel);
    return '<option value="">\u2014</option>' + l.map((n) => `<option value="${esc(n)}" ${n === sel ? "selected" : ""}>${esc(n)}${ehRepasse(n) ? " (repasse)" : ""}</option>`).join("");
  }
  async function modalAtend(o = {}) {
    var _a, _b;
    const c = S.config, isNew = !o.id;
    let a, mk0 = null;
    if (isNew && !c.servicos.length) {
      openModal(`<h2>Cadastre seus servi\xE7os primeiro</h2><p style="margin:0">Para agendar, o sistema precisa saber quais atendimentos voc\xEA faz e quanto cobra.</p><div class="modal-actions"><span class="grow"></span><button class="btn" data-close type="button">Agora n\xE3o</button><button class="btn primary" data-view="config" type="button">Cadastrar servi\xE7os</button></div>`);
      return;
    }
    if (!isNew) {
      const f = findAt(o.id);
      if (!f) return;
      a = __spreadValues({}, f.a);
      mk0 = f.mk;
    } else {
      const s0 = serv(o.servicoId) || c.servicos.find((s) => s.ativo !== false) || c.servicos[0];
      a = { id: uid(), data: o.data || S.dia, hora: o.hora || "15:00", localId: o.localId || ((_a = c.locais[0]) == null ? void 0 : _a.id), servicoId: s0 == null ? void 0 : s0.id, pacienteId: "", duracao: num(s0 == null ? void 0 : s0.duracao) || durPadrao(), valor: num(s0 == null ? void 0 : s0.valor), cobranca: "avulso", appId: "", status: "agendado", pago: false, forma: "", obs: "", alOn: false, alPct: num(c.ultimoAlPct), nfOn: false, nfPct: num(c.ultimoNfPct) };
      const orig = o.remarcar ? (_b = findAt(o.remarcar)) == null ? void 0 : _b.a : null;
      if (orig) {
        Object.assign(a, { pacienteId: orig.pacienteId, servicoId: orig.servicoId, localId: orig.localId, duracao: orig.duracao, valor: orig.valor, cobranca: orig.cobranca, appId: orig.appId || "", alOn: orig.alOn, alPct: orig.alPct, nfOn: orig.nfOn, nfPct: orig.nfPct, forma: orig.forma || "", reposicaoDe: orig.id, obs: "Reposi\xE7\xE3o da aula de " + dataCurta(orig.data) + " \xE0s " + orig.hora });
      }
      if (!o.hora) {
        const livre = slotsDoDia(a.data).find((s) => s.disp && !s.appts.some((x) => !livreSt(x.status)));
        if (livre) {
          a.hora = livre.hora;
          a.localId = livre.localId;
        }
      }
    }
    if (!isNew && a.alOn == null) {
      const x = custoAt(a, null);
      a.alOn = x.al > 0;
      a.alPct = x.v ? Math.round(x.al / x.v * 1e4) / 100 : num(c.ultimoAlPct);
    }
    if (!isNew && a.nfOn == null) {
      const p = nfDoAtend(a);
      a.nfOn = p > 0;
      a.nfPct = p || num(c.ultimoNfPct);
    }
    await ensureMonth(mkOf(a.data));
    for (const pk of S.pacotes || []) if (!pk.encerrado) await garantirMesesPacote(pk);
    const p0 = pacBy(a.pacienteId);
    const servOpts = c.servicos.filter((s) => s.ativo !== false || s.id === a.servicoId).map((s) => `<option value="${s.id}" ${s.id === a.servicoId ? "selected" : ""}>${esc(s.nome)}</option>`).join("");
    const locOpts = c.locais.map((l) => `<option value="${l.id}" ${l.id === a.localId ? "selected" : ""}>${esc(l.nome)}</option>`).join("");
    const appOpts = c.apps.map((x) => `<option value="${x.id}" ${x.id === (a.appId || (p0 == null ? void 0 : p0.appId)) ? "selected" : ""}>${esc(x.nome)}</option>`).join("");
    const temPlano = (p) => (p == null ? void 0 : p.tipoCobranca) === "plano" && planoBy(p.planoId);
    openModal(`<h2>${isNew ? a.reposicaoDe ? "Remarcar aula" : "Novo agendamento" : "Atendimento"}</h2>
    <label class="f">Paciente ou aluno<select id="f-pac">${pacOptions(a.pacienteId)}</select></label>
    <div><button class="linkbtn small" id="f-np-open" type="button">+ Novo cadastro</button>
      <div id="f-np" hidden class="cfg-item" style="margin-top:8px"><label class="f" style="grid-column:span 2">Nome completo<input id="f-np-nome"></label><label class="f">Telefone<input id="f-np-tel" inputmode="tel"></label><label class="f">CPF<input id="f-np-cpf" inputmode="numeric" placeholder="000.000.000-00" maxlength="14" data-mask="cpf"></label><label class="f">\xC9<select id="f-np-cat"><option value="aluno">Aluno</option><option value="paciente">Paciente</option></select></label><button class="btn small primary" id="f-np-add" type="button">Salvar cadastro</button><p class="small" id="f-np-msg" style="margin:0;grid-column:1/-1"></p></div></div>
    <div class="grid2">
      <label class="f">Servi\xE7o<select id="f-serv">${servOpts}</select></label>
      <label class="f">Local<select id="f-local">${locOpts}</select></label>
      <label class="f">Data<input type="date" id="f-data" value="${a.data}"></label>
      <label class="f">Hor\xE1rio<input type="time" id="f-hora" value="${a.hora}" step="300"></label>
      <label class="f">Dura\xE7\xE3o (min)<input type="number" id="f-dur" step="5" value="${a.duracao}"></label>
      <label class="f">Valor (R$)<input type="number" id="f-valor" step="0.01" inputmode="decimal" value="${a.valor}"></label>
    </div>
    <label class="f" id="f-pk-w" hidden>Pacote<select id="f-pk"></select></label>
    <div class="grid2">
      <label class="check"><input type="checkbox" id="f-isapp" ${a.cobranca === "app" ? "checked" : ""}>Aplicativo</label><label class="f">Aplicativo<select id="f-app" ${a.cobranca === "app" ? "" : "disabled"}>${appOpts || '<option value="">Cadastre em Configura\xE7\xF5es</option>'}</select></label>
      <label class="check"><input type="checkbox" id="f-al" ${a.alOn ? "checked" : ""}>Desconto de sala</label><label class="f">Sala (%)<input type="number" step="0.01" id="f-alpct" value="${num(a.alPct)}" ${a.alOn ? "" : "disabled"}></label>
      <label class="check"><input type="checkbox" id="f-nf" ${a.nfOn ? "checked" : ""}>Emitir nota fiscal</label><label class="f">Nota fiscal (%)<input type="number" step="0.01" id="f-nfpct" value="${num(a.nfPct)}" ${a.nfOn ? "" : "disabled"}></label>
    </div>
    <p class="note" id="f-note"></p>
    <div class="f"><span class="small muted">Situa\xE7\xE3o</span><div class="seg" id="f-status">${[["agendado", "Agendado"], ["realizado", "Realizado"], ["falta", "Faltou"], ["desmarcado", "Desmarcou"], ["cancelado", "Cancelado"]].map(([k, l]) => `<button type="button" data-st="${k}" aria-pressed="${a.status === k}">${l}</button>`).join("")}</div></div>

    <div class="f"><span class="small muted">Comprovante de pagamento</span><div class="row" id="f-comp-w"></div><input type="file" id="f-comp-in" accept="image/*,application/pdf" hidden><p class="small muted" id="f-comp-msg" style="margin:0"></p></div>
    <div class="f"><span class="small muted">Nota fiscal (NF)</span><div class="row" id="f-nfa-w"></div><input type="file" id="f-nfa-in" accept="image/*,application/pdf" hidden><p class="small muted" id="f-nfa-msg" style="margin:0"></p></div>
    <div class="grid2"><label class="check"><input type="checkbox" id="f-pago" ${a.pago ? "checked" : ""}>Pagamento recebido</label><label class="f">Forma de pagamento<select id="f-forma">${formaPagOpts(a.forma)}</select></label><label class="f" id="f-pagoem-w">Data do pagamento<input type="date" id="f-pagoem" value="${esc(a.pagoEm || "")}"></label></div>
    ${isNew ? `<label class="f">Repetir<select id="f-rep"><option value="1">N\xE3o repetir</option>${[4, 8, 12, 16, 24].map((n) => `<option value="${n}">Toda semana, por ${n} semanas</option>`).join("")}</select></label>` : ""}
    <label class="f">Observa\xE7\xF5es<textarea id="f-obs" rows="2">${esc(a.obs)}</textarea></label>
    <div class="modal-actions">${isNew ? "" : '<button class="btn ghost danger" id="f-del" type="button">Excluir</button>'}<span class="grow"></span><button class="btn" data-close type="button">Cancelar</button><button class="btn primary" id="f-save" type="button">${isNew ? "Agendar" : "Salvar"}</button></div>`);
    const g = (id) => $("#" + id);
    const compUI = () => {
      const w = g("f-comp-w");
      w.innerHTML = a.comprovante ? `<span class="badge b-ok">\u{1F4CE} ${esc(a.comprovante.nome || "comprovante")}</span><button class="btn small" type="button" data-comp-ver="${a.comprovante.id}">Ver</button><button class="btn small ghost" type="button" id="f-comp-trocar">Trocar</button><button class="btn small ghost danger" type="button" id="f-comp-rm">Remover</button>` : `<button class="btn small" type="button" id="f-comp-add">\u{1F4CE} Anexar comprovante</button><span class="small muted">Foto ou PDF</span>`;
      const ab = () => g("f-comp-in").click();
      if (g("f-comp-add")) g("f-comp-add").onclick = ab;
      if (g("f-comp-trocar")) g("f-comp-trocar").onclick = ab;
      if (g("f-comp-rm")) g("f-comp-rm").onclick = () => {
        const id = a.comprovante.id;
        a.comprovante = null;
        Store.set("cp-" + id, { removido: true }).catch(() => {
        });
        compUI();
      };
    };
    g("f-comp-in").onchange = async () => {
      const file = g("f-comp-in").files[0];
      g("f-comp-in").value = "";
      if (!file) return;
      const m = g("f-comp-msg");
      m.textContent = "Anexando\u2026";
      try {
        const c2 = await salvarComprovante(file);
        a.comprovante = c2;
        g("f-pago").checked = true;
        m.textContent = "Comprovante anexado. Clique em Salvar para concluir.";
        compUI();
      } catch (e) {
        m.textContent = String(e && e.message || e);
      }
    };
    compUI();
    const nfaUI = () => {
      const w = g("f-nfa-w");
      w.innerHTML = a.nfArquivo ? `<span class="badge b-ok">\u{1F9FE} ${esc(a.nfArquivo.nome || "nota fiscal")}</span><button class="btn small" type="button" data-comp-ver="${a.nfArquivo.id}">Ver</button><button class="btn small ghost" type="button" id="f-nfa-trocar">Trocar</button><button class="btn small ghost danger" type="button" id="f-nfa-rm">Remover</button>` : `<button class="btn small" type="button" id="f-nfa-add">\u{1F9FE} Anexar nota fiscal</button><span class="small muted">Foto ou PDF</span>`;
      const ab = () => g("f-nfa-in").click();
      if (g("f-nfa-add")) g("f-nfa-add").onclick = ab;
      if (g("f-nfa-trocar")) g("f-nfa-trocar").onclick = ab;
      if (g("f-nfa-rm")) g("f-nfa-rm").onclick = () => {
        const id = a.nfArquivo.id;
        a.nfArquivo = null;
        Store.set("cp-" + id, { removido: true }).catch(() => {
        });
        nfaUI();
      };
    };
    g("f-nfa-in").onchange = async () => {
      const file = g("f-nfa-in").files[0];
      g("f-nfa-in").value = "";
      if (!file) return;
      const m = g("f-nfa-msg");
      m.textContent = "Anexando\u2026";
      try {
        a.nfArquivo = await salvarComprovante(file);
        m.textContent = "Nota fiscal anexada. Clique em Salvar para concluir.";
        nfaUI();
      } catch (e) {
        m.textContent = String(e && e.message || e);
      }
    };
    nfaUI();
    const pkOpts = () => {
      const pid = g("f-pac").value, sid = g("f-serv").value, data = g("f-data").value || a.data;
      const lst = pid ? pacotesUsaveis(pid, sid, data) : [];
      const atual = a.pacoteId && pacoteBy(a.pacoteId);
      if (atual && !lst.includes(atual)) lst.unshift(atual);
      const w = g("f-pk-w"), sel = g("f-pk"), prev = sel.value || a.pacoteId || "";
      w.hidden = !lst.length;
      if (!lst.length) {
        sel.innerHTML = "";
        return;
      }
      sel.innerHTML = '<option value="">N\xE3o usar pacote</option>' + lst.map((pk) => {
        const u = usoPacote(pk);
        return `<option value="${pk.id}">${num(pk.sessoes)} sess\xF5es \xB7 ${u.restantes} restante${u.restantes === 1 ? "" : "s"}${pk.fim ? " \xB7 at\xE9 " + dataCurta(pk.fim) : ""}${pk.pagoEm ? "" : " \xB7 n\xE3o pago"}</option>`;
      }).join("");
      const ok = lst.find((pk) => pk.id === prev) || (isNew && !a._pkEscolhido ? lst.find((pk) => usoPacote(pk).restantes > 0) : null);
      sel.value = ok ? ok.id : "";
    };
    const syncFlags = () => {
      g("f-pagoem-w").hidden = !g("f-pago").checked;
      const comPk = !g("f-pk-w").hidden && !!g("f-pk").value;
      g("f-isapp").disabled = comPk;
      g("f-nf").disabled = comPk;
      if (comPk) {
        g("f-isapp").checked = false;
        g("f-nf").checked = false;
      }
      g("f-alpct").disabled = !g("f-al").checked;
      g("f-nfpct").disabled = !g("f-nf").checked;
      g("f-app").disabled = !g("f-isapp").checked;
    };
    const pagAtual = () => g("f-isapp").checked ? "app" : ehRepasse(g("f-forma").value) ? "studio" : "avulso";
    const ler = () => {
      a.pacienteId = g("f-pac").value;
      a.servicoId = g("f-serv").value;
      a.localId = g("f-local").value;
      a.data = g("f-data").value || a.data;
      a.hora = g("f-hora").value || a.hora;
      a.duracao = num(g("f-dur").value) || durPadrao();
      a.cobranca = pagAtual();
      a.appId = a.cobranca === "app" ? g("f-app").value : "";
      a.valor = num(g("f-valor").value);
      a.alOn = g("f-al").checked;
      a.alPct = num(g("f-alpct").value);
      a.nfOn = g("f-nf").checked;
      a.nfPct = num(g("f-nfpct").value);
      a.pacoteId = !g("f-pk-w").hidden && g("f-pk").value || "";
      if (a.pacoteId) {
        a.cobranca = "avulso";
        a.appId = "";
        a.nfOn = false;
      }
      a.pago = g("f-pago").checked;
      a.pagoEm = a.pago ? g("f-pagoem").value || a.pagoEm || a.data : "";
      a.forma = g("f-forma").value;
      a.comprovante = a.comprovante || null;
      a.nfArquivo = a.nfArquivo || null;
      a.obs = g("f-obs").value.trim();
    };
    const nota = (extra) => {
      var _a2, _b2, _c;
      ler();
      const p = pacBy(a.pacienteId), s = serv(a.servicoId), msgs = [];
      if (a.cobranca === "plano") msgs.push(`Coberto pela mensalidade (${esc(((_a2 = planoBy(p == null ? void 0 : p.planoId)) == null ? void 0 : _a2.nome) || "plano")}): a sess\xE3o entra com R$ 0.`);
      else if (a.cobranca === "app") msgs.push(`Check-in ${esc(((_b2 = appBy(a.appId)) == null ? void 0 : _b2.nome) || "do aplicativo")}: ${brl((_c = appBy(a.appId)) == null ? void 0 : _c.valor)} por atendimento.`);
      else if (a.cobranca === "studio") msgs.push(`Forma de pagamento \u201C${esc(a.forma)}\u201D \xE9 repasse da cl\xEDnica.`);
      else if (p && num(p.valorPersonalizado) && p.tipoCobranca !== "plano") msgs.push("Valor combinado com este paciente.");
      if (s) {
        const x = custoAt(a, null), partes = [];
        if (x.combo) partes.push(`desconto nota + sala 50% ${brl(x.combo)}`);
        else {
          if (x.al) partes.push(`desconto de sala ${fmtN(x.alPct, 2)}% ${brl(x.al)}`);
          if (x.nf) partes.push(`desconto de nota ${fmtN(x.pct, 2)}% ${brl(x.nf)}`);
        }
        if (x.desl) partes.push("deslocamento " + brl(x.desl));
        msgs.push(`${brl(x.v)}${partes.length ? " \u2212 " + partes.join(" \u2212 ") : " sem descontos"} = <b>${brl(x.liq)}</b> l\xEDquido.`);
      }
      if (s) {
        const o = origemAt(a), dRep = dataCurta(quintoDiaUtil(addMonth(mkOf(a.data), 1))), sd = salaDebitoAt(a);
        if (o === "clinica") msgs.push(`<b>Pago pela cl\xEDnica</b> no repasse de ${dRep}: ${brl(valorClinicaAt(a))} para voc\xEA${!ehServClinica(s) && a.cobranca === "avulso" && salaPctAt(a) ? " (nota + sala: 50%)" : ""}.`);
        else if (o === "pacote") msgs.push(`<b>Sess\xE3o de pacote</b> (j\xE1 pago). ${sd ? `Sala ${brl(sd)} descontada do repasse de ${dRep}.` : "Sem sala."}`);
        else if (o === "paciente") msgs.push(`<b>Pago pelo paciente</b>: ${brl(a.valor)} entra no extrato ${a.pago ? "em " + dataCurta(a.pagoEm || a.data) : "quando for marcado como recebido"}.${sd ? ` Sala ${fmtN(salaPctAt(a), 2)}% (${brl(sd)}) descontada do repasse de ${dRep}.` : ""}`);
      }
      if (a.status === "desmarcado" && a._desmAntes != null) {
        const t = __spreadValues({}, a);
        msgs.unshift("<b>" + esc(aplicarDesmarcacao(t, a._desmAntes)) + "</b>");
      }
      if (a.status === "falta" && cobraFalta(a)) msgs.unshift("<b>Falta cobrada: a aula entra nos recebimentos.</b>");
      const cf = S.months[mkOf(a.data)] && !livreSt(a.status) ? conflito(a) : "";
      if (cf) msgs.push("\u26A0 " + esc(cf));
      if (a.hora) {
        const f = bloco(a)[1];
        msgs.push(`Ocupa a agenda das ${a.hora} \xE0s ${tm(f)}${intervalo() ? ` (${durDe(a)} min de atendimento + ${intervalo()} min de organiza\xE7\xE3o)` : ""}.`);
      }
      if (!dentroDisp(a)) msgs.push("Fora dos hor\xE1rios de atendimento cadastrados para este local.");
      if (extra) msgs.unshift("<b>" + esc(extra) + "</b>");
      const n = g("f-note");
      n.innerHTML = msgs.join("<br>");
      n.className = "note" + (cf || extra ? " warn" : "");
    };
    const recalc = (kind) => {
      const p = pacBy(g("f-pac").value);
      if (kind === "pac") {
        if (p) {
          if (p.servicoPadrao && serv(p.servicoPadrao)) {
            g("f-serv").value = p.servicoPadrao;
            g("f-dur").value = serv(p.servicoPadrao).duracao || durPadrao();
          }
          if (p.localPadrao && localBy(p.localPadrao)) g("f-local").value = p.localPadrao;
        }
        g("f-isapp").checked = false;
        if ((p == null ? void 0 : p.appId) && appBy(p.appId)) g("f-app").value = p.appId;
      }
      if (kind === "serv") {
        const s2 = serv(g("f-serv").value);
        if (s2) g("f-dur").value = s2.duracao || durPadrao();
      }
      if (kind === "isapp" && g("f-isapp").checked && (p == null ? void 0 : p.appId) && appBy(p.appId)) g("f-app").value = p.appId;
      const pag = pagAtual(), s = serv(g("f-serv").value);
      if (kind !== "forma") g("f-valor").value = valorPara(pag, p, s, g("f-app").value);
      if (kind !== "app" && kind !== "forma") {
        const fl = flagsPadrao(p, g("f-serv").value, pag);
        g("f-al").checked = fl.alOn;
        g("f-alpct").value = fl.alPct;
        g("f-nf").checked = fl.nfOn;
        g("f-nfpct").value = fl.nfPct;
      }
      pkOpts();
      if (g("f-pk").value && !g("f-pk-w").hidden) {
        const pk = pacoteBy(g("f-pk").value);
        g("f-valor").value = Math.round(valorSessaoPac(pk) * 100) / 100;
        g("f-pago").checked = true;
      }
      syncFlags();
      nota();
    };
    g("f-pac").onchange = () => recalc("pac");
    g("f-serv").onchange = () => recalc("serv");
    g("f-isapp").onchange = () => recalc("isapp");
    g("f-app").onchange = () => recalc("app");
    g("f-forma").onchange = () => recalc("forma");
    ["f-al", "f-nf", "f-pago"].forEach((id) => g(id).addEventListener("change", () => {
      if (id === "f-pago" && g("f-pago").checked && !g("f-pagoem").value) g("f-pagoem").value = today() < (g("f-data").value || a.data) ? today() : g("f-data").value || a.data;
      syncFlags();
      nota();
    }));
    g("f-pk").addEventListener("change", () => {
      a._pkEscolhido = true;
      const pk = pacoteBy(g("f-pk").value);
      if (pk) {
        g("f-valor").value = Math.round(valorSessaoPac(pk) * 100) / 100;
        g("f-pago").checked = true;
        if (!g("f-pagoem").value) g("f-pagoem").value = pk.pagoEm || g("f-data").value || a.data;
      }
      syncFlags();
      nota();
    });
    g("f-data").addEventListener("change", () => {
      pkOpts();
      syncFlags();
    });
    ["f-local", "f-data", "f-hora", "f-dur", "f-valor", "f-alpct", "f-nfpct"].forEach((id) => g(id).addEventListener("change", () => nota()));
    ["f-alpct", "f-nfpct", "f-valor"].forEach((id) => g(id).addEventListener("input", () => nota()));
    g("f-status").onclick = async (e) => {
      const b = e.target.closest("[data-st]");
      if (!b) return;
      if (b.dataset.st === "desmarcado" && a.status !== "desmarcado") {
        ler();
        const r = await perguntarAntecedencia(a);
        if (r == null) return;
        a._desmAntes = r;
      }
      a.status = b.dataset.st;
      if (a.status !== "desmarcado") delete a._desmAntes;
      g("f-status").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      nota();
      if (a.status === "realizado" && (!["app", "studio"].includes(pagAtual()) || num(g("f-valor").value) === 0)) {
        g("f-pago").checked = true;
        if (!g("f-pagoem").value) g("f-pagoem").value = g("f-data").value || a.data;
        syncFlags();
      }
    };
    g("f-np-open").onclick = () => {
      g("f-np").hidden = !g("f-np").hidden;
      if (!g("f-np").hidden) g("f-np-nome").focus();
    };
    g("f-np-add").onclick = () => {
      const nome = g("f-np-nome").value.trim();
      if (!nome) {
        g("f-np-msg").textContent = "Informe o nome.";
        return;
      }
      const p = { id: uid(), nome, telefone: g("f-np-tel").value.trim(), cpf: g("f-np-cpf").value.trim(), categoria: g("f-np-cat").value, tipoCobranca: "avulso", ativo: true, inicio: today(), criadoEm: today() };
      S.pacientes.push(p);
      save("pacientes");
      g("f-pac").innerHTML = pacOptions(p.id);
      g("f-np").hidden = true;
      g("f-np-nome").value = "";
      g("f-np-tel").value = "";
      g("f-np-cpf").value = "";
      recalc("pac");
      nota(`${nome} foi salvo no Cadastro.`);
    };
    if (isNew && !a.reposicaoDe) recalc(a.pacienteId ? "pac" : "serv");
    else {
      pkOpts();
      syncFlags();
      nota();
    }
    g("f-save").onclick = async () => {
      ler();
      if (a.cobranca !== "studio" && !a.pacienteId) {
        nota("Escolha o paciente ou aluno.");
        return;
      }
      if (!serv(a.servicoId)) {
        nota("Escolha o servi\xE7o.");
        return;
      }
      if (a.cobranca === "app" && !appBy(a.appId)) {
        nota("Escolha o aplicativo.");
        return;
      }
      if (a.pacoteId) {
        const pk = pacoteBy(a.pacoteId), u = usoPacote(pk);
        const jaUsava = !isNew && findAt(a.id) && findAt(a.id).a.pacoteId === a.pacoteId;
        const precisa = isNew ? num(g("f-rep").value) || 1 : jaUsava ? 0 : 1;
        if (precisa > u.restantes && !await confirmar(`O pacote tem ${u.restantes} sess\xE3o${u.restantes === 1 ? "" : "es"} restante${u.restantes === 1 ? "" : "s"} e voc\xEA est\xE1 usando ${precisa}. Continuar mesmo assim?`, "Continuar")) return;
      }
      let msgDesm = "";
      if (a.status === "desmarcado" && a._desmAntes != null) msgDesm = aplicarDesmarcacao(a, a._desmAntes);
      delete a._desmAntes;
      delete a._pkEscolhido;
      const cf = livreSt(a.status) ? "" : conflito(a);
      if (cf && !livreSt(a.status) && !await confirmar(cf + " Deseja agendar mesmo assim?", "Agendar mesmo assim")) return;
      let mudouCfg = false;
      if (a.alOn && num(a.alPct) !== num(c.ultimoAlPct)) {
        c.ultimoAlPct = num(a.alPct);
        mudouCfg = true;
      }
      if (a.nfOn && num(a.nfPct) !== num(c.ultimoNfPct)) {
        c.ultimoNfPct = num(a.nfPct);
        mudouCfg = true;
      }
      if (mudouCfg) save("config");
      if (isNew) {
        const rep = num(g("f-rep").value) || 1, serie = rep > 1 ? uid() : null;
        if (a.reposicaoDe) {
          const f = findAt(a.reposicaoDe);
          if (f) {
            f.a.remarcadoPara = a.id;
            save("m-" + f.mk);
          }
        }
        for (let i = 0; i < rep; i++) {
          const b = __spreadProps(__spreadValues({}, a), { id: i ? uid() : a.id, data: addDays(a.data, 7 * i), serieId: serie, reposicaoDe: i ? void 0 : a.reposicaoDe });
          if (i > 0) {
            b.status = "agendado";
            b.pago = a.cobranca === "plano" || !!a.pacoteId;
            b.pagoEm = b.pago && !a.pacoteId ? b.data : a.pacoteId ? a.pagoEm : "";
          }
          const mk = mkOf(b.data);
          const m = await ensureMonth(mk);
          m.atendimentos.push(b);
          save("m-" + mk);
        }
      } else {
        const m0 = S.months[mk0];
        m0.atendimentos = m0.atendimentos.filter((x) => x.id !== a.id);
        save("m-" + mk0);
        const mk = mkOf(a.data);
        const m = await ensureMonth(mk);
        m.atendimentos.push(a);
        save("m-" + mk);
      }
      closeModal();
      render();
      if (msgDesm) escolher(msgDesm, [["ok", "Ok"]]);
    };
    if (!isNew) g("f-del").onclick = async () => {
      if (a.serieId) {
        const r = await escolher("Este hor\xE1rio se repete toda semana.", [["one", "Excluir s\xF3 este"], ["next", "Este e os pr\xF3ximos"]]);
        if (!r) return;
        if (r === "next") {
          for (let i = 0; i < 14; i++) {
            const mk = addMonth(mk0, i);
            const m2 = await ensureMonth(mk);
            const n = m2.atendimentos.length;
            m2.atendimentos = m2.atendimentos.filter((x) => !(x.serieId === a.serieId && x.data >= a.data));
            if (m2.atendimentos.length !== n) save("m-" + mk);
          }
          closeModal();
          render();
          return;
        }
      } else if (!await confirmar("Excluir este atendimento? Para registrar que n\xE3o aconteceu, use Cancelado ou Faltou.", "Excluir")) return;
      const m = S.months[mk0];
      m.atendimentos = m.atendimentos.filter((x) => x.id !== a.id);
      save("m-" + mk0);
      closeModal();
      render();
    };
  }
  async function garantirMesesPacote(p) {
    if (!p || !p.inicio) return;
    const fim = p.fim && p.fim < today() ? p.fim : addMonth(mkOf(today()), 2) + "-01";
    for (let k = mkOf(p.inicio), n = 0; k <= mkOf(fim) && n < 24; k = addMonth(k, 1), n++) await ensureMonth(k);
  }
  function pacotesHTML(pid) {
    const lst = (S.pacotes || []).filter((p) => p.pacienteId === pid).sort((a, b) => (b.inicio || "").localeCompare(a.inicio || ""));
    return `<div class="span2" style="border-top:1px solid var(--line);padding-top:12px"><div class="row"><b class="grow">Pacotes</b>${verValores() && podeEditar() ? `<button class="btn small" type="button" data-act="novo-pacote" data-pac="${pid}">+ Novo pacote</button>` : ""}</div>${lst.length ? lst.map((p) => {
      const u = usoPacote(p), st = p.encerrado ? '<span class="badge">Encerrado</span>' : u.vencido ? '<span class="badge b-warn">Vencido</span>' : u.restantes ? '<span class="badge b-ok">Ativo</span>' : '<span class="badge">Todas as sess\xF5es usadas</span>';
      return `<div class="todo"><div class="info" ${verValores() ? `data-act="edit-pacote" data-id="${p.id}"` : ""}><b>${num(p.sessoes)} sess\xF5es \xB7 ${brl(valorFinalPac(p))}</b><span class="muted small">${u.usadas} usada${u.usadas === 1 ? "" : "s"}${u.agendadas ? ` \xB7 ${u.agendadas} agendada${u.agendadas === 1 ? "" : "s"}` : ""} \xB7 ${u.restantes} restante${u.restantes === 1 ? "" : "s"}${p.fim ? " \xB7 at\xE9 " + dataCurta(p.fim) : ""}${p.pagoEm ? "" : " \xB7 <b>n\xE3o pago</b>"}</span></div>${st}</div>`;
    }).join("") : '<p class="small muted" style="margin:6px 0 0">Nenhum pacote.</p>'}</div>`;
  }
  async function modalPacote(pacId, id) {
    if (!verValores()) return;
    const c = S.config, isNew = !id;
    const p = isNew ? { id: uid(), pacienteId: pacId, servicos: [], sessoes: 5, inicio: today(), fim: addDays(today(), 90), valor: 0, desconto: 0, forma: "Pix", parcelas: 1, taxa: 0, pagoEm: today(), obs: "", criadoEm: today() } : __spreadValues({}, pacoteBy(id));
    if (!p || !p.id) return;
    await garantirMesesPacote(p);
    const u = isNew ? { usadas: 0, agendadas: 0 } : usoPacote(p);
    const elegiveis = c.servicos.filter((s) => (s.ativo !== false || (p.servicos || []).includes(s.id)) && !ehServClinica(s));
    const formas = (c.formasPagamento || []).map((f) => f.nome).filter(Boolean);
    const pac = pacBy(p.pacienteId) || {};
    openModal(`<h2>${isNew ? "Novo pacote" : "Pacote"} \xB7 ${esc(pac.nome || "")}</h2>
    <div class="f"><span class="small muted">Atividades inclu\xEDdas</span><div class="row" style="flex-wrap:wrap;gap:6px 14px">${elegiveis.map((s) => `<label class="check"><input type="checkbox" data-pk-serv="${s.id}" ${(p.servicos || []).includes(s.id) ? "checked" : ""}>${esc(s.nome)}</label>`).join("")}</div></div>
    <div class="grid2">
      <label class="f">N\xBA de sess\xF5es<input type="number" min="1" step="1" id="pk-n" value="${num(p.sessoes)}"></label>
      <label class="f">Valor do pacote (R$)<input type="number" step="0.01" inputmode="decimal" id="pk-v" value="${num(p.valor)}"></label>
      <label class="f">In\xEDcio<input type="date" id="pk-ini" value="${esc(p.inicio || "")}"></label>
      <label class="f">V\xE1lido at\xE9<input type="date" id="pk-fim" value="${esc(p.fim || "")}"></label>
      <label class="f">Desconto (R$)<input type="number" step="0.01" inputmode="decimal" id="pk-desc" value="${num(p.desconto)}"></label>
      <label class="f">Forma de pagamento<select id="pk-forma">${formas.map((f) => `<option ${f === p.forma ? "selected" : ""}>${esc(f)}</option>`).join("")}</select></label>
      <label class="f">Parcelas no cart\xE3o<select id="pk-parc">${[...Array(12)].map((_, i) => `<option value="${i + 1}" ${num(p.parcelas) === i + 1 ? "selected" : ""}>${i + 1}x</option>`).join("")}</select></label>
      <label class="f">Taxa da m\xE1quina (R$, paga pelo paciente)<input type="number" step="0.01" inputmode="decimal" id="pk-taxa" value="${num(p.taxa)}"></label>
      <label class="check"><input type="checkbox" id="pk-pago" ${p.pagoEm ? "checked" : ""}>Pagamento recebido</label>
      <label class="f">Data do pagamento<input type="date" id="pk-pagoem" value="${esc(p.pagoEm || today())}"></label>
      <label class="f span2">Observa\xE7\xF5es<textarea id="pk-obs" rows="2">${esc(p.obs || "")}</textarea></label>
      ${isNew ? "" : `<label class="check span2"><input type="checkbox" id="pk-enc" ${p.encerrado ? "checked" : ""}>Encerrar pacote (n\xE3o aparece mais para agendar)</label>`}
    </div>
    <p class="note" id="pk-note"></p>
    <div class="modal-actions">${isNew ? "" : '<button class="btn ghost danger" id="pk-del" type="button">Excluir</button>'}<span class="grow"></span><button class="btn" data-close type="button">Cancelar</button><button class="btn primary" id="pk-save" type="button">Salvar</button></div>`);
    const g = (x) => $("#" + x);
    const ler = () => {
      p.servicos = [...document.querySelectorAll("[data-pk-serv]")].filter((x) => x.checked).map((x) => x.dataset.pkServ);
      p.sessoes = Math.max(0, Math.round(num(g("pk-n").value)));
      p.valor = num(g("pk-v").value);
      p.desconto = num(g("pk-desc").value);
      p.inicio = g("pk-ini").value;
      p.fim = g("pk-fim").value;
      p.forma = g("pk-forma").value;
      p.parcelas = /cr[eé]dito/i.test(p.forma) ? num(g("pk-parc").value) || 1 : 1;
      p.taxa = num(g("pk-taxa").value);
      p.pagoEm = g("pk-pago").checked ? g("pk-pagoem").value || today() : "";
      p.obs = g("pk-obs").value.trim();
      if (g("pk-enc")) p.encerrado = g("pk-enc").checked;
    };
    const nota = (extra) => {
      ler();
      g("pk-parc").disabled = !/cr[eé]dito/i.test(p.forma);
      g("pk-pagoem").disabled = !g("pk-pago").checked;
      const vf = valorFinalPac(p), cobra = vf + num(p.taxa), sess = valorSessaoPac(p);
      const s0 = serv(p.servicos[0]), salaPct = s0 && s0.aluguelTipo === "percent" ? num(s0.aluguelValor) : num(c.ultimoAlPct);
      const msgs = [];
      if (extra) msgs.push("<b>" + esc(extra) + "</b>");
      msgs.push(`Valor do pacote: <b>${brl(vf)}</b>${p.desconto ? ` (${brl(p.valor)} − desconto ${brl(p.desconto)})` : ""} — entra inteiro no extrato ${p.pagoEm ? "em " + dataCurta(p.pagoEm) : "quando for pago"}.`);
      if (p.taxa) msgs.push(`Cobrar do paciente: <b>${brl(cobra)}</b>${p.parcelas > 1 ? ` em ${p.parcelas}x de ${brl(cobra / p.parcelas)}` : ""} (inclui ${brl(p.taxa)} da m\xE1quina).`);
      else if (p.parcelas > 1) msgs.push(`${p.parcelas}x de ${brl(vf / p.parcelas)}.`);
      if (p.sessoes) msgs.push(`Cada sess\xE3o vale ${brl(sess)}. No Studio, a sala (${fmtN(salaPct, 2)}% = ${brl(sess * salaPct / 100)}) \xE9 descontada do repasse da cl\xEDnica a cada sess\xE3o realizada.`);
      if (!isNew) msgs.push(`Uso: ${u.usadas} realizada${u.usadas === 1 ? "" : "s"}, ${u.agendadas} agendada${u.agendadas === 1 ? "" : "s"}, ${Math.max(0, p.sessoes - u.usadas - u.agendadas)} restante${p.sessoes - u.usadas - u.agendadas === 1 ? "" : "s"}.`);
      const n = g("pk-note");
      n.innerHTML = msgs.join("<br>");
      n.className = "note" + (extra ? " warn" : "");
    };
    document.querySelectorAll("#pk-n,#pk-v,#pk-desc,#pk-taxa,#pk-ini,#pk-fim,#pk-pagoem").forEach((x) => x.addEventListener("input", () => nota()));
    document.querySelectorAll("#pk-forma,#pk-parc,#pk-pago,[data-pk-serv],#pk-enc").forEach((x) => x && x.addEventListener("change", () => nota()));
    nota();
    g("pk-save").onclick = () => {
      ler();
      if (!p.servicos.length) return nota("Escolha pelo menos uma atividade.");
      if (!p.sessoes) return nota("Informe o n\xFAmero de sess\xF5es.");
      if (!valorFinalPac(p)) return nota("Informe o valor do pacote.");
      if (p.fim && p.inicio && p.fim < p.inicio) return nota("A validade termina antes do in\xEDcio.");
      if (!isNew && p.sessoes < u.usadas + u.agendadas) return nota(`J\xE1 existem ${u.usadas + u.agendadas} sess\xF5es usadas ou agendadas neste pacote.`);
      if (isNew) S.pacotes.push(p);
      else S.pacotes[S.pacotes.findIndex((x) => x.id === p.id)] = p;
      save("pacotes");
      closeModal();
      render();
    };
    if (!isNew) g("pk-del").onclick = async () => {
      if (u.usadas + u.agendadas) return nota(`Este pacote tem ${u.usadas + u.agendadas} sess\xF5es usadas ou agendadas. Use “Encerrar pacote” em vez de excluir.`);
      if (!await confirmar("Excluir este pacote? O valor sai do extrato.", "Excluir")) return;
      S.pacotes = S.pacotes.filter((x) => x.id !== p.id);
      save("pacotes");
      closeModal();
      render();
    };
  }
  function modalPac(id) {
    const isNew = !id;
    const p = isNew ? { id: uid(), nome: "", telefone: "", nascimento: "", obs: "", ativo: true, inicio: today(), criadoEm: today() } : __spreadValues({}, pacBy(id));
    if (!p.id) return;
    const origAtual = origemDe(p);
    openModal(`<h2>${isNew ? "Novo cadastro" : esc(p.nome)}</h2>
    <div class="grid2">
      <label class="f span2">Nome completo<input id="p-nome" value="${esc(p.nome)}"></label>
      <label class="f">\xC9<select id="p-cat"><option value="aluno" ${categoriaDe(p) === "aluno" ? "selected" : ""}>Aluno (pilates, funcional)</option><option value="paciente" ${categoriaDe(p) === "paciente" ? "selected" : ""}>Paciente (fisioterapia)</option></select></label>
      <label class="f">De onde vem<select id="p-orig"><option value="">N\xE3o informado</option>${ORIGENS.map(([k, l]) => {
      var _a;
      return `<option value="${k}" ${origAtual === k ? "selected" : ""}>${k === "studio" ? esc(((_a = S.config.locais.find((x) => x.tipo === "studio")) == null ? void 0 : _a.nome) || "Studio") : l}</option>`;
    }).join("")}</select></label>
      <label class="f">Telefone / WhatsApp<input id="p-tel" inputmode="tel" value="${esc(p.telefone)}" placeholder="(11) 99999-9999"></label>
      <label class="f">CPF<input id="p-cpf" inputmode="numeric" value="${esc(p.cpf || "")}" placeholder="000.000.000-00" maxlength="14" data-mask="cpf"></label>
      <label class="f">Data de nascimento<input type="date" id="p-nasc" value="${esc(p.nascimento || "")}"></label>
      <label class="f">Data de in\xEDcio<input type="date" id="p-ini" value="${esc(p.inicio || p.criadoEm || today())}"></label>
      <label class="f">Nota fiscal<select id="p-nf"><option value="auto" ${(p.notaFiscal || "auto") === "auto" ? "selected" : ""}>Escolher em cada agendamento</option><option value="sempre" ${p.notaFiscal === "sempre" ? "selected" : ""}>Sempre emitir</option><option value="nunca" ${p.notaFiscal === "nunca" ? "selected" : ""}>N\xE3o emitir</option></select></label>
      <label class="f span2">Observa\xE7\xF5es cl\xEDnicas e anota\xE7\xF5es<textarea id="p-obs" rows="3">${esc(p.obs)}</textarea></label>
      <label class="check"><input type="checkbox" id="p-ativo" ${p.ativo !== false ? "checked" : ""}>Ativo</label>
      ${isNew ? "" : pacotesHTML(p.id)}
    </div>
    <p class="note warn" id="p-note"></p>
    <div class="modal-actions">${isNew ? "" : '<button class="btn ghost danger" id="p-del" type="button">Excluir</button><button class="btn" id="p-agendar" type="button">Agendar</button>'}<span class="grow"></span><button class="btn" data-close type="button">Cancelar</button><button class="btn primary" id="p-save" type="button">Salvar</button></div>`);
    const g = (id2) => $("#" + id2);
    g("p-save").onclick = () => {
      const nome = g("p-nome").value.trim();
      if (!nome) {
        g("p-note").textContent = "Informe o nome.";
        return;
      }
      Object.assign(p, { nome, telefone: g("p-tel").value.trim(), cpf: g("p-cpf").value.trim(), nascimento: g("p-nasc").value, inicio: g("p-ini").value || p.inicio, categoria: g("p-cat").value, origem: g("p-orig").value, notaFiscal: g("p-nf").value, obs: g("p-obs").value, ativo: g("p-ativo").checked });
      if (isNew) S.pacientes.push(p);
      else {
        const i = S.pacientes.findIndex((x) => x.id === p.id);
        S.pacientes[i] = p;
      }
      save("pacientes");
      closeModal();
      render();
    };
    if (!isNew) {
      g("p-del").onclick = async () => {
        if (!await confirmar(`Excluir ${p.nome}? Os atendimentos j\xE1 registrados continuam no financeiro. Para s\xF3 parar de ver, desmarque \u201CAtivo\u201D.`, "Excluir")) return;
        S.pacientes = S.pacientes.filter((x) => x.id !== p.id);
        save("pacientes");
        closeModal();
        render();
      };
      g("p-agendar").onclick = () => {
        closeModal();
        modalAtend({}).then(() => {
          const sel = $("#f-pac");
          if (sel) {
            sel.value = p.id;
            sel.dispatchEvent(new Event("change"));
          }
        });
      };
    }
  }
  function setPath(obj2, path, val) {
    const ks = path.split(".");
    let o = obj2;
    for (let i = 0; i < ks.length - 1; i++) {
      o = o[ks[i]];
      if (o == null) return;
    }
    o[ks[ks.length - 1]] = val;
  }
  document.addEventListener("click", async (e) => {
    var _a, _b;
    if (e.target.closest("[data-stop]")) return;
    const bAct = e.target.closest("[data-act]");
    if (bAct && Auth.user && ACOES_EDICAO.has(bAct.dataset.act) && !podeEditar()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const cv = e.target.closest("[data-comp-ver]");
    if (cv) {
      verComprovante(cv.dataset.compVer);
      return;
    }
    const cl = e.target.closest("[data-close]");
    if (cl) {
      closeModal();
      return;
    }
    if (e.target.id === "modal") {
      closeModal();
      return;
    }
    const v = e.target.closest("[data-view]");
    if (v && !e.target.closest("[data-act]")) {
      if (!viewPermitida(v.dataset.view)) return;
      S.view = v.dataset.view;
      closeModal();
      render();
      window.scrollTo(0, 0);
      return;
    }
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act, c = S.config;
    if (await authAct(act, b)) return;
    if (carteiraAct(act, b)) return;
    if (act === "reset-all") {
      if (await confirmar("Apagar todos os dados do sistema? N\xE3o d\xE1 para desfazer.", "Apagar tudo")) {
        try {
          await Store.clearAll();
          location.reload();
        } catch (err) {
          setSaveState("err");
        }
      }
      return;
    }
    switch (act) {
      case "reload":
        location.reload();
        break;
      case "novo":
        modalAtend({ hora: b.dataset.hora, localId: b.dataset.local, servicoId: b.dataset.serv, data: S.view === "agenda" ? S.dia : today() });
        break;
      case "edit":
        modalAtend({ id: b.dataset.id });
        break;
      case "desm": {
        const f = findAt(b.dataset.id);
        if (f) {
          const r = await perguntarAntecedencia(f.a);
          if (r == null) break;
          const msg = aplicarDesmarcacao(f.a, r);
          save("m-" + f.mk);
          render();
          escolher(msg, [["ok", "Ok"]]);
        }
        break;
      }
      case "remarcar":
        modalAtend({ remarcar: b.dataset.id, data: today() });
        break;
      case "det-mes":
        modalDetMes(b.dataset.k, b.dataset.mk);
        break;
      case "repasse-receber": {
        const mk = b.dataset.mk, rp = repasseDoMes(mk);
        if (!rp) break;
        openModal(`<h2>Repasse da cl\xEDnica</h2><p class="sub" style="margin-top:0">Atendimentos de ${esc(mesLabel(mk))}. Calculado: <b>${brl(rp.calc)}</b>. Informe o valor que entrou de fato.</p><div class="grid2"><label class="f">Valor recebido (R$)<input type="number" step="0.01" inputmode="decimal" id="rp-v" value="${Math.round(rp.calc * 100) / 100}"></label><label class="f">Data<input type="date" id="rp-d" value="${rp.data <= today() ? rp.data : today()}"></label></div><div class="modal-actions"><span class="grow"></span><button class="btn" data-close type="button">Cancelar</button><button class="btn primary" id="rp-ok" type="button">Confirmar</button></div>`);
        $("#rp-ok").onclick = () => {
          S.months[mk].repasse = { recebido: true, valor: num($("#rp-v").value), recebidoEm: $("#rp-d").value || today(), calculado: Math.round(rp.calc * 100) / 100 };
          save("m-" + mk);
          closeModal();
          render();
        };
        break;
      }
      case "repasse-desfazer": {
        const mk = b.dataset.mk;
        if (!S.months[mk] || !await confirmar("Desfazer o recebimento deste repasse? Ele volta a aparecer como previsto.", "Desfazer")) break;
        delete S.months[mk].repasse;
        save("m-" + mk);
        render();
        break;
      }
      case "novo-pacote":
        modalPacote(b.dataset.pac, null);
        break;
      case "edit-pacote":
        modalPacote(null, b.dataset.id);
        break;
      case "ver-pend":
        S.verPend = !S.verPend;
        render();
        break;
      case "st": {
        const f = findAt(b.dataset.id);
        if (f) {
          f.a.status = b.dataset.st;
          if (f.a.status === "realizado" && (recebeNaHora(f.a) || !num(f.a.valor))) {
            f.a.pago = true;
            if (!f.a.pagoEm) f.a.pagoEm = f.a.data;
          }
          save("m-" + f.mk);
          render();
        }
        break;
      }
      case "dia":
        S.dia = b.dataset.d;
        render();
        break;
      case "semana":
        S.dia = addDays(S.dia, 7 * num(b.dataset.n));
        render();
        break;
      case "hoje":
        S.dia = today();
        render();
        break;
      case "novo-pac":
        modalPac(null);
        break;
      case "edit-pac":
        modalPac(b.dataset.id);
        break;
      case "filtro":
        S.filtroPac = b.dataset.f;
        document.querySelectorAll("[data-act=filtro]").forEach((x) => x.setAttribute("aria-pressed", x === b));
        renderPacList();
        break;
      case "mes-fin":
        S.mesFin = addMonth(S.mesFin, num(b.dataset.n));
        render();
        break;
      case "mes-rel":
        S.mesRel = addMonth(S.mesRel || mkOf(today()), num(b.dataset.n));
        render();
        break;
      case "rel-csv":
        if (verValores() && (S.relAba || "freq") !== "freq") exportTabelaCSV((S.relAba || "relatorio") + "-" + S.mesRel);
        else exportRelCSV();
        break;
      case "rel-det":
        modalRel(b.dataset.t, b.dataset.mk, b.dataset.f || "", b.dataset.k || "");
        break;
      case "rel-pagar": {
        const f = findAt(b.dataset.id);
        if (f) {
          f.a.pago = true;
          f.a.pagoEm = today();
          save("m-" + f.mk);
          render();
          if (S.relDet) modalRel(...S.relDet);
        }
        break;
      }
      case "rel-aba":
        S.relAba = b.dataset.aba;
        S.relPac = "";
        render();
        break;
      case "rel-mes":
        S.mesRel = b.dataset.mk;
        S.relAba = "serv";
        render();
        break;
      case "rel-receb":
        S.mesFin = addMonth(b.dataset.mk, 1);
        S.view = "financeiro";
        render();
        break;
      case "rel-cat":
        S.relCat = b.dataset.c;
        render();
        break;
      case "rel-pac":
        if (b.dataset.aba) S.relAba = b.dataset.aba;
        S.relPac = b.dataset.id || "";
        render();
        window.scrollTo(0, 0);
        break;
      case "mes-meta":
        S.mesMeta = addMonth(S.mesMeta, num(b.dataset.n));
        render();
        break;
      case "clinica-todas": {
        const m = S.months[S.mesFin];
        if (m) {
          m.atendimentos.forEach((a) => {
            var _a2;
            if (ehStudio(a) && stEf(a) === "realizado" && !a.pago) {
              a.pago = true;
              a.forma = a.forma || (((_a2 = formasCfg().find((f) => f.repasse)) == null ? void 0 : _a2.nome) || "Cl\xEDnica");
            }
          });
          save("m-" + S.mesFin);
          render();
        }
        break;
      }
      case "pagar": {
        const f = findAt(b.dataset.id);
        if (f) {
          f.a.pago = true;
          f.a.pagoEm = today();
          save("m-" + f.mk);
          render();
        }
        break;
      }
      case "mens-pagar": {
        const m = S.months[S.mesFin];
        const it = mensalidadesDoMes(S.mesFin).find((x) => x.pac.id === b.dataset.pid);
        if (m && it) {
          m.mensalidades[it.pac.id] = { valor: it.valor, pago: !it.pago, data: today() };
          save("m-" + S.mesFin);
          render();
        }
        break;
      }
      case "csv":
        exportCSV();
        break;
      case "sim-agenda":
        simDaAgenda();
        break;
      case "sim-zerar":
        c.simulacao = {};
        save("config");
        render();
        break;
      case "add-serv":
        c.servicos.push({ id: uid(), nome: "Novo servi\xE7o", grupo: false, duracao: durPadrao(), valor: 0, aluguelTipo: "percent", aluguelValor: num((_a = c.servicos[0]) == null ? void 0 : _a.aluguelValor) || 0, cor: "#3C8F6E", ativo: true });
        c.revisado = true;
        save("config");
        render();
        break;
      case "add-plano":
        c.planos.push({ id: uid(), nome: "Novo plano", aulasSemana: 2, valor: 0 });
        c.revisado = true;
        save("config");
        render();
        break;
      case "add-app":
        c.apps.push({ id: uid(), nome: "Novo aplicativo", valor: 0 });
        c.revisado = true;
        save("config");
        render();
        break;
      case "add-forma": {
        if (!Array.isArray(c.formasPagamento)) c.formasPagamento = JSON.parse(JSON.stringify(FORMAS_PADRAO));
        c.formasPagamento.push({ nome: "Nova forma" });
        save("config");
        render();
        break;
      }
      case "rm-forma": {
        if (!Array.isArray(c.formasPagamento)) c.formasPagamento = JSON.parse(JSON.stringify(FORMAS_PADRAO));
        c.formasPagamento.splice(num(b.dataset.i), 1);
        save("config");
        render();
        break;
      }
      case "add-local":
        c.locais.push({ id: uid(), nome: "Novo local", tipo: "studio" });
        save("config");
        render();
        break;
      case "rm": {
        const arr = c[b.dataset.arr], i = num(b.dataset.i), item = arr[i];
        if (!item) break;
        let uso = 0;
        for (const mk in S.months) uso += S.months[mk].atendimentos.filter((a) => a.servicoId === item.id || a.localId === item.id).length;
        uso += S.pacientes.filter((p) => p.planoId === item.id || p.appId === item.id).length;
        if (!await confirmar(`Remover \u201C${item.nome}\u201D?${uso ? " H\xE1 registros usando este item; eles continuam no hist\xF3rico. Se preferir, apenas desative." : ""}`, "Remover")) break;
        arr.splice(i, 1);
        save("config");
        render();
        break;
      }
      case "add-win": {
        const wd = b.dataset.wd;
        (c.disponibilidade[wd] = c.disponibilidade[wd] || []).push({ localId: (_b = c.locais[0]) == null ? void 0 : _b.id, inicio: "15:00", fim: "21:00" });
        save("config");
        render();
        break;
      }
      case "rm-win": {
        c.disponibilidade[b.dataset.wd].splice(num(b.dataset.i), 1);
        save("config");
        render();
        break;
      }
      case "logo-rm":
        c.perfil.logo = "";
        save("config");
        render();
        break;
      case "tema":
        c.tema = b.dataset.t;
        applyTheme();
        save("config");
        render();
        break;
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("#confirm").hidden) $("#confirm").click();
      else if (!$("#modal").hidden) closeModal();
    }
    if (e.key === "Enter" && e.target.matches("[data-view],[data-act].pcard")) {
      e.target.click();
    }
  });
  const mascaraCPF = (v) => {
    const d = String(v).replace(/\D/g, "").slice(0, 11);
    return d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
  };
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.mask === "cpf") {
      const pos = t.value.length;
      t.value = mascaraCPF(t.value);
      return;
    }
    if (t.id === "busca") {
      S.buscaPac = t.value;
      renderPacList();
    }
    if (t.dataset.sim) {
      const k = t.dataset.sim, v = num(t.value);
      if (v) S.config.simulacao[k] = v;
      else delete S.config.simulacao[k];
      renderSim();
      save("config");
    }
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.id === "forig") {
      S.filtroOrig = t.value;
      renderPacList();
      return;
    }
    if (t.id === "irpara" && t.value) {
      S.dia = t.value;
      render();
      return;
    }
    if (t.dataset.mensval) {
      const m = S.months[S.mesFin];
      if (!m) return;
      const e0 = m.mensalidades[t.dataset.mensval] || {};
      const it = mensalidadesDoMes(S.mesFin).find((x) => x.pac.id === t.dataset.mensval);
      m.mensalidades[t.dataset.mensval] = __spreadProps(__spreadValues({}, e0), { valor: num(t.value), pago: !!(it == null ? void 0 : it.pago) });
      save("m-" + S.mesFin);
      render();
      return;
    }
    if (t.id === "conta-foto" && t.files && t.files[0]) {
      fotoQuadrada(t.files[0]).then(salvarMinhaFoto).catch((e2) => {
        const m = $("#conta-foto-msg");
        if (m) m.textContent = msgErro(e2);
      });
      t.value = "";
      return;
    }
    if (t.id === "logo-in" && t.files && t.files[0]) {
      loadLogo(t.files[0]);
      return;
    }
    if (carteiraChange(t)) return;
    if (t.dataset.forma != null) {
      const c = S.config;
      if (!Array.isArray(c.formasPagamento)) c.formasPagamento = JSON.parse(JSON.stringify(FORMAS_PADRAO));
      const f = c.formasPagamento[num(t.dataset.forma)];
      if (f) {
        if (t.dataset.campo === "repasse") f.repasse = t.checked;
        else f.nome = t.value.trim();
      }
      save("config");
      return;
    }
    if (t.dataset.cfg) {
      const val = t.type === "checkbox" ? t.checked : t.dataset.type === "num" ? num(t.value) : t.value;
      setPath(S.config, t.dataset.cfg, val);
      if (!/^perfil|^metaMensal|^tema/.test(t.dataset.cfg)) S.config.revisado = true;
      save("config");
      if (t.dataset.rerender || /ativo|duracaoAtendimento|intervaloAgenda|locais\.\d+\.tipo/.test(t.dataset.cfg)) render();
    }
  });
  function loadLogo(file) {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 240, sc = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * sc);
        cv.height = Math.round(img.height * sc);
        const cx = cv.getContext("2d");
        cx.drawImage(img, 0, 0, cv.width, cv.height);
        S.config.perfil.logo = cv.toDataURL("image/png");
        save("config");
        render();
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  const Auth = {
    token: null,
    user: null,
    senhaDigitada: "",
    lembrar(t) {
      try {
        if (t) localStorage.setItem("gestao-fisio:token", t);
        else localStorage.removeItem("gestao-fisio:token");
      } catch (e) {
      }
    },
    salvo() {
      try {
        return localStorage.getItem("gestao-fisio:token");
      } catch (e) {
        return null;
      }
    }
  };
  const isAdmin = () => !!(Auth.user && Auth.user.perfil === "admin");
  // Permissão por módulo: "" (sem acesso), "ver" ou "editar". Administrador edita tudo.
  // Usuários antigos com perfil "agenda" (antes da atualização do banco) mantêm as telas de antes.
  const PERM_AGENDA = { inicio: "editar", agenda: "editar", pacientes: "editar", relatorios: "ver" };
  const perm = (mod) => {
    if (!Auth.user) return "";
    if (isAdmin()) return "editar";
    const p = Auth.user.perfil === "agenda" ? PERM_AGENDA : Auth.user.permissoes || {};
    return p[mod] === "editar" || p[mod] === "ver" ? p[mod] : "";
  };
  const podeEditar = (mod = S.view) => mod === "config" && !perm("config") ? true : perm(mod) === "editar";
  // Valores em R$ (Início, relatórios financeiros, pacotes) só para quem acessa Recebimentos.
  const verValores = () => perm("financeiro") !== "";
  const viewPermitida = (v) => v === "config" || perm(v) !== "";
  const msgErro = (e) => String(e && e.message || e || "Erro").replace(/^Exception:\s*/, "");
  function limparCaches() {
    S.months = {};
    S.fmonths = {};
    S.usuarios = null;
    for (const k in loadingM) delete loadingM[k];
    for (const k in loadingF) delete loadingF[k];
  }
  function loginShell(inner) {
    return `<div class="login-card"><div class="login-mark">${emblem()}</div><div class="login-name">${esc(window.NOME_PROFISSIONAL || "Gestão do consultório")}</div><div class="login-sub">Fisioterapeuta</div>${inner}<div class="versao-tag">vers\xE3o v19</div></div>`;
  }
  function telaLogin(msg) {
    closeModal();
    const el = $("#login");
    el.hidden = false;
    el.innerHTML = loginShell(`<div class="stack" style="gap:12px;margin-top:22px;text-align:left">
    <label class="f">Usu\xE1rio<input id="l-user" autocomplete="username" autocapitalize="none" spellcheck="false"></label>
    <label class="f">Senha<input id="l-pass" type="password" autocomplete="current-password"></label>
    <label class="check small"><input type="checkbox" id="l-lembrar" checked>Manter conectado neste aparelho</label>
    <p class="login-msg" id="l-msg">${msg ? esc(msg) : ""}</p>
    <button class="btn primary" id="l-entrar" type="button" style="justify-content:center">Entrar</button></div>`);
    const entrar = async () => {
      const u = $("#l-user").value.trim(), p = $("#l-pass").value;
      const m = $("#l-msg");
      if (!u || !p) {
        m.textContent = "Informe usu\xE1rio e senha.";
        return;
      }
      const b = $("#l-entrar");
      b.disabled = true;
      b.textContent = "Entrando\u2026";
      m.textContent = "";
      try {
        const r = await Store.raw("login", u, p, $("#l-lembrar").checked);
        Auth.token = r.token;
        Auth.user = r;
        Auth.senhaDigitada = p;
        if ($("#l-lembrar").checked) Auth.lembrar(r.token);
        else Auth.lembrar(null);
        if (r.trocar) telaTrocar();
        else iniciar();
      } catch (e) {
        m.textContent = msgErro(e);
        b.disabled = false;
        b.textContent = "Entrar";
      }
    };
    $("#l-entrar").onclick = entrar;
    el.onkeydown = (e) => {
      if (e.key === "Enter") entrar();
    };
    setTimeout(() => $("#l-user") && $("#l-user").focus(), 50);
  }
  function telaTrocar() {
    const el = $("#login");
    el.hidden = false;
    el.innerHTML = loginShell(`<div class="stack" style="gap:12px;margin-top:22px;text-align:left">
    <p style="margin:0">Ol\xE1, ${esc(Auth.user.nome)}. Por seguran\xE7a, crie uma senha nova antes de continuar.</p>
    <label class="f">Nova senha<input id="t-nova" type="password" autocomplete="new-password"></label>
    <label class="f">Repita a nova senha<input id="t-rep" type="password" autocomplete="new-password"></label>
    <p class="small muted" style="margin:0">M\xEDnimo de 6 caracteres.</p>
    <p class="login-msg" id="t-msg"></p>
    <button class="btn primary" id="t-ok" type="button" style="justify-content:center">Salvar e entrar</button></div>`);
    const ok = async () => {
      const n = $("#t-nova").value, r = $("#t-rep").value, m = $("#t-msg");
      if (n.length < 6) {
        m.textContent = "A senha precisa ter pelo menos 6 caracteres.";
        return;
      }
      if (n !== r) {
        m.textContent = "As duas senhas n\xE3o conferem.";
        return;
      }
      $("#t-ok").disabled = true;
      try {
        await Store.call("changePassword", Auth.senhaDigitada, n);
        Auth.senhaDigitada = "";
        Auth.user.trocar = false;
        iniciar();
      } catch (e) {
        m.textContent = msgErro(e);
        $("#t-ok").disabled = false;
      }
    };
    $("#t-ok").onclick = ok;
    el.onkeydown = (e) => {
      if (e.key === "Enter") ok();
    };
    setTimeout(() => $("#t-nova").focus(), 50);
  }
  let expirando = false;
  function sessaoExpirada() {
    if (expirando) return;
    expirando = true;
    Auth.token = null;
    Auth.user = null;
    Auth.lembrar(null);
    S.loaded = false;
    limparCaches();
    telaLogin("Sua sess\xE3o expirou. Entre novamente.");
    setTimeout(() => expirando = false, 500);
  }
  async function sair() {
    const t = Auth.token;
    Auth.token = null;
    Auth.user = null;
    Auth.lembrar(null);
    S.loaded = false;
    limparCaches();
    S.view = "inicio";
    render();
    telaLogin();
    try {
      await Store.raw("logout", t);
    } catch (e) {
    }
  }
  async function salvarMinhaFoto(f) {
    const msg = () => $("#conta-foto-msg");
    try {
      await Store.call("setUserPhoto", Auth.user.usuario, f || null);
      Auth.user.foto = f || "";
      if (S.fotosUsuarios) {
        if (f) S.fotosUsuarios[Auth.user.usuario] = f;
        else delete S.fotosUsuarios[Auth.user.usuario];
      }
      render();
    } catch (e) {
      if (msg()) msg().textContent = /set_user_photo|404|not find|Could not/i.test(msgErro(e)) ? "A foto ainda n\xE3o est\xE1 ativada no banco de dados." : msgErro(e);
    }
  }
  function painelConta() {
    const u = Auth.user || {};
    const fotoConta = `<div class="row" style="gap:14px;margin:4px 0 14px;flex-wrap:nowrap">${avatarHTML(u.nome, u.foto, 56)}<div><div class="small muted" style="margin-bottom:6px">Sua foto (aparece no menu, ao lado do nome)</div><div class="row" style="gap:8px"><label class="btn small" style="cursor:pointer">${u.foto ? "Trocar foto" : "Enviar foto"}<input type="file" accept="image/*" id="conta-foto" hidden></label>${u.foto ? '<button class="btn small ghost danger" type="button" data-act="conta-foto-rm">Remover</button>' : ""}</div><p class="small" id="conta-foto-msg" style="margin:6px 0 0;color:var(--bad, #b42318)"></p></div></div>`;
    return `<section class="panel"><h2>Minha conta</h2>${fotoConta}<p class="sub">${esc(u.nome || "")} \xB7 usu\xE1rio <b>${esc(u.usuario || "")}</b> \xB7 ${u.perfil === "admin" ? "Administrador" : "Acesso personalizado"}</p>${u.perfil === "admin" ? "" : `<p class="small muted" style="margin-top:-6px">${resumoPerm(u.perfil === "agenda" ? PERM_AGENDA : u.permissoes)}</p>`}<div class="row"><button class="btn" data-act="trocar-senha">Trocar minha senha</button><button class="btn ghost danger" data-act="sair">Sair</button></div></section>`;
  }
  function painelUsuarios() {
    if (S.usuarios == null) {
      Store.call("userPhotos").then((f) => {
        S.fotosUsuarios = f || {};
        if (S.view === "config" && S.usuarios) render();
      }).catch(() => {
        S.fotosUsuarios = {};
      });
      Store.call("listUsers").then((l) => {
        S.usuarios = l;
        if (S.view === "config") render();
      }).catch((e) => {
        S.usuarios = [];
        S.usuariosErro = msgErro(e);
        if (S.view === "config") render();
      });
      return `<section class="panel"><h2>Usu\xE1rios e acessos</h2><p class="muted">Carregando\u2026</p></section>`;
    }
    const perf = (x) => x.perfil === "admin" ? '<span class="badge b-mint">Administrador</span>' : `<span class="badge b-info">Personalizado</span><br><span class="small muted">${resumoPerm(x.perfil === "agenda" ? PERM_AGENDA : x.permissoes)}</span>`;
    return `<section class="panel"><div class="row"><h2 class="grow">Usu\xE1rios e acessos</h2><button class="btn small" data-act="novo-usuario">+ Usu\xE1rio</button></div><p class="sub">Administrador v\xEA e edita tudo, inclusive os usu\xE1rios. Nos outros, voc\xEA escolhe m\xF3dulo por m\xF3dulo: sem acesso, s\xF3 visualizar ou editar.</p>${S.usuariosErro ? `<p class="note warn">${esc(S.usuariosErro)}</p>` : ""}<div class="scroll"><table class="tbl"><tbody>${S.usuarios.map((x) => `<tr><td><div class="row" style="gap:10px;flex-wrap:nowrap">${avatarHTML(x.nome, (S.fotosUsuarios || {})[x.usuario], 36)}<div><b>${esc(x.nome)}</b><br><span class="small muted">${esc(x.usuario)}${x.trocar ? " \xB7 vai trocar a senha no pr\xF3ximo acesso" : ""}</span></div></div></td><td>${perf(x)}</td><td class="n"><button class="btn small" data-act="edit-usuario" data-u="${esc(x.usuario)}">Editar</button>${x.usuario !== Auth.user.usuario ? ` <button class="btn small ghost danger" data-act="rm-usuario" data-u="${esc(x.usuario)}">Remover</button>` : ""}</td></tr>`).join("")}</tbody></table></div></section>`;
  }
  const MODULOS_PERM = [["inicio", "In\xEDcio"], ["agenda", "Agenda"], ["pacientes", "Cadastro"], ["financeiro", "Recebimentos"], ["metas", "Metas"], ["relatorios", "Relat\xF3rios"], ["carteira", "Carteira"], ["config", "Configura\xE7\xF5es"]];
  function resumoPerm(p) {
    p = p || {};
    const ed = MODULOS_PERM.filter(([k]) => p[k] === "editar").map((x) => x[1]), vr = MODULOS_PERM.filter(([k]) => p[k] === "ver").map((x) => x[1]);
    return [ed.length ? "Edita: " + ed.join(", ") : "", vr.length ? "S\xF3 visualiza: " + vr.join(", ") : ""].filter(Boolean).join(" \xB7 ") || "Sem acesso a nenhum m\xF3dulo";
  }
  function modalUsuario(id) {
    const novo = !id, x = novo ? { usuario: "", nome: "", perfil: "usuario", permissoes: { inicio: "ver", agenda: "editar", pacientes: "ver" } } : (S.usuarios || []).find((u) => u.usuario === id);
    if (!x) return;
    const pm = x.perfil === "agenda" ? PERM_AGENDA : x.permissoes || {}, adm = x.perfil === "admin";
    const nivel = (k) => adm ? "editar" : pm[k] || "";
    const fotoAtual = novo ? "" : (S.fotosUsuarios || {})[x.usuario] || "";
    let fotoNova;
    openModal(`<h2>${novo ? "Novo usu\xE1rio" : esc(x.nome)}</h2>
    <div class="row" style="gap:14px;margin:4px 0 14px;flex-wrap:nowrap"><span id="u-foto-prev">${avatarHTML(x.nome || "?", fotoAtual, 64)}</span><div><div class="small muted" style="margin-bottom:6px">Foto (aparece no menu, ao lado do nome)</div><div class="row" style="gap:8px"><label class="btn small" style="cursor:pointer">${fotoAtual ? "Trocar foto" : "Enviar foto"}<input type="file" accept="image/*" id="u-foto" hidden></label><button class="btn small ghost danger" type="button" id="u-foto-rm" ${fotoAtual ? "" : "hidden"}>Remover</button></div></div></div>
    <div class="grid2">
    <label class="f">Nome<input id="u-nome" value="${esc(x.nome)}"></label>
    <label class="f">Usu\xE1rio (para entrar)<input id="u-user" value="${esc(x.usuario)}" ${novo ? "" : "disabled"} autocapitalize="none" spellcheck="false" placeholder="ex.: maria"></label>
    <label class="f">${novo ? "Senha" : "Nova senha (deixe vazio para manter)"}<input id="u-senha" type="text" autocomplete="off"></label>
    <label class="check" style="align-self:end"><input type="checkbox" id="u-trocar" checked>Pedir para trocar a senha no primeiro acesso</label></div>
    <h3 style="margin:18px 0 6px">Acesso</h3>
    <label class="check"><input type="checkbox" id="u-admin" ${adm ? "checked" : ""}>Administrador: v\xEA e edita todos os m\xF3dulos e gerencia os usu\xE1rios</label>
    <div id="u-mods" style="margin-top:10px">
      <div class="scroll"><table class="tbl"><thead><tr><th>M\xF3dulo</th><th class="n">Sem acesso</th><th class="n">Visualizar</th><th class="n">Editar</th></tr></thead><tbody>
      ${MODULOS_PERM.map(([k, l]) => `<tr><td>${l}</td>${["", "ver", "editar"].map((v) => `<td class="n"><input type="radio" name="perm-${k}" value="${v}" data-perm="${k}" ${nivel(k) === v ? "checked" : ""} aria-label="${l}: ${v || "sem acesso"}"></td>`).join("")}</tr>`).join("")}
      </tbody></table></div>
      <p class="small muted" style="margin:8px 0 0">Sem acesso a Recebimentos, a pessoa n\xE3o v\xEA valores em R$ no In\xEDcio, nos pacotes nem nos relat\xF3rios financeiros. Sem acesso a Configura\xE7\xF5es, ela v\xEA s\xF3 "Minha conta" para trocar a pr\xF3pria senha.</p>
    </div>
    <p class="note warn" id="u-msg"></p>
    <div class="modal-actions"><span class="grow"></span><button class="btn" data-close type="button">Cancelar</button><button class="btn primary" id="u-save" type="button">Salvar</button></div>`);
    const sync = () => {
      const a = $("#u-admin").checked;
      document.querySelectorAll("#u-mods input").forEach((r) => r.disabled = a);
      $("#u-mods").style.opacity = a ? ".45" : "";
    };
    $("#u-admin").onchange = sync;
    sync();
    const mostraFoto = (f) => {
      $("#u-foto-prev").innerHTML = avatarHTML($("#u-nome").value || x.nome || "?", f, 64);
      $("#u-foto-rm").hidden = !f;
    };
    $("#u-foto").onchange = async (ev) => {
      try {
        fotoNova = await fotoQuadrada(ev.target.files[0]);
        mostraFoto(fotoNova);
        $("#u-msg").textContent = "";
      } catch (e) {
        $("#u-msg").textContent = msgErro(e);
      }
      ev.target.value = "";
    };
    $("#u-foto-rm").onclick = () => {
      fotoNova = "";
      mostraFoto("");
    };
    $("#u-save").onclick = async () => {
      const permissoes = {};
      document.querySelectorAll("#u-mods input[data-perm]:checked").forEach((r) => {
        if (r.value) permissoes[r.dataset.perm] = r.value;
      });
      const admin = $("#u-admin").checked;
      if (!admin && !Object.keys(permissoes).length) {
        $("#u-msg").textContent = "Escolha pelo menos um m\xF3dulo com acesso.";
        return;
      }
      const d = { novo, usuario: novo ? $("#u-user").value.trim().toLowerCase() : x.usuario, nome: $("#u-nome").value.trim(), perfil: admin ? "admin" : "usuario", permissoes, senha: $("#u-senha").value, trocar: $("#u-trocar").checked };
      $("#u-save").disabled = true;
      try {
        await Store.call("saveUser", d);
        if (fotoNova !== void 0 && fotoNova !== fotoAtual) {
          try {
            await Store.call("setUserPhoto", d.usuario, fotoNova || null);
            if (d.usuario === Auth.user.usuario) Auth.user.foto = fotoNova;
          } catch (e) {
            S.usuariosErro = "Usu\xE1rio salvo, mas a foto n\xE3o: " + msgErro(e);
          }
        }
        S.usuarios = null;
        S.fotosUsuarios = null;
        closeModal();
        render();
      } catch (e) {
        $("#u-msg").textContent = msgErro(e);
        $("#u-save").disabled = false;
      }
    };
  }
  function modalSenha() {
    openModal(`<h2>Trocar minha senha</h2><div class="grid2"><label class="f span2">Senha atual<input id="s-at" type="password" autocomplete="current-password"></label><label class="f">Nova senha<input id="s-nv" type="password" autocomplete="new-password"></label><label class="f">Repita a nova senha<input id="s-rp" type="password" autocomplete="new-password"></label></div><p class="note warn" id="s-m"></p><div class="modal-actions"><span class="grow"></span><button class="btn" data-close type="button">Cancelar</button><button class="btn primary" id="s-ok" type="button">Salvar</button></div>`);
    $("#s-ok").onclick = async () => {
      const n = $("#s-nv").value;
      if (n.length < 6) {
        $("#s-m").textContent = "A senha precisa ter pelo menos 6 caracteres.";
        return;
      }
      if (n !== $("#s-rp").value) {
        $("#s-m").textContent = "As duas senhas n\xE3o conferem.";
        return;
      }
      try {
        await Store.call("changePassword", $("#s-at").value, n);
        closeModal();
        alertaOk("Senha alterada.");
      } catch (e) {
        $("#s-m").textContent = msgErro(e);
      }
    };
  }
  function alertaOk(t) {
    escolher(t, [["ok", "Ok"]]);
  }
  async function authAct(act, b) {
    switch (act) {
      case "sair":
        sair();
        return true;
      case "conta-foto-rm":
        salvarMinhaFoto("");
        break;
      case "trocar-senha":
        modalSenha();
        return true;
      case "novo-usuario":
        modalUsuario(null);
        return true;
      case "edit-usuario":
        modalUsuario(b.dataset.u);
        return true;
      case "rm-usuario": {
        const u = b.dataset.u;
        if (!await confirmar(`Remover o acesso de ${u}? A pessoa n\xE3o vai mais conseguir entrar.`, "Remover")) return true;
        try {
          await Store.call("removeUser", u);
          S.usuarios = null;
          render();
        } catch (e) {
          alertaOk(msgErro(e));
        }
        return true;
      }
    }
    return false;
  }
  async function iniciar() {
    if (Auth.user && Auth.user.foto === void 0) {
      Store.call("myPhoto").then((f) => {
        if (Auth.user) {
          Auth.user.foto = f || "";
          renderChrome(S.config || defaultConfig());
        }
      }).catch(() => {
      });
    }
    $("#login").hidden = true;
    $("#login").innerHTML = "";
    S.loaded = false;
    S.loadErr = false;
    limparCaches();
    if (!viewPermitida(S.view)) S.view = "inicio";
    render();
    try {
      const [c, p, fi, pk] = await Promise.all([Store.get("config"), Store.get("pacientes"), perm("carteira") ? Store.get("fin") : Promise.resolve(null), Store.get("pacotes")]);
      S.config = mergeCfg(c);
      S.pacientes = Array.isArray(p == null ? void 0 : p.lista) ? p.lista : [];
      S.pacotes = Array.isArray(pk == null ? void 0 : pk.lista) ? pk.lista : [];
      S.fin = mergeFin(fi);
      applyTheme();
      await ensureMonth(mkOf(today()));
      if (S.months[mkOf(today())]._err) throw new Error("N\xE3o foi poss\xEDvel ler a agenda deste m\xEAs.");
      S.loaded = true;
    } catch (e) {
      if (!Auth.token) return;
      S.config = S.config || defaultConfig();
      S.loadErr = true;
      S.loadMsg = msgErro(e);
    }
    render();
  }
  async function boot() {
    render();
    const t = Auth.salvo();
    if (t) {
      Auth.token = t;
      try {
        Auth.user = await Store.raw("me", t);
        if (Auth.user.trocar) {
          Auth.lembrar(null);
          Auth.token = null;
          Auth.user = null;
          telaLogin();
          return;
        }
        return iniciar();
      } catch (e) {
        Auth.token = null;
        Auth.lembrar(null);
      }
    }
    telaLogin();
  }
  boot();
})();
