---
name: conectar-shopee
description: Conecta a Shopee Affiliate Open API ao funil — gera links rastreáveis por clique (sub_id = click_id) e puxa as conversões pro CAPI via n8n, fechando o loop de atribuição. Use quando pedirem "conectar Shopee", "puxar conversões", "API afiliado Shopee", "fechar o loop de venda", "atribuir compra ao usuário".
user_invocable: true
---

# Conectar a Shopee (fechar o loop de atribuição)

Você liga a Shopee Affiliate Open API ao funil pra que a **compra volte casada ao
usuário** que clicou. É o que transforma "trackear até o clique" em "trackear a
venda". Caminho avançado — exige estar no Programa de Afiliados Shopee.

## Pré-requisitos
- Programa de Afiliados Shopee aprovado.
- App ID + Secret (a Shopee envia por e-mail, ~2 semanas). Ver `vendas/conectar-api-shopee.md`.
- Worker e D1 já no ar (`/configurar-tracking`).

## Como o loop fecha (explique assim)
1. No `/go`, o Worker (opcional) chama `generateShortLink(subIds:[click_id])` — cada
   clique vira um link Shopee único carregando o `click_id`. Sem credencial, ele cai
   no fallback `af_sub1=click_id`.
2. A compra fecha na Shopee, que guarda o `click_id` no `utmContent`.
3. O n8n lê o `conversionReport`, acha o `click_id` e empurra pro Worker `/conversion`.
4. O Worker casa com o clique no D1 e manda **Purchase** pro CAPI com o `fbc/fbp`
   daquele usuário + mesmo `event_id`. Loop fechado.

## Configurar

### Worker (mint por clique — opcional, dá junção exata)
```
cd infra/cloudflare/tracker
npx wrangler secret put SHOPEE_SECRET     # o Secret da Shopee
# SHOPEE_APP_ID vai em [vars] no wrangler.toml
npm run deploy
```
Sem isso, a atribuição ainda funciona por canal (`af_sub1` + cupom), só não por
usuário individual.

### n8n (a reconciliação agendada)
1. Importe `infra/n8n/shopee-reconciliacao-capi.json`.
2. Variáveis do n8n: `SHOPEE_APP_ID`, `SHOPEE_SECRET`, `TRACKER_URL`, `INGEST_KEY`
   (a mesma do Worker).
3. Ative. Roda a cada 6h, janela de 7 dias, **idempotente** (não conta em dobro).

## Validar
- Rode o workflow no n8n manualmente → o nó final deve responder
  `{ casadas: N, purchase_enviados: N }`.
- `SELECT converted, COUNT(*) FROM clicks GROUP BY converted;` no D1 mostra vendas casadas.
- No Events Manager, o `Purchase` server-side aparece com o valor da venda.

## Regras (não negociáveis)
- **Não misture trilhos**: ou cupom da marca, ou afiliado Shopee API. Misturar =
  comissão em dobro/conflito (ver `vendas/comece-aqui.md`).
- Credenciais sempre em segredo (`wrangler secret` / variável do n8n), nunca no git.
- Tráfego pago: nada de keyword "Shopee"/marca, nada de cloaking.

## Saída
Entregue o passo que falta + o comando, e confirme se ele quer o mint por clique
(junção exata) ou só a reconciliação por canal. Feche apontando `/medir-funil`.
