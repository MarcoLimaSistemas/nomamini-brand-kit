// Verifica o enriquecimento do GA4 MP (pós-auditoria): session_id +
// engagement_time_msec em todo evento, timestamp_micros server-side.
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { sendGa4Event } from "../src/ga4.js";

let captured;
const realFetch = globalThis.fetch;
beforeEach(() => {
  captured = null;
  globalThis.fetch = async (url, opts) => {
    captured = { url, body: JSON.parse(opts.body) };
    return { ok: true };
  };
});
afterEach(() => { globalThis.fetch = realFetch; });

const env = { GA4_MEASUREMENT_ID: "G-XXX", GA4_API_SECRET: "sec" };

test("todo evento leva engagement_time_msec + session_id", async () => {
  await sendGa4Event(env, "111.222", "outbound_click", { channel: "ads" });
  const ev = captured.body.events[0];
  assert.equal(captured.body.client_id, "111.222");
  assert.ok(ev.params.engagement_time_msec >= 1);
  assert.ok(ev.params.session_id, "session_id presente");
  assert.equal(ev.params.channel, "ads");
});

test("eventos server-side com eventTimeSec viram timestamp_micros", async () => {
  await sendGa4Event(env, "111.222", "purchase", { value: 59.9, currency: "BRL" }, { eventTimeSec: 100 });
  assert.equal(captured.body.timestamp_micros, 100_000_000);
  assert.equal(captured.body.events[0].params.value, 59.9);
});

test("sem eventTimeSec, não manda timestamp_micros (usa hora de chegada)", async () => {
  await sendGa4Event(env, "111.222", "page_view", {});
  assert.equal(captured.body.timestamp_micros, undefined);
});
