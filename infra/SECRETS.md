# Segredos — inventário e como guardar

Regra de ouro: **nenhum segredo no git**. Públicos (id de pixel, GA4 measurement id,
App ID Shopee) podem ir no `wrangler.toml`/`window.NOMA`. Sensíveis vão em cofre.

## Inventário

| Segredo | Onde vive | Sensível | Como definir |
|---|---|---|---|
| `META_CAPI_TOKEN` | Worker | 🔴 | `wrangler secret put META_CAPI_TOKEN` |
| `GA4_API_SECRET` | Worker | 🔴 | `wrangler secret put GA4_API_SECRET` |
| `SHOPEE_SECRET` | Worker + n8n | 🔴 | `wrangler secret put` / variável do n8n |
| `IP_SALT` | Worker | 🔴 | `wrangler secret put IP_SALT` (string aleatória longa) |
| `INGEST_KEY` | Worker + n8n | 🔴 | `wrangler secret put` (a **mesma** dos dois lados) |
| `META_TEST_EVENT_CODE` | Worker | 🟡 | só em teste; remova depois |
| `META_PIXEL_ID` | Worker `[vars]` + LP | 🟢 público | `wrangler.toml` / `window.NOMA` |
| `GA4_MEASUREMENT_ID` | Worker `[vars]` + LP | 🟢 público | idem |
| `SHOPEE_APP_ID` | Worker `[vars]` + n8n | 🟢 público | idem |

## Onde guardar cada um
- **Worker (produção):** `wrangler secret put NOME` → vai pro cofre da Cloudflare,
  nunca aparece no código nem no dashboard depois de salvo.
- **Worker (local):** `infra/cloudflare/tracker/.dev.vars` (está no `.gitignore`).
  Modelo em `.dev.vars.example`.
- **n8n:** Settings → Variables, ou variáveis de ambiente do host. Nunca cole o
  Secret dentro de um nó exportável.
- **Plugin Claude Code (parceiro):** os tokens do parceiro ficam no **keychain** do
  sistema dele via `sensitive: true` no `plugin.json`. Nunca trafegam pra marca.

## Gerar um `IP_SALT`/`INGEST_KEY` bom
```
openssl rand -hex 32
```

## Rotação
Trocou um token? `wrangler secret put` de novo (sobrescreve) + `npm run deploy`.
Para `INGEST_KEY`, troque nos **dois** lados (Worker e n8n) na mesma janela.

## Se vazou
1. Revogue na origem (Meta/GA/Shopee) imediatamente.
2. Gere um novo e re-suba.
3. `git log -p` pra confirmar que nunca foi commitado; se foi, reescreva o histórico
   (`git filter-repo`) e force-push, e considere o segredo comprometido pra sempre.
