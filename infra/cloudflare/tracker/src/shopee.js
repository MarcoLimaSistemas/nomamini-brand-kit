// Shopee Affiliate Open API — mint de short-link com sub_id = click_id por clique.
// É isso que permite a junção EXATA por usuário: o conversionReport devolve o
// click_id em utmContent, e o n8n casa com o clique no D1.
// Doc: https://open-api.affiliate.shopee.com.br/
// Assinatura: SHA256(AppId + Timestamp + Payload + Secret) — igual ao gerar-link.js.

const ENDPOINT = "https://open-api.affiliate.shopee.com.br/graphql";

export async function mintShopeeLink(originUrl, clickId, env) {
  if (!env.SHOPEE_APP_ID || !env.SHOPEE_SECRET) {
    throw new Error("sem credencial Shopee"); // o /go cai no fallback af_sub1
  }
  const query =
    `mutation { generateShortLink(input: { originUrl: "${originUrl}", subIds: ["${clickId}"] }) { shortLink } }`;
  const payload = JSON.stringify({ query });
  const ts = Math.floor(Date.now() / 1000);
  const sig = await sha256Hex(`${env.SHOPEE_APP_ID}${ts}${payload}${env.SHOPEE_SECRET}`);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `SHA256 Credential=${env.SHOPEE_APP_ID}, Timestamp=${ts}, Signature=${sig}`,
    },
    body: payload,
  });
  const j = await res.json();
  const link = j?.data?.generateShortLink?.shortLink;
  if (!link) throw new Error("Shopee não devolveu shortLink");
  return link;
}

async function sha256Hex(text) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
