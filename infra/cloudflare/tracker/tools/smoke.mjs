#!/usr/bin/env node
// Smoke test pós-deploy: bate nos endpoints do Worker e confere o básico.
// Uso:
//   TRACKER=https://noma-tracker.SEU.workers.dev STATS_KEY=xxx node smoke.mjs
// Não escreve venda nem dispara compra — só /health, um /go de teste e /stats.

const TRACKER = (process.env.TRACKER || "").replace(/\/$/, "");
const STATS_KEY = process.env.STATS_KEY || "";
if (!TRACKER) { console.error("Defina TRACKER=https://...workers.dev"); process.exit(2); }

let fail = 0;
const ok = (m) => console.log("  ✓ " + m);
const no = (m) => { fail++; console.log("  ✗ " + m); };

async function main() {
  // 1) health
  try {
    const r = await fetch(TRACKER + "/health");
    const j = await r.json();
    j.ok ? ok("/health responde ok") : no("/health não retornou ok");
  } catch { no("/health inacessível — Worker está no ar?"); }

  // 2) /go redireciona (302) pra fora, sem seguir o redirect
  try {
    const u = TRACKER + "/go?u=" + encodeURIComponent("https://shopee.com.br/teste-i.1.1") + "&ch=smoke&v=a";
    const r = await fetch(u, { redirect: "manual" });
    const loc = r.headers.get("location") || "";
    (r.status === 302 && loc) ? ok("/go redireciona (302 → " + loc.slice(0, 48) + "…)") : no("/go não redirecionou (status " + r.status + ")");
    r.headers.get("set-cookie")?.includes("nm_cid") ? ok("/go seta cookie nm_cid") : no("/go não setou nm_cid");
  } catch { no("/go falhou"); }

  // 3) /stats (se tiver a chave)
  if (STATS_KEY) {
    try {
      const r = await fetch(TRACKER + "/stats?dias=7&key=" + encodeURIComponent(STATS_KEY));
      const j = await r.json();
      j.ok ? ok("/stats responde (canais: " + (j.por_canal?.length ?? 0) + ")") : no("/stats negou (key errada?)");
    } catch { no("/stats falhou"); }
  } else {
    console.log("  · /stats pulado (defina STATS_KEY pra testar)");
  }

  console.log(fail ? `\n❌ ${fail} verificação(ões) falhou(aram).` : "\n✅ Smoke test passou.");
  process.exit(fail ? 1 : 0);
}
main();
