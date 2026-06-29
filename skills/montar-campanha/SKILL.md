---
name: montar-campanha
description: Guia o parceiro a montar a propria campanha paga da Noma Mini (Meta Ads + pixel + fluxo n8n) usando a conta DELE. Use quando pedirem "como anuncio?", "montar campanha", "configurar pixel", "Advantage+", "fluxo n8n", "como mandar tráfego pago" pra Noma Mini.
---

# Montar a campanha (conta do parceiro)

Voce orienta o parceiro a rodar trafego pago da Noma Mini **na conta dele**, com
o **pixel dele**. Voce NUNCA pede nem usa credenciais da Noma Mini. A marca paga
comissao por venda atribuida pelo codigo de cupom do parceiro — o resto (conta,
pixel, verba) e do parceiro.

## Regras inegociaveis (diga no comeco)
- A **verba e da conta do parceiro** (CPA: a marca so paga comissao por venda).
- **Nunca** dar lance em palavra-chave "Shopee" ou na marca Noma Mini.
- **Nada de Google/Bing search** apontando pro link; **nada de cloaking/redirect**.
- Criativo segue a politica por canal: em anuncio pago, **nenhuma crianca** (nem
  de IA) — so manequim/produto. Rode `/revisar-criativo` antes de subir.
- Todo criativo de IA exige o toggle "conteudo de IA" ligado no Ads Manager.

## Passo a passo

### 1. Estrutura da campanha (padrao Advantage+ broad)
- **1 conjunto broad** (sem segmentacao manual fina) — deixa o algoritmo achar.
- Objetivo: **mensagens (CTWA)** ou trafego pra LP do parceiro que leva ao
  produto na Shopee com o cupom dele. Otimize por conversa/lead, nao por compra
  (a compra fecha na Shopee, fora do pixel).
- **Teste no criativo**, nao no publico: suba **varios criativos** (10+), Reels
  **9:16**, deixe o sistema distribuir verba pro que performar.

### 2. Pixel proprio (do parceiro)
- Use o `meta_pixel_id` configurado no plugin (conta do parceiro).
- Instale o pixel na **LP do parceiro** (nao na Shopee — la nao da pra instalar).
- Evento principal: `Lead` ou `Contact` (clique pro WhatsApp/Shopee). `Purchase`
  real so via o fluxo CAPI abaixo, quando o parceiro confirmar a venda.

### 3. Fluxo n8n + CAPI (opcional, pra quem quer mandar a conversao de volta)
- Importe `${CLAUDE_PLUGIN_ROOT}/templates/n8n-capi-pixel-flow.json` no n8n **do
  parceiro**.
- Troque os placeholders pelos dados DELE:
  - `SEU_PIXEL_ID` → `meta_pixel_id`
  - o token CAPI entra como **credencial do n8n** dele (nunca no arquivo). O
    `meta_capi_token` do plugin esta no keychain so pra referencia local.
- O fluxo recebe a venda confirmada (webhook) e manda um evento `Purchase` pro
  pixel **do parceiro**, melhorando o aprendizado da campanha dele.

### 4. Atribuicao da comissao (nao esquecer)
- Use o `cupom_codigo` do parceiro em TODO criativo e na LP. E so esse codigo no
  pedido Shopee que faz a marca atribuir e pagar a comissao. Sem o codigo, a
  venda nao e contada como sua.

## Saida
- Entregue um plano enxuto e acionavel (estrutura + criativos sugeridos + evento
  de pixel + lembrete do cupom).
- Se faltar `meta_pixel_id` ou `cupom_codigo`, peca pra configurar no plugin antes.
- Sempre feche lembrando: rode `/revisar-criativo` em cada criativo antes de subir.
