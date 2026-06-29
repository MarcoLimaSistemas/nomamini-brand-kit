# LP rastreada — Cloudflare Pages

Landing page com pixel + GA4 + beacon server-side e **consentimento LGPD**. O CTA
não vai direto pro Shopee: vai pro Worker `/go`, que faz o redirect rastreado.

## Configurar
Edite o bloco `window.NOMA` no topo de `index.html`:
- `PIXEL_ID` — seu pixel Meta
- `GA4_ID` — `G-XXXXXXX` (opcional)
- `TRACKER` — URL do Worker (`infra/cloudflare/tracker`)
- `SHOPEE_URL` — link do produto na Shopee

Canal e cupom **vêm da URL** (`?ch=ads&cupom=MARIA-ADS`) — não fixe no arquivo, pra
a mesma LP servir todos os canais e manter a inteligência de campanha.

Copie um criativo só-produto pra cá:
```bash
cp ../../../assets/criativos/conjunto-marrom-flatlay.png .
```

## Publicar
```bash
cd infra/cloudflare/pages
npx wrangler pages deploy . --project-name noma-lp
```
Depois aponte seu domínio (ex.: `nomamini.com`) pro projeto Pages e ajuste o
`ALLOWED_ORIGIN` no `wrangler.toml` do tracker pra essa origem.

## Como o tracking dá certo aqui
- `event_id = click_id` no pixel **e** no beacon `/collect` → o Meta deduplica.
- Pixel/GA4 só sobem após "Aceitar" no banner; o log próprio (sem PII) é interesse legítimo.
- O `/go` recebe `fbp`, `fbclid` e `ga_client_id` pra reconstruir o usuário server-side.
