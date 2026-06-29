# CLAUDE.md — guia do repositório

Contexto pra sessões do Claude Code neste repo. Leia antes de editar.

## O que é este projeto
Brand kit + **plugin Claude Code** da Noma Mini (moda infantil) para o braço de
vendas por **afiliado Shopee**, mais a **infra de venda automatizada e tracking
ponta-a-ponta** (pasta `infra/`). A compra fecha **dentro do Shopee** — por isso o
tracking é server-side (não há pixel no checkout).

## Mapa rápido
- `context/` — diretrizes de marca (injetadas em toda sessão via hook `SessionStart`).
- `skills/*/SKILL.md` — skills slash-invocáveis (frontmatter: `name`, `description`, `user_invocable: true`).
- `vendas/` — guias do parceiro (onboarding, copy, campanha, MEI). Português, voz da marca.
- `assets/` — criativos **só-produto** (sem criança real nem de IA).
- `infra/` — Worker de tracking (Cloudflare), LP (Pages), n8n, segredos, checklist.
- `juridico/` — modelos (contrato, privacidade/LGPD). Sempre "revisar com advogado".
- `scripts/validate.mjs` — validador do repo (roda na CI).

## Arquitetura do tracking (o essencial)
Um `click_id` first-party costura o funil. Ele é, ao mesmo tempo, o `event_id` do
Meta (dedup pixel×CAPI) e o `sub_id` do Shopee (junção da venda). Fluxo:
`LP (pixel+GA, consentimento) → Worker /go (grava clique + CAPI + redirect) →
Shopee → n8n lê conversionReport → Worker /conversion → Purchase server-side`.
Detalhes e contrato de dados em `infra/README.md` e `infra/EVENTS.md`.

## Convenções que NÃO se quebram
- **Criança real nunca** em Instagram/anúncio (nem de IA) — só produto/manequim.
- **Nenhuma credencial no git.** Segredos via `wrangler secret` / variáveis do n8n /
  keychain do plugin (`sensitive: true`). Ver `infra/SECRETS.md`.
- **Não misturar trilhos**: cupom da marca **ou** afiliado Shopee (nunca os dois).
- Nomes do contrato de dados (`click_id`, `event_id`, `ch`, `cupom`) são iguais em
  Worker, LP, D1 e n8n — mudar exige mudar em todos.
- Português, voz da marca (acolhedora, "🤍"), arquivos com placeholders (`SEU_...`).

## Como validar (sempre antes de commit)
```bash
node scripts/validate.mjs                              # JSON, skills, infra, segredos
cd infra/cloudflare/tracker && node --test             # testes do tracker
npx wrangler deploy --dry-run                           # o Worker compila?
```
Sintaxe de qualquer JS/mjs: `node --check <arquivo>`.

## Git
- Trabalhe na `main` (projeto solo). Commits em PT, prefixo `feat/fix/docs(escopo):`.
- Rode a validação acima antes de commitar. CI (`.github/workflows/ci.yml`) repete.

## Skills de operação da infra
`/configurar-tracking` (deploy), `/conectar-shopee` (fecha o loop), `/medir-funil`
(relatório). As de conteúdo: `/gerar-copy-na-marca`, `/revisar-criativo`, etc.
