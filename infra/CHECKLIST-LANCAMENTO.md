# Checklist de lançamento

Marque na ordem. O bloco **A** dá pra fazer **agora, sem CNPJ**. O bloco **B** espera
o MEI. O bloco **C** é o dia do "ligar a verba".

## A) Pré-CNPJ — pode fazer hoje
- [ ] Conta Cloudflare criada + `npx wrangler login`.
- [ ] Worker no ar: `/configurar-tracking` (D1 criado, `schema.sql` aplicado, deploy).
- [ ] Segredos no Worker: `IP_SALT`, `INGEST_KEY` (os outros entram quando tiver as contas).
- [ ] LP publicada no Pages com domínio provisório (`*.pages.dev`).
- [ ] `GET /health` responde `{"ok":true}`.
- [ ] Clique de teste grava no D1 (`/medir-funil` mostra 1 clique).
- [ ] Criativos da 1ª campanha escolhidos e aprovados (`/revisar-criativo`).
- [ ] Links rastreados gerados (`tools/gerar-links.mjs`).
- [ ] Campanha montada **em rascunho/pausada** no Ads Manager.
- [ ] CI verde no GitHub (push na main roda `validate` + testes).
- [ ] Política de privacidade com e-mail de contato preenchido.

## B) Quando o MEI sair
- [ ] CNPJ aberto com CNAE certo (ver `vendas/abrir-mei.md`).
- [ ] Conta de Ads (Meta) no nome do negócio + pixel criado → `META_PIXEL_ID`.
- [ ] `wrangler secret put META_CAPI_TOKEN` (token do pixel).
- [ ] (Opcional) GA4: propriedade + `GA4_MEASUREMENT_ID` + `GA4_API_SECRET`.
- [ ] (Opcional) Shopee Affiliate aprovado → `SHOPEE_APP_ID`/`SHOPEE_SECRET` + n8n (`/conectar-shopee`).
- [ ] Domínio próprio (`nomamini.com`) apontado pro Pages + `ALLOWED_ORIGIN` ajustado.
- [ ] Cupons por canal criados na Shopee (`SEUNOME-ADS/-REEL/-BIO`).

## C) Dia do "ligar a verba"
- [ ] Teste de dedup no Events Manager: browser + server **mesclam** (mesmo `event_id`).
- [ ] Clique real → cai no Shopee → aparece no D1.
- [ ] n8n de reconciliação roda manualmente sem erro (`{casadas, purchase_enviados}`).
- [ ] Campanha sai do rascunho com verba pequena (teste 3 dias, não mexer).
- [ ] Agenda `/medir-funil` semanal (ou um `/loop` pra acompanhar).

## Retenção / manutenção (depois)
- [ ] Definir limpeza de `events` antigos (LGPD) — job no n8n.
- [ ] Rotação de `INGEST_KEY` a cada X meses (ver `SECRETS.md`).
