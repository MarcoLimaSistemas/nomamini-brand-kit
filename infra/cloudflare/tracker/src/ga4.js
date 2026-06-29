// GA4 Measurement Protocol — envio server-side de eventos.
// Doc: https://developers.google.com/analytics/devguides/collection/protocol/ga4

export async function sendGa4Event(env, clientId, name, params = {}) {
  const url =
    `https://www.google-analytics.com/mp/collect` +
    `?measurement_id=${env.GA4_MEASUREMENT_ID}&api_secret=${env.GA4_API_SECRET}`;
  const body = {
    client_id: clientId,
    events: [{ name, params: clean(params) }],
  };
  const res = await fetch(url, { method: "POST", body: JSON.stringify(body) });
  return res.ok;
}

function clean(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v !== null && v !== undefined && v !== "") out[k] = v;
  return out;
}
