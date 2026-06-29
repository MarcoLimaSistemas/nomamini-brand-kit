// ============================================================================
// Noma Mini — Worker de tracking (Cloudflare)
// Rotas:
//   GET  /go       redireciona pro Shopee gravando o clique + CAPI server-side
//   POST /collect  beacon do browser (PageView/ViewContent/Lead) -> CAPI dedup
//   POST /conversion  ingest das vendas Shopee (n8n) -> Purchase server-side
//   GET  /stats    métricas do funil por canal (protegido por STATS_KEY)
//   GET  /health   healthcheck
// Cron: retenção LGPD (apaga eventos/cliques antigos) — ver scheduled().
// Contrato de dados: ver ../../README.md ("Contrato de dados").
// ============================================================================

import { newClickId, sha256, parseTracking, buildFbc, json, cors } from "./tracking.js";
import { sendMetaEvent } from "./meta.js";
import { sendGa4Event } from "./ga4.js";
import { mintShopeeLink } from "./shopee.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return cors(env, new Response(null, { status: 204 }));
    if (url.pathname === "/health") return json({ ok: true });
    if (url.pathname === "/go") return handleGo(request, url, env, ctx);
    if (url.pathname === "/collect" && request.method === "POST") return handleCollect(request, env, ctx);
    if (url.pathname === "/conversion" && request.method === "POST") return handleConversion(request, env);
    if (url.pathname === "/stats") return cors(env, await handleStats(url, env));

    return new Response("Noma Mini tracker", { status: 200 });
  },

  // Cron de retenção (LGPD): apaga dados além de RETENTION_DAYS. Agende em wrangler.toml.
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runRetention(env));
  },
};

