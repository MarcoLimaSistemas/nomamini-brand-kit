# noma-tracker — Worker de tracking

Redirect rastreado pro Shopee + Meta CAPI + GA4 + banco de eventos (D1), tudo
server-side. É o que torna a atribuição possível no modelo afiliado.

## Rotas

| Rota | O que faz |
|---|---|
| `GET /go?u=<shopee>&ch=<canal>&cupom=<cod>&utm_*` | gera `click_id`, grava o clique, dispara CAPI/GA4, redireciona pro Shopee carregando o `click_id` no `sub_id`. **É o destino dos seus CTAs.** |
| `POST /collect` | beacon do browser (PageView/ViewContent/Lead) com o **mesmo `event_id`** do pixel → deduplica. |
| `POST /conversion` | ingest das vendas do Shopee (chamado pelo n8n, autenticado por `INGEST_KEY`). Casa o `click_id` e manda `Purchase` server-side. |
| `GET /stats?dias=30&key=...` | métricas do funil por canal/etapa em JSON (read-only, protegido por `STATS_KEY`). Alimenta o painel. |
| `GET /relatorio?dias=7&key=...` | resumo em **texto pronto** (canal vencedor + o que cortar + A/B). O n8n manda por e-mail toda semana. |
| `GET /health` | healthcheck. |

Além das rotas, um **cron diário** (`triggers.crons` no `wrangler.toml`) roda a
**retenção LGPD**: apaga `events` e cliques não-convertidos além de `RETENTION_DAYS`
(default 180). Cliques convertidos ficam (precisam pra reconciliar comissão).

## Deploy (uma vez)

```bash
cd infra/cloudflare/tracker
npm install

# 1) cria o banco e cola o database_id devolvido no wrangler.toml
npx wrangler d1 create noma_tracking

# 2) cria as tabelas
npm run db:init

# 3) variáveis públicas: edite [vars] no wrangler.toml (pixel, GA4, origem da LP)

# 4) segredos (um por vez, NUNCA no arquivo):
npx wrangler secret put META_CAPI_TOKEN
npx wrangler secret put GA4_API_SECRET
npx wrangler secret put SHOPEE_SECRET      # só se for usar o mint por clique
npx wrangler secret put IP_SALT            # string aleatória longa
npx wrangler secret put INGEST_KEY         # mesma chave que o n8n vai usar

# 5) sobe
npm run deploy
```

Pega a URL do Worker (ex.: `https://noma-tracker.SEU.workers.dev`) e usa nos CTAs:

```
https://noma-tracker.SEU.workers.dev/go?u=https%3A%2F%2Fshopee.com.br%2FPRODUTO&ch=ads&cupom=MARIA-ADS
```

## Ferramentas (`tools/`)
- `gerar-links.mjs` — gera os links `/go` rastreados por canal.
- `smoke.mjs` — smoke test pós-deploy (`npm run smoke`, com `TRACKER`/`STATS_KEY`).
- `apagar-dados.mjs` — gera os comandos de exclusão LGPD por `click_id` ou IP.

## Migrações
`schema.sql` é a base (instalações novas). Mudanças incrementais ficam em
`migrations/` (ex.: `0002_variant.sql` adiciona o A/B testing) — aplique uma vez:
`npx wrangler d1 execute noma_tracking --file=migrations/0002_variant.sql --remote`.

## Testar local

```bash
cp .dev.vars.example .dev.vars   # preenche os segredos
npm run db:init:local
npm run dev
# curl "http://localhost:8787/go?u=https://shopee.com.br/x&ch=teste"
```

## Validar a deduplicação (importante)

1. Põe `META_TEST_EVENT_CODE` no `.dev.vars`/secret.
2. Abre a LP, aceita o consentimento, clica no CTA.
3. No **Events Manager → Testar eventos**: o `InitiateCheckout` do browser e o do
   servidor devem aparecer **mesclados** (mesmo `event_id`). Se aparecerem 2x, o
   `event_id` não está batendo — confira que a LP manda `event_id = click_id`.

## Como a atribuição fecha

O `/go` põe o `click_id` no `sub_id` do Shopee. O fluxo n8n (`../../n8n/`) lê o
`conversionReport`, acha o `click_id` em `utmContent`, casa com o clique no D1 e
manda o **Purchase** pro CAPI com o `fbc/fbp` daquele usuário e o mesmo `event_id`.
Loop fechado, sem pixel no checkout do Shopee.
