# Comece aqui (infra) — do zero ao 1º clique rastreado

Em ~20 min você vê a infra **rodando de verdade**, num domínio grátis `.pages.dev`,
**sem CNPJ e sem gastar nada**. É um ensaio: dá pra fazer hoje, antes de tudo.

> O que ainda **não** entra agora (precisa de conta/CNPJ): token CAPI real, GA4 e
> credenciais Shopee. Sem eles, o Worker **grava o clique no D1 e redireciona** —
> que já é o suficiente pra ver o tracking funcionando.

## 0. Pré-requisitos (grátis)
- Conta Cloudflare (plano free serve).
- Node 18+ instalado.

```bash
cd infra/cloudflare/tracker
npm install
npx wrangler login          # abre o navegador, autoriza
```

## 1. Banco (D1)
```bash
npx wrangler d1 create noma_tracking
```
Copie o `database_id` que aparece e cole no `wrangler.toml` (campo
`database_id = "..."`). Depois crie as tabelas:
```bash
npm run db:init
```

## 2. Segredos mínimos pro ensaio
Só dois bastam pra rodar (os de Meta/GA/Shopee ficam pra depois):
```bash
npx wrangler secret put IP_SALT       # cole uma string aleatória longa
npx wrangler secret put STATS_KEY     # invente uma senha (pro painel/relatório)
```
Gere uma string boa com: `openssl rand -hex 32`.

## 3. Sobe o Worker
```bash
npm run deploy
```
Anote a URL (ex.: `https://noma-tracker.SEU.workers.dev`).

## 4. Primeiro clique rastreado
```bash
TRACKER=https://noma-tracker.SEU.workers.dev STATS_KEY=<a-que-voce-criou> npm run smoke
```
Deve dar **✅ Smoke test passou** (health, /go com 302 + cookie, /stats).
Confirme que o clique caiu no banco:
```bash
npx wrangler d1 execute noma_tracking --remote --command "SELECT click_id, channel, created_at FROM clicks ORDER BY created_at DESC LIMIT 5"
```

## 5. (Opcional) LP no ar, grátis
```bash
cd ../pages
cp ../../../assets/criativos/conjunto-marrom-flatlay.png .
# edite window.NOMA no index.html: TRACKER = sua URL; SHOPEE_URL = um link de teste
npx wrangler pages deploy . --project-name noma-lp
```
Abra a URL `.pages.dev`, aceite o consentimento, clique no CTA → cai no destino e
grava o clique. Veja o painel: abra `painel.html`, informe a URL do Worker + a
`STATS_KEY`.

## 6. Gere seus links de divulgação
```bash
cd ../tracker/tools
TRACKER=https://noma-tracker.SEU.workers.dev SHOPEE=https://shopee.com.br/SEU-PRODUTO CUPOM_BASE=SEUNOME node gerar-links.mjs
```

## Pronto. E agora?
- Funcionou? Você já tem **tracking server-side rodando** de graça.
- Quando o **MEI** sair: complete o **bloco B** do [`CHECKLIST-LANCAMENTO.md`](CHECKLIST-LANCAMENTO.md)
  (pixel/CAPI do negócio, GA4, Shopee) e o [`ROADMAP-POS-CNPJ.md`](ROADMAP-POS-CNPJ.md).
- Quer subir uma campanha real? [`../vendas/primeira-campanha-rastreada.md`](../vendas/primeira-campanha-rastreada.md).
- Travou em algo? Rode a skill `/configurar-tracking` que ela te guia.