// ---------------------------------------------------------------------------
// /go — clique de saída pro Shopee (o coração da atribuição server-side)
// ---------------------------------------------------------------------------
async function handleGo(request, url, env, ctx) {
  const t = parseTracking(url.searchParams);
  const dest = url.searchParams.get("u") || env.DEFAULT_SHOPEE_URL;
  if (!dest) return new Response("destino ausente (?u=)", { status: 400 });

  const clickId = newClickId();
  const ip = request.headers.get("cf-connecting-ip") || "";
  const ipHash = ip ? await sha256(ip + (env.IP_SALT || "")) : null;
  const ua = request.headers.get("user-agent") || "";
  const country = request.cf?.country || null;
  const fbc = t.fbc || buildFbc(t.fbclid);

  // 1) grava o clique no D1 (âncora de junção com o Shopee)
  const writeClick = env.DB.prepare(
    `INSERT INTO clicks (click_id, channel, variant, coupon, utm_source, utm_medium, utm_campaign,
       utm_content, utm_term, fbp, fbc, ga_client_id, dest, page, referrer, ip_hash, ua, country)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    clickId, t.channel, t.variant, t.coupon, t.utm_source, t.utm_medium, t.utm_campaign,
    t.utm_content, t.utm_term, t.fbp, fbc, t.ga_client_id, dest,
    request.headers.get("referer") || null, url.searchParams.get("ref") || null,
    ipHash, ua, country
  );

  // 2) destino final: tenta mintar short-link Shopee com sub_id = clickId (junção exata).
  //    Se não houver credencial Shopee, usa o destino direto e carrega o clickId
  //    no parâmetro de sub_id documentado (af_sub1).
  let finalUrl;
  try {
    finalUrl = await mintShopeeLink(dest, clickId, env);
  } catch (e) {
    finalUrl = appendSubId(dest, clickId);
  }

  // 3) eventos server-side: D1 + CAPI + GA4 (em background, sem atrasar o redirect)
  const eventName = env.GO_EVENT_NAME || "InitiateCheckout";
  const eventTime = Math.floor(Date.now() / 1000);
  ctx.waitUntil((async () => {
    await writeClick.run().catch(() => {});
    await logEvent(env, {
      click_id: clickId, event_id: clickId, event_name: eventName, event_time: eventTime,
      source: "server", channel: t.channel, variant: t.variant, coupon: t.coupon, page: dest,
    });
    if (env.META_PIXEL_ID && env.META_CAPI_TOKEN) {
      await sendMetaEvent(env, {
        event_name: eventName, event_id: clickId, event_time: eventTime,
        action_source: "website", event_source_url: request.headers.get("referer") || dest,
        fbp: t.fbp, fbc, ip, ua, country,
        custom_data: { channel: t.channel, variant: t.variant, coupon: t.coupon },
      }).catch(() => {});
    }
    if (env.GA4_MEASUREMENT_ID && env.GA4_API_SECRET && t.ga_client_id) {
      await sendGa4Event(env, t.ga_client_id, "outbound_click", {
        channel: t.channel, variant: t.variant, coupon: t.coupon, click_id: clickId,
      }).catch(() => {});
    }
  })());

  // 4) 302 com cookie first-party do click_id (sobrevive ao Shopee p/ remarketing)
  const headers = new Headers({ Location: finalUrl });
  headers.append(
    "Set-Cookie",
    `nm_cid=${clickId}; Max-Age=7776000; Path=/; Secure; SameSite=Lax`
  );
  return new Response(null, { status: 302, headers });
}

// ---------------------------------------------------------------------------
// /collect — beacon do browser (dispara junto com o pixel, mesmo event_id)
// ---------------------------------------------------------------------------
async function handleCollect(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false }, 400); }

  const clickId = body.click_id || newClickId();
  const eventId = body.event_id || clickId;
  const eventName = body.event_name || "PageView";
  const eventTime = Math.floor(Date.now() / 1000);
  const ip = request.headers.get("cf-connecting-ip") || "";
  const ua = request.headers.get("user-agent") || "";
  const consent = body.consent === true;

  ctx.waitUntil((async () => {
    await logEvent(env, {
      click_id: clickId, event_id: eventId, event_name: eventName, event_time: eventTime,
      source: "browser", channel: body.channel, variant: body.variant, coupon: body.coupon,
      page: body.page, value: body.value, currency: body.currency, raw: JSON.stringify(body),
    });
    // dados pessoais (fbp/fbc) só seguem ao Meta COM consentimento (LGPD)
    if (consent && env.META_PIXEL_ID && env.META_CAPI_TOKEN) {
      await sendMetaEvent(env, {
        event_name: eventName, event_id: eventId, event_time: eventTime,
        action_source: "website", event_source_url: body.page,
        fbp: body.fbp, fbc: body.fbc, ip, ua,
        custom_data: { channel: body.channel, coupon: body.coupon, value: body.value, currency: body.currency },
      }).catch(() => {});
    }
    if (consent && env.GA4_MEASUREMENT_ID && env.GA4_API_SECRET && body.ga_client_id) {
      await sendGa4Event(env, body.ga_client_id, gaName(eventName), {
        channel: body.channel, coupon: body.coupon,
      }).catch(() => {});
    }
  })());

  return cors(env, json({ ok: true, click_id: clickId }));
}

// ---------------------------------------------------------------------------
// /conversion — ingest das vendas do Shopee (chamado pelo n8n). Fecha o loop.
// Casa o click_id (utmContent) com o clique no D1 e manda Purchase server-side.
// ---------------------------------------------------------------------------
async function handleConversion(request, env) {
  if (!env.INGEST_KEY || request.headers.get("x-ingest-key") !== env.INGEST_KEY) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  let body;
  try { body = await request.json(); } catch { return json({ ok: false }, 400); }
  const rows = Array.isArray(body) ? body : [body];

  let matched = 0, sent = 0;
  for (const c of rows) {
    const clickId = c.click_id || c.utm_content || c.utmContent;
    // upsert idempotente da conversão crua
    await env.DB.prepare(
      `INSERT INTO conversions (conversion_id, order_id, click_id, purchase_time, value,
         total_commission, net_commission, utm_content, campaign_type)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON CONFLICT(conversion_id) DO NOTHING`
    ).bind(
      String(c.conversion_id || c.order_id), c.order_id || null, clickId || null,
      c.purchase_time || null, c.value ?? null, c.total_commission ?? null,
      c.net_commission ?? null, clickId || null, c.campaign_type || null
    ).run().catch(() => {});

    if (!clickId) continue;
    const click = await env.DB.prepare(`SELECT * FROM clicks WHERE click_id = ?`).bind(clickId).first().catch(() => null);
    if (!click) continue;
    matched++;
    if (click.converted) continue; // já processado

    await env.DB.prepare(
      `UPDATE clicks SET converted=1, order_id=?, value=?, commission=?, purchase_time=? WHERE click_id=?`
    ).bind(c.order_id || null, c.value ?? null, c.net_commission ?? c.total_commission ?? null, c.purchase_time || null, clickId).run().catch(() => {});

    const eventTime = c.purchase_time || Math.floor(Date.now() / 1000);
    await logEvent(env, {
      click_id: clickId, event_id: clickId, event_name: "Purchase", event_time: eventTime,
      source: "server", channel: click.channel, variant: click.variant, coupon: click.coupon,
      value: c.value, currency: "BRL", raw: JSON.stringify(c),
    });
    if (env.META_PIXEL_ID && env.META_CAPI_TOKEN) {
      await sendMetaEvent(env, {
        event_name: "Purchase", event_id: clickId, event_time: eventTime,
        action_source: "website", event_source_url: click.dest,
        fbp: click.fbp, fbc: click.fbc, country: click.country,
        custom_data: { value: c.value, currency: "BRL", channel: click.channel, coupon: click.coupon },
      }).catch(() => {});
      sent++;
    }
    if (env.GA4_MEASUREMENT_ID && env.GA4_API_SECRET && click.ga_client_id) {
      await sendGa4Event(env, click.ga_client_id, "purchase", {
        value: c.value, currency: "BRL", transaction_id: c.order_id, channel: click.channel,
      }).catch(() => {});
    }
  }
  return json({ ok: true, recebidas: rows.length, casadas: matched, purchase_enviados: sent });
}

// ---------------------------------------------------------------------------
// /stats — métricas do funil por canal (JSON). Protegido por STATS_KEY.
// ---------------------------------------------------------------------------
async function handleStats(url, env) {
  if (env.STATS_KEY && url.searchParams.get("key") !== env.STATS_KEY) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  const dias = Math.min(Number(url.searchParams.get("dias")) || 30, 365);
  const desde = Math.floor(Date.now() / 1000) - dias * 24 * 3600;

  const porCanal = await env.DB.prepare(
    `SELECT channel,
            COUNT(*) AS cliques,
            SUM(converted) AS vendas,
            ROUND(100.0*SUM(converted)/COUNT(*), 2) AS conv_pct,
            ROUND(SUM(COALESCE(value,0)), 2) AS receita,
            ROUND(SUM(COALESCE(commission,0)), 2) AS comissao
     FROM clicks WHERE created_at > ?
     GROUP BY channel ORDER BY vendas DESC`
  ).bind(desde).all().catch(() => ({ results: [] }));

  const porEtapa = await env.DB.prepare(
    `SELECT event_name, COUNT(*) AS total
     FROM events WHERE event_time > ?
     GROUP BY event_name`
  ).bind(desde).all().catch(() => ({ results: [] }));

  const porVariante = await env.DB.prepare(
    `SELECT COALESCE(variant,'a') AS variante,
            COUNT(*) AS cliques,
            SUM(converted) AS vendas,
            ROUND(100.0*SUM(converted)/COUNT(*), 2) AS conv_pct,
            ROUND(SUM(COALESCE(value,0)), 2) AS receita
     FROM clicks WHERE created_at > ?
     GROUP BY variante ORDER BY conv_pct DESC`
  ).bind(desde).all().catch(() => ({ results: [] }));

  return json({
    ok: true, dias,
    por_canal: porCanal.results || [],
    por_etapa: porEtapa.results || [],
    por_variante: porVariante.results || [],
  });
}

// ---------------------------------------------------------------------------
// Retenção LGPD — apaga dados além de RETENTION_DAYS (default 180).
// ---------------------------------------------------------------------------
async function runRetention(env) {
  const dias = Number(env.RETENTION_DAYS) || 180;
  const corte = Math.floor(Date.now() / 1000) - dias * 24 * 3600;
  await env.DB.prepare(`DELETE FROM events WHERE created_at < ?`).bind(corte).run().catch(() => {});
  // mantém cliques convertidos (precisam pra reconciliar comissão); apaga só os não-convertidos antigos
  await env.DB.prepare(`DELETE FROM clicks WHERE created_at < ? AND converted = 0`).bind(corte).run().catch(() => {});
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
async function logEvent(env, e) {
  await env.DB.prepare(
    `INSERT INTO events (click_id, event_id, event_name, event_time, source, channel,
       variant, coupon, page, value, currency, raw)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    e.click_id || null, e.event_id || null, e.event_name, e.event_time, e.source || null,
    e.channel || null, e.variant || null, e.coupon || null, e.page || null, e.value ?? null,
    e.currency || null, e.raw || null
  ).run().catch(() => {});
  if (env.ANALYTICS) {
    env.ANALYTICS.writeDataPoint({
      blobs: [e.event_name, e.channel || "", e.coupon || ""],
      doubles: [e.value || 0],
      indexes: [e.click_id || ""],
    });
  }
}

function appendSubId(dest, clickId) {
  const u = new URL(dest);
  // af_sub1 é o slot de sub_id dos deep links de afiliado da Shopee
  u.searchParams.set("af_sub1", clickId);
  u.searchParams.set("utm_content", clickId);
  return u.toString();
}

function gaName(metaName) {
  const map = { PageView: "page_view", ViewContent: "view_item", Lead: "generate_lead", InitiateCheckout: "begin_checkout" };
  return map[metaName] || "custom_event";
}
