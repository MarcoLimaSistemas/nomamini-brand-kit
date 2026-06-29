# Taxonomia de eventos (Meta × GA4 × D1)

Um nome de evento, três destinos. O `event_id` (= `click_id`) é o que **deduplica**
o que sai do browser (pixel) e do servidor (CAPI).

| Etapa do funil | Meta (Pixel/CAPI) | GA4 | Origem | Onde dispara |
|---|---|---|---|---|
| Viu a página | `PageView` | `page_view` | browser + server | LP carrega |
| Viu o produto | `ViewContent` | `view_item` | browser + server | LP carrega (após consentir) |
| Clicou no CTA | `Lead` | `generate_lead` | browser | clique na LP |
| Saiu pro Shopee | `InitiateCheckout` | `begin_checkout` | server | Worker `/go` |
| Comprou | `Purchase` | `purchase` | server | n8n → Worker `/conversion` |

## Regras
- **`event_id = click_id`** sempre. Sem isso, browser + server contam 2x.
- `Purchase` é **só server-side** — não há pixel no checkout do Shopee.
- `value`/`currency` (BRL) só existem no `Purchase` (vêm do `conversionReport`).
- `channel` (`ch`) e `coupon` viajam em todos os eventos como `custom_data`/params —
  é o que liga o evento à campanha.

## Parâmetros mínimos por evento
- **Todos:** `event_id`, `event_time`, `channel`, `coupon`.
- **Purchase:** + `value`, `currency`, `order_id` (→ `transaction_id` no GA4).
- **CAPI user_data:** `fbp`, `fbc`, `client_ip_address`, `client_user_agent`;
  PII (em/ph), se houver, **sempre hasheada** (já feito em `tracker/src/meta.js`).

## Onde conferir
- Meta: Events Manager → Testar eventos (use `META_TEST_EVENT_CODE`). Os pares
  browser/server devem aparecer **mesclados**.
- GA4: Tempo real → eventos.
- D1: `SELECT event_name, source, COUNT(*) FROM events GROUP BY 1,2;`
