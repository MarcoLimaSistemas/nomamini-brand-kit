# Privacidade & tracking (LGPD) — guia do operador

> Modelo, **não** parecer jurídico. Revise com advogado antes de publicar. Cobre o
> que a infra de `infra/` coleta e como ficar em conformidade com a LGPD.

## O que a infra coleta
- **Navegação/medição:** páginas vistas, cliques, origem do anúncio (UTMs, `ch`,
  `fbclid`), identificadores técnicos (`_fbp`, `_fbc`, `ga_client_id`), `click_id`
  first-party.
- **Técnicos:** user-agent, país (via Cloudflare), **IP só em hash** (`sha256(ip+salt)`).
- **Não coletamos** nome, e-mail ou telefone na LP. Se um dia coletar (form/WhatsApp),
  esses campos vão ao Meta **sempre hasheados** (já implementado em `meta.js`).

## Bases legais (LGPD)
- **Medição própria** (gravar clique/evento no D1, sem mandar PII pra terceiro):
  legítimo interesse — proporcional e esperado num funil de venda.
- **Enviar dados ao Meta/Google** (Pixel/CAPI/GA4 com `_fbp`/`_fbc`): depende de
  **consentimento**. Por isso o banner — sem "Aceitar", nada de PII sai pra eles.

## O que já está implementado a favor
- Banner de consentimento na LP; pixel/GA4 só inicializam após "Aceitar".
- `consent: true/false` viaja no beacon; o Worker só manda ao Meta/GA com `consent`.
- IP nunca gravado cru (hash com sal secreto).
- Página de privacidade pública (`infra/cloudflare/pages/privacidade.html`).

## Checklist pra publicar
- [ ] Preencher e-mail do encarregado e data na `privacidade.html`.
- [ ] Link da política visível na LP (já no rodapé).
- [ ] Definir retenção (ex.: limpar `events` > 180 dias) — agende no n8n se quiser.
- [ ] Garantir que `IP_SALT` é secreto e estável (trocar = quebra os hashes antigos).
- [ ] Atender pedidos de exclusão: `DELETE FROM clicks/events WHERE ...` pelo dado
      que o titular informar (ex.: `click_id`).

## Direitos do titular
Acesso, correção, exclusão e revogação de consentimento. Revogar = limpar cookies do
site (volta a perguntar) + pedir exclusão pelo contato da política.
