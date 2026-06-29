# Infra — funil rastreado ponta-a-ponta (Cloudflare + Shopee Afiliados)

Esta pasta é a **infraestrutura de venda automatizada e tracking** da Noma Mini.
Modelo: **afiliado Shopee** (a compra fecha dentro do Shopee), hospedagem
**Cloudflare**, tracking **server-side completo**.

> A grande sacada: como a compra acontece no Shopee (que não controlamos), **não
> existe pixel de `Purchase` no checkout**. Rastreamos cada usuário até o clique de
> saída com um `click_id` first-party, e a conversão volta pela **API de relatório
> do Shopee Afiliados**, casada pelo `sub_id`. Isso só fecha server-side — por isso
> a stack abaixo.

## O fluxo (o que acontece com cada usuário)

```
Anúncio/Reel/Bio
   │  (utm_*, fbclid, ch=canal, cupom)
   ▼
LP no Cloudflare Pages ──► Pixel PageView/ViewContent (browser, após consentimento)
   │                        + /collect → CAPI server-side (dedup por event_id)
   │  clique no CTA
   ▼
Worker /go  ───────────────────────────────────────────────┐
   • gera click_id first-party (cookie nm_cid)             │
   • grava clique no D1 + Analytics Engine                 │  server-side,
   • CAPI: evento de saída (event_id = click_id)           │  não depende
   • (opcional) mint de short-link Shopee com subIds=[cid] │  de cookie
   • 302 → Shopee com o click_id no sub_id                 │
   ▼                                                        │
Checkout no Shopee  (fora do nosso controle)               │
   ▼                                                        │
n8n agendado: lê conversionReport da Shopee ───────────────┘
   • casa utmContent/sub_id == click_id  → acha o usuário no D1
   • CAPI: Purchase server-side com fbc/fbp + event_id (dedup)
   • GA4 Measurement Protocol: purchase
   • marca o clique como convertido no D1
```

## Componentes

| Pasta | O que é | Onde roda |
|---|---|---|
| `cloudflare/tracker/` | Worker: redirect `/go`, beacon `/collect`, `/health`. Coração do tracking. | Cloudflare Workers |
| `cloudflare/tracker/schema.sql` | Banco de eventos do funil (D1). | Cloudflare D1 |
| `cloudflare/pages/` | LP rastreada (pixel + GA4 + consentimento LGPD). | Cloudflare Pages |
| `n8n/` | Reconciliação Shopee→CAPI/GA4 (fecha o loop de Purchase). | n8n cloud |
| `SECRETS.md` | Inventário de segredos e como guardá-los. | — |

## Contrato de dados (vale pra TODOS os componentes)

Um único identificador costura o funil inteiro. **Não mude os nomes** sem mudar em
todos os lugares.

| Campo | O que é | Onde aparece |
|---|---|---|
| `click_id` | id curto first-party (gerado no `/go`). Chave de junção. | cookie `nm_cid`, D1, `event_id` do Meta, `sub_id` do Shopee |
| `ch` | canal (`ads`, `reel`, `bio`, `parc`) | query da LP/anúncio → D1 |
| `cupom` | código de cupom daquele canal | query → D1 |
| `utm_*` | source/medium/campaign/content/term | query → D1 |
| `fbclid`→`fbc`, `fbp` | click id e browser id do Meta | cookie/D1 → CAPI |
| `ga_client_id` | client id do GA4 | LP → D1 → GA4 MP |
| `event_id` | = `click_id` (ou `click_id:evento`) → **deduplica** pixel × CAPI | LP, Worker, n8n |

**Por que `event_id = click_id`:** o mesmo evento sai pelo browser (pixel) e pelo
servidor (CAPI). O Meta deduplica quando os dois mandam o **mesmo `event_id`**. Sem
isso, você conta a conversão em dobro.

## Ordem de deploy

1. `cloudflare/tracker/` — cria o D1, sobe o Worker, põe os segredos. Veja o README de lá.
2. `cloudflare/pages/` — publica a LP apontando o CTA pro `/go` do Worker.
3. `n8n/` — importa o fluxo de reconciliação e agenda.

Rode a skill **`/configurar-tracking`** que ela te guia por tudo isso passo a passo.

## Privacidade (LGPD)

- IP **nunca** é gravado cru — só `sha256(ip + salt)`.
- Pixel/GA4 no browser só disparam **após consentimento** (banner na LP).
- Eventos server-side de medição própria (clique de saída) são interesse legítimo;
  dados pessoais (fbc/fbp) só seguem ao Meta com base no consentimento.
- Política em [`../juridico/privacidade-e-tracking.md`](../juridico/privacidade-e-tracking.md).
