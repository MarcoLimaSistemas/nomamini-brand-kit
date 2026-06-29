---
name: configurar-tracking
description: Guia passo a passo pra subir a infra de tracking server-side da Noma Mini no Cloudflare (Worker + D1 + LP no Pages) e ligar o pixel/CAPI/GA4. Use quando pedirem "configurar tracking", "subir o worker", "instalar o pixel server-side", "deploy da LP", "rastrear conversão", "fechar o loop de venda".
user_invocable: true
---

# Configurar o tracking ponta-a-ponta

Você guia o parceiro/marca a subir a infra de `infra/` e deixar a venda rastreada
de ponta a ponta. **Nunca** peça nem use credenciais que não sejam do próprio
operador. Tudo é server-side porque a compra fecha na Shopee (sem pixel no checkout).

## Antes de começar (cheque o que já existe)
- Conta Cloudflare (grátis serve) com `wrangler` logado (`npx wrangler login`).
- Pixel Meta + token CAPI (do operador). GA4 é opcional.
- (Opcional avançado) credenciais Shopee Affiliate API — ver `/conectar-shopee`.

## Passo a passo

### 1. Worker + banco (D1)
Em `infra/cloudflare/tracker/`:
```
npm install
npx wrangler d1 create noma_tracking   # cola o database_id no wrangler.toml
npm run db:init                          # cria as tabelas (schema.sql)
```
Edite `[vars]` no `wrangler.toml`: `ALLOWED_ORIGIN` (domínio da LP), `META_PIXEL_ID`,
`GA4_MEASUREMENT_ID`, `SHOPEE_APP_ID`, `DEFAULT_SHOPEE_URL`.

### 2. Segredos (nunca em arquivo)
```
npx wrangler secret put META_CAPI_TOKEN
npx wrangler secret put GA4_API_SECRET
npx wrangler secret put IP_SALT          # string aleatória longa (hash de IP/LGPD)
npx wrangler secret put INGEST_KEY       # guarde: o n8n vai usar a mesma
npx wrangler secret put SHOPEE_SECRET    # só se for usar o mint por clique
npm run deploy
```
Anote a URL do Worker (`https://noma-tracker.SEU.workers.dev`).

### 3. LP no Pages
Em `infra/cloudflare/pages/`: edite `window.NOMA` no `index.html` (PIXEL_ID, GA4_ID,
TRACKER = URL do Worker, SHOPEE_URL). Copie um criativo só-produto e publique:
```
cp ../../../assets/criativos/conjunto-marrom-flatlay.png .
npx wrangler pages deploy . --project-name noma-lp
```

### 4. Loop de conversão (n8n)
Importe `infra/n8n/shopee-reconciliacao-capi.json` e configure as variáveis
(`TRACKER_URL`, `INGEST_KEY`, `SHOPEE_APP_ID/SECRET`). Detalhes em `/conectar-shopee`.

## Validar (não pule)
- `curl https://SEU-worker/health` → `{"ok":true}`.
- Abra a LP, **aceite o consentimento**, clique no CTA. No **Events Manager →
  Testar eventos** (com `META_TEST_EVENT_CODE`): o `InitiateCheckout` do browser e
  do servidor aparecem **mesclados** (mesmo `event_id`). Se duplicar, o `event_id`
  não está batendo.
- `npx wrangler d1 execute noma_tracking --command "SELECT * FROM clicks LIMIT 5" --remote`
  deve mostrar o clique gravado.

## Regras que continuam valendo
- Criança real nunca em IG/anúncio (só produto/manequim). Rode `/revisar-criativo`.
- IP só em hash; pixel/GA só após consentimento. Nada de cloaking.
- Use **um cupom/`ch` por canal** (`-ADS`, `-REEL`, `-BIO`) — é o que dá a
  inteligência de campanha. Veja `vendas/inteligencia-de-campanha.md`.

## Saída
Entregue um checklist do que falta configurar e os comandos exatos. Se faltar
pixel/token, peça antes. Feche lembrando de medir com `/medir-funil`.
