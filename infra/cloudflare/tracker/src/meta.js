// Meta Conversions API (CAPI) — envio server-side com hashing dos dados pessoais.
// Doc: https://developers.facebook.com/docs/marketing-api/conversions-api
import { sha256 } from "./tracking.js";

const GRAPH = "https://graph.facebook.com/v21.0";

export async function sendMetaEvent(env, e) {
  const user_data = {};
  if (e.fbp) user_data.fbp = e.fbp;
  if (e.fbc) user_data.fbc = e.fbc;
  if (e.ip) user_data.client_ip_address = e.ip;
  if (e.ua) user_data.client_user_agent = e.ua;
  // PII (email/telefone), se houver, vai sempre HASHED em SHA-256.
  if (e.email) user_data.em = [await sha256(norm(e.email))];
  if (e.phone) user_data.ph = [await sha256(norm(e.phone))];
  if (e.country) user_data.country = [await sha256(norm(e.country))];

  const payload = {
    data: [
      {
        event_name: e.event_name,
        event_time: e.event_time,
        event_id: e.event_id, // dedup com o pixel do browser
        action_source: e.action_source || "website",
        event_source_url: e.event_source_url,
        user_data,
        custom_data: cleanup(e.custom_data || {}),
      },
    ],
  };
  if (env.META_TEST_EVENT_CODE) payload.test_event_code = env.META_TEST_EVENT_CODE;

  const res = await fetch(
    `${GRAPH}/${env.META_PIXEL_ID}/events?access_token=${env.META_CAPI_TOKEN}`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }
  );
  return res.json();
}

const norm = (s) => String(s).trim().toLowerCase();
function cleanup(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v !== null && v !== undefined && v !== "") out[k] = v;
  return out;
}
