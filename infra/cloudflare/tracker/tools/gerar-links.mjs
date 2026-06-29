#!/usr/bin/env node
// Gera os links rastreados (/go) pra cada canal — cole-os nos anúncios/bio/Reels.
// Cada link carrega o canal e o cupom certo, e passa pelo Worker que rastreia e
// redireciona pro Shopee.
//
// Uso:
//   TRACKER=https://noma-tracker.SEU.workers.dev \
//   SHOPEE=https://shopee.com.br/SEU-PRODUTO-i.123.456 \
//   CUPOM_BASE=MARIA \
//   node gerar-links.mjs
//
// Sem env, usa placeholders (dá pra ver o formato antes de ter o Worker no ar).

const TRACKER = process.env.TRACKER || "https://noma-tracker.SEU.workers.dev";
const SHOPEE = process.env.SHOPEE || "https://shopee.com.br/SEU-PRODUTO";
const CUPOM_BASE = process.env.CUPOM_BASE || "SEUNOME";

// canal -> sufixo do cupom + UTMs sugeridas
const CANAIS = [
  { ch: "ads",  utm: { utm_source: "meta",      utm_medium: "paid"    } },
  { ch: "reel", utm: { utm_source: "instagram", utm_medium: "organic" } },
  { ch: "bio",  utm: { utm_source: "instagram", utm_medium: "bio"     } },
  { ch: "parc", utm: { utm_source: "parceria",  utm_medium: "referral"} },
];

function link({ ch, utm }) {
  const u = new URL(TRACKER.replace(/\/$/, "") + "/go");
  u.searchParams.set("u", SHOPEE);
  u.searchParams.set("ch", ch);
  u.searchParams.set("cupom", `${CUPOM_BASE}-${ch.toUpperCase()}`);
  u.searchParams.set("utm_campaign", "noma-conjunto");
  for (const [k, v] of Object.entries(utm)) u.searchParams.set(k, v);
  return u.toString();
}

console.log(`\nLinks rastreados (cupom base: ${CUPOM_BASE})\n`);
for (const c of CANAIS) {
  console.log(`  ${c.ch.padEnd(5)} ${link(c)}`);
}
console.log(`\nDica: o cupom (${CUPOM_BASE}-ADS, -REEL...) é o que a marca cria como`);
console.log(`Voucher da Loja na Shopee. Um por canal = inteligência de campanha.\n`);
