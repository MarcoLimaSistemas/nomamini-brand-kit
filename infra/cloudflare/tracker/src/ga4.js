// GA4 Measurement Protocol — envio server-side de eventos.
// Doc: https://developers.google.com/analytics/devguides/collection/protocol/ga4
//
// IMPORTANTE: eventos server-side só aparecem nos relatórios padrão do GA4 se
// trouxerem `session_id` + `engagement_time_msec`. Sem eles, o evento chega (aparece
// no DebugView/tempo real) mas não gera sessão/engajamento e some dos relatórios.
// Por isso injetamos os dois em TODO evento aqui.

export async function sendGa4Event(env, clientId, name, params = {}, opts = {}) {
  const url =
    `https://www.google-analytics.com/mp/collect` +
    `?measurement_id=${env.GA4_MEASUREMENT_ID}&api_secret=${env.GA4_API_SECRET}`;

  const enriched = {
    engagement_time_msec: 1,
    // session_id estável por usuário: usa o passado, senão deriva do client_id.
    session_id: opts.sessionId || String(clientId || "").replace(/\D/g, "").slice(-10) || "1",
    ...clean(params),
  };

  const body = {
    client_id: clientId,
    // hora correta do evento (server-side pode atrasar); GA aceita até ~72h.
    ...(opts.eventTimeSec ? { timestamp_micros: opts.eventTimeSec * 1_000_000 } : {}),
    events: [{ name, params: enriched }],
  };

  const res = await fetch(url, { method: "POST", body: JSON.stringify(body) });
  return res.ok;
}

function clean(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v !== null && v !== undefined && v !== "") out[k] = v;
  return out;
}
