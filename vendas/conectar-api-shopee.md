# Conectar na API da Shopee (afiliado avançado)

> Pra quem quer **gerar os próprios links rastreáveis** e **puxar as conversões**
> direto da Shopee, via a **Shopee Affiliate Open API**. É opcional e técnico —
> a maioria dos parceiros não precisa (usa os cupons da marca).

## ⚠️ Leia antes: isto é um caminho DIFERENTE
Usar a API significa entrar no **Programa de Afiliados Shopee**: você gera links
de afiliado e **a Shopee rastreia e te paga a comissão** (não a marca via cupom).
**Não combine os dois** — ou você é afiliado Shopee (API/links), ou usa o cupom da
marca. Misturar = comissão em dobro/conflito. Alinhe com a marca qual modelo é o seu.

## Pré-requisitos
1. Estar no **Programa de Afiliados Shopee**.
2. Solicitar as **credenciais** (App ID + Secret) — a Shopee analisa e envia por
   e-mail (pode levar ~2 semanas).
3. Node 18+ (o exemplo usa `fetch` e `node:crypto` nativos).

## Endpoint e autenticação (oficial)
- **GraphQL (Brasil):** `https://open-api.affiliate.shopee.com.br/graphql` (POST)
- **Header:** `Authorization: SHA256 Credential={AppId}, Timestamp={ts}, Signature={sig}`
- **Assinatura:** `sig = SHA256(AppId + Timestamp + Payload + Secret)` em hex, onde
  `Payload` é o corpo JSON exato do POST e `Timestamp` é Unix em segundos.

## Operações principais
- **`generateShortLink(input:{ originUrl, subIds:[…≤5] })`** → cria o link rastreável.
  Os `subIds` são suas tags de campanha (ex.: `["ads"]`, `["reel"]`) — é o que dá
  a **inteligência de campanha**.
- **`conversionReport(purchaseTimeStart, purchaseTimeEnd, limit)`** → vendas,
  comissão (`totalCommission`/`netCommission`) e o `utmContent` (seus subIds).
  Janela de ~90 dias por consulta; pagina com `pageInfo.scrollId` (expira ~30s).
- **`productOfferV2`** → lista de ofertas/produtos com comissão (pra montar conteúdo).

## Exemplo que funciona
Veja [`../templates/shopee-affiliate/gerar-link.js`](../templates/shopee-affiliate/gerar-link.js)
— assina a requisição, gera o link com subId e lê o `conversionReport`. Rode com:
```
SHOPEE_APP_ID=xxx SHOPEE_SECRET=yyy node gerar-link.js
```
Credenciais **suas**, sempre em variável de ambiente — nunca no código nem no git.

## Inteligência de campanha pela API
Mande um `subId` por canal (`ads`, `reel`, `bio`). No `conversionReport` eles voltam
no `utmContent` → você sabe qual canal converteu, igual ao modelo de sub-cupom, só
que reportado pela Shopee. Veja `inteligencia-de-campanha.md`.

## Referências oficiais
- Portal/Doc da Shopee Affiliate Open API (BR): `https://open-api.affiliate.shopee.com.br/`
- Programa de Afiliados Shopee — Termos: na Central de Ajuda da Shopee.

## Regras (continuam valendo)
- Tráfego pago: nada de keyword "Shopee"/marca, nada de Google/Bing search pro link,
  nada de cloaking. Meta/IG pago e orgânico, ok.
- Imagem: nenhuma criança em Instagram/anúncio (só produto/manequim).
