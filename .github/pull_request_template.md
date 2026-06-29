<!-- Descreva o que muda e por quê. -->

## O que muda


## Checklist
- [ ] Rodei `node scripts/validate.mjs` (verde).
- [ ] Se mexi no Worker: `cd infra/cloudflare/tracker && node --test` e `npx wrangler deploy --dry-run` ok.
- [ ] Nenhuma credencial no diff (tokens via `wrangler secret` / variáveis do n8n).
- [ ] Se mexi em criativo/copy: sem criança real ou de IA em IG/anúncio.
- [ ] Mudou nome do contrato de dados (`click_id`, `event_id`, `ch`...)? Atualizei em Worker, LP, D1 e n8n.
