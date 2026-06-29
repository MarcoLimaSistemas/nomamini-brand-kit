// ============================================================================
// Shopee Affiliate Open API — exemplo: gerar link rastreável + ler conversões
// ----------------------------------------------------------------------------
// Pré-requisitos (do AFILIADO, não da marca):
//   1) Estar no Programa de Afiliados Shopee.
//   2) Pedir as credenciais (App ID + Secret) — a Shopee envia por e-mail (~2 sem).
//   3) Node 18+ (usa fetch e node:crypto nativos).
//
// Rode com as SUAS credenciais em variáveis de ambiente (nunca no código):
//   SHOPEE_APP_ID=... SHOPEE_SECRET=... node gerar-link.js
//
// Doc oficial: https://open-api.affiliate.shopee.com.br/  (Brasil)
// ============================================================================

import crypto from "node:crypto";

const ENDPOINT = "https://open-api.affiliate.shopee.com.br/graphql"; // Brasil
const APP_ID = process.env.SHOPEE_APP_ID;
const SECRET = process.env.SHOPEE_SECRET;

if (!APP_ID || !SECRET) {
  console.error("Defina SHOPEE_APP_ID e SHOPEE_SECRET no ambiente.");
  process.exit(1);
}

// Assinatura oficial: SHA256( AppId + Timestamp + Payload + Secret ) em hex.
// Payload = o corpo JSON EXATO que vai no POST (mesma string, sem reserializar).
function authHeader(payload) {
  const ts = Math.floor(Date.now() / 1000);
  const base = `${APP_ID}${ts}${payload}${SECRET}`;
  const signature = crypto.createHash("sha256").update(base, "utf8").digest("hex");
  return `SHA256 Credential=${APP_ID}, Timestamp=${ts}, Signature=${signature}`;
}

async function call(query) {
  const payload = JSON.stringify({ query }); // string exata usada na assinatura
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(payload),
    },
    body: payload,
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// 1) Gerar link rastreável com subIds (até 5) — o subId carrega a campanha.
//    Use subIds tipo ["ads"], ["reel"], ["bio"] pra separar a inteligência depois.
async function gerarLink(originUrl, subIds = []) {
  const subs = JSON.stringify(subIds);
  const data = await call(`mutation {
    generateShortLink(input: { originUrl: "${originUrl}", subIds: ${subs} }) {
      shortLink
    }
  }`);
  return data.generateShortLink.shortLink;
}

// 2) Relatório de conversão por período (janela ~90 dias). Quebra por subId.
async function conversoes(startUnix, endUnix, limit = 100) {
  const data = await call(`query {
    conversionReport(purchaseTimeStart: ${startUnix}, purchaseTimeEnd: ${endUnix}, limit: ${limit}) {
      nodes {
        conversionId
        orderId
        purchaseTime
        totalCommission
        netCommission
        utmContent          # aqui voltam os subIds que você mandou no link
        campaignType
      }
      pageInfo { scrollId }   # scrollId expira em ~30s — use na próxima página
    }
  }`);
  return data.conversionReport;
}

// --- exemplo de uso ---
const link = await gerarLink(
  "https://shopee.com.br/SEU-PRODUTO-i.123.456",
  ["ads"], // tag de campanha -> vira inteligência no conversionReport
);
console.log("Link de afiliado:", link);

const fim = Math.floor(Date.now() / 1000);
const ini = fim - 30 * 24 * 3600; // últimos 30 dias
const rel = await conversoes(ini, fim);
console.log("Conversões:", JSON.stringify(rel.nodes, null, 2));
