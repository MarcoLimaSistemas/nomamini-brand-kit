# n8n — automações do funil

## `shopee-reconciliacao-capi.json` (o que fecha o loop)
A cada 6h: lê o `conversionReport` da Shopee Affiliate API, casa o `click_id`
(devolvido em `utmContent`) e empurra cada venda pro Worker `/conversion`, que
manda o `Purchase` server-side pro Meta CAPI e GA4.

### Variáveis de ambiente do n8n (Settings → Variables / env)
| Variável | Valor |
|---|---|
| `SHOPEE_APP_ID` | App ID da Shopee Affiliate |
| `SHOPEE_SECRET` | Secret da Shopee Affiliate (sensível) |
| `TRACKER_URL` | URL do Worker, ex.: `https://noma-tracker.SEU.workers.dev` |
| `INGEST_KEY` | a **mesma** chave que você pôs em `wrangler secret put INGEST_KEY` |

### Importar
n8n → Workflows → Import from File → `shopee-reconciliacao-capi.json` → ative.

### Por que idempotente
O `/conversion` faz `INSERT ... ON CONFLICT DO NOTHING` por `conversion_id` e só
manda `Purchase` na primeira vez que casa o clique. Por isso a janela de 7 dias
pode reprocessar sem contar venda em dobro.

## `../../templates/n8n-capi-pixel-flow.json` (simples, alternativo)
Webhook → Purchase no CAPI. Use só se você tiver uma confirmação de venda própria
(ex.: planilha/manual). No fluxo afiliado, prefira o de reconciliação acima.
