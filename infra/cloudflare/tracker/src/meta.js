// Meta Conversions API (CAPI) — envio server-side com hashing dos dados pessoais.
// Doc: https://developers.facebook.com/docs/marketing-api/conversions-api
import { sha256 } from "./tracking.js";

const GRAPH = "https://graph.facebook.com/v23.0";

export async function sendMetaEvent(env, e) {
  const user_data = {};
  if (e.fbp) user_data.fbp = e.fbp;
  if (e.fbc) user_data.fbc = e.fbc;
  if (e.ip) user_data.client_ip_address = e.ip;
  if (e.ua) user_data.client_user_agent = e.ua;
  // PII (email/telefone), se houver, vai sempre HASHED em SHA-256, normalizada
  // conforme a doc da Meta (senão o hash não casa e o match quality vai a zero).
  if (e.email) user_data.em = [await sha256(normEmail(e.email))];
  if (e.phone) user_data.ph = [await sha256(normPhone(e.phone))];   // E.164 sem '+', só dígitos
  if (e.country) user_data.country = [await sha256(normCountry(e.country))]; // ISO-2 minúsculo
  if (e.external_id) user_data.external_id = [await sha256(String(e.external_id).trim().toLowerCase())];

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

export const normEmail = (s) => String(s).trim().toLowerCase();
// telefone: só dígitos com código do país, sem '+', espaços, parênteses ou hífens.
export const normPhone = (s) => String(s).replace(/\D/g, "").replace(/^0+/, "");
// país: código ISO 3166-1 alpha-2 (2 letras), minúsculo.
export const normCountry = (s) => String(s).trim().toLowerCase().slice(0, 2);
function cleanup(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v !== null && v !== undefined && v !== "") out[k] = v;
  return out;
}
