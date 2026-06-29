// Testes das funções puras de tracking. Roda sem wrangler:  node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { newClickId, sha256, parseTracking, buildFbc } from "../src/tracking.js";

test("newClickId: 16 chars, alfanumérico, único", () => {
  const a = newClickId();
  const b = newClickId();
  assert.match(a, /^[0-9a-z]{16}$/);
  assert.notEqual(a, b);
});

test("sha256: hex de 64 chars e determinístico", async () => {
  const h1 = await sha256("1.2.3.4salt");
  const h2 = await sha256("1.2.3.4salt");
  assert.match(h1, /^[0-9a-f]{64}$/);
  assert.equal(h1, h2);
  assert.notEqual(h1, await sha256("outro"));
});

test("buildFbc: formato oficial fb.1.<ts>.<fbclid>", () => {
  assert.equal(buildFbc(null), null);
  const fbc = buildFbc("AbC123");
  assert.match(fbc, /^fb\.1\.\d+\.AbC123$/);
});

test("parseTracking: lê UTMs, canal e cupom (aceita aliases)", () => {
  const p = new URLSearchParams(
    "ch=ads&cupom=MARIA-ADS&utm_source=ig&utm_medium=cpc&fbclid=xyz&cid=12.34"
  );
  const t = parseTracking(p);
  assert.equal(t.channel, "ads");
  assert.equal(t.coupon, "MARIA-ADS");
  assert.equal(t.utm_source, "ig");
  assert.equal(t.fbclid, "xyz");
  assert.equal(t.ga_client_id, "12.34");
  assert.equal(t.utm_term, null);
});

test("parseTracking: aliases canal/coupon (canal, coupon)", () => {
  const t = parseTracking(new URLSearchParams("canal=reel&coupon=JOAO-REEL"));
  assert.equal(t.channel, "reel");
  assert.equal(t.coupon, "JOAO-REEL");
});

test("parseTracking: variante default 'a' e lê ?v=", () => {
  assert.equal(parseTracking(new URLSearchParams("")).variant, "a");
  assert.equal(parseTracking(new URLSearchParams("v=b")).variant, "b");
});
