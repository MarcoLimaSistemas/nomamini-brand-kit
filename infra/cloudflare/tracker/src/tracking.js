// Utilitários de tracking: ids, hashing, parsing de parâmetros, CORS.

// click_id curto e first-party (base36 de 16 chars). Serve de event_id (Meta) e sub_id (Shopee).
export function newClickId() {
  const b = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(b, (x) => x.toString(36).padStart(2, "0")).join("").slice(0, 16);
}

export async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Lê todos os parâmetros de atribuição da query (UTMs, canal, cupom, ids do Meta/GA).
export function parseTracking(params) {
  const g = (k) => params.get(k) || null;
  return {
    channel: g("ch") || g("canal"),
    coupon: g("cupom") || g("coupon"),
    utm_source: g("utm_source"),
    utm_medium: g("utm_medium"),
    utm_campaign: g("utm_campaign"),
    utm_content: g("utm_content"),
    utm_term: g("utm_term"),
    fbclid: g("fbclid"),
    fbp: g("fbp") || g("_fbp"),
    fbc: g("fbc") || g("_fbc"),
    ga_client_id: g("ga_client_id") || g("cid"),
  };
}

// Monta o _fbc a partir do fbclid quando o cookie não veio (formato oficial do Meta).
export function buildFbc(fbclid) {
  if (!fbclid) return null;
  return `fb.1.${Date.now()}.${fbclid}`;
}

export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// CORS liberado só pra origem da LP (ALLOWED_ORIGIN), pra o /collect funcionar do browser.
export function cors(env, resp) {
  const origin = env.ALLOWED_ORIGIN || "*";
  resp.headers.set("Access-Control-Allow-Origin", origin);
  resp.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  resp.headers.set("Access-Control-Allow-Headers", "content-type");
  return resp;
}
