// Verifica a conformidade do payload do Meta CAPI com a doc (pós-auditoria).
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { sendMetaEvent, normEmail, normPhone, normCountry } from "../src/meta.js";

const HEX64 = /^[0-9a-f]{64}$/;

test("normPhone: E.164 só dígitos, sem '+', espaços ou símbolos", () => {
  assert.equal(normPhone("+55 (11) 99999-8888"), "5511999998888");
  assert.equal(normPhone("011 3333 4444"), "1133334444"); // tira zeros à esquerda
});

test("normCountry: ISO-2 minúsculo", () => {
  assert.equal(normCountry("BR"), "br");
  assert.equal(normCountry(" Br "), "br");
});

test("normEmail: trim + lowercase", () => {
  assert.equal(normEmail("  Foo@Bar.COM "), "foo@bar.com");
});

// --- payload real enviado ao Graph, com fetch stubado ---
let captured;
const realFetch = globalThis.fetch;
beforeEach(() => {
  captured = null;
  globalThis.fetch = async (url, opts) => {
    captured = { url, body: JSON.parse(opts.body) };
    return { json: async () => ({ events_received: 1 }), ok: true };
  };
});
afterEach(() => { globalThis.fetch = realFetch; });

const env = { META_PIXEL_ID: "PIX123", META_CAPI_TOKEN: "Tok" };

test("endpoint usa Graph API v23 e o pixel/token certos", async () => {
  await sendMetaEvent(env, { event_name: "Purchase", event_id: "abc", event_time: 100, action_source: "other" });
  assert.match(captured.url, /\/v23\.0\/PIX123\/events\?access_token=Tok$/);
});

test("PII vai hasheada; fbp/fbc/ip/ua NÃO", async () => {
  await sendMetaEvent(env, {
    event_name: "Purchase", event_id: "abc", event_time: 100, action_source: "other",
    email: "Foo@Bar.com", phone: "+55 11 99999-8888", country: "BR",
    fbp: "fb.1.1.aaa", fbc: "fb.1.1.bbb", ip: "1.2.3.4", ua: "Mozilla",
  });
  const ud = captured.body.data[0].user_data;
  assert.match(ud.em[0], HEX64);
  assert.match(ud.ph[0], HEX64);
  assert.match(ud.country[0], HEX64);
  // não-hasheados (texto cru):
  assert.equal(ud.fbp, "fb.1.1.aaa");
  assert.equal(ud.fbc, "fb.1.1.bbb");
  assert.equal(ud.client_ip_address, "1.2.3.4");
  assert.equal(ud.client_user_agent, "Mozilla");
});

test("Purchase: action_source passa adiante e value/currency vão em custom_data", async () => {
  await sendMetaEvent(env, {
    event_name: "Purchase", event_id: "abc", event_time: 100, action_source: "other",
    custom_data: { value: 59.9, currency: "BRL", channel: "ads" },
  });
  const ev = captured.body.data[0];
  assert.equal(ev.action_source, "other");
  assert.equal(ev.event_id, "abc");
  assert.equal(ev.custom_data.value, 59.9);
  assert.equal(ev.custom_data.currency, "BRL");
});
