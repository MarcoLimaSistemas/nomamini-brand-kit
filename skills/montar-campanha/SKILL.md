---
name: montar-campanha
description: Guia o parceiro a montar a própria campanha paga da Noma Mini (Meta Ads + pixel + fluxo n8n) usando a conta DELE. Use quando pedirem "como anuncio?", "montar campanha", "configurar pixel", "Advantage+", "fluxo n8n", "como mandar tráfego pago" pra Noma Mini.
---

# Montar a campanha (conta do parceiro)

Você orienta o parceiro a rodar tráfego pago da Noma Mini **na conta dele**, com
o **pixel dele**. Você NUNCA pede nem usa credenciais da Noma Mini. A marca paga
comissão por venda atribuída pelo código de cupom do parceiro — o resto (conta,
pixel, verba) é do parceiro.

## Regras inegociáveis (diga no começo)
- A **verba é da conta do parceiro** (CPA: a marca só paga comissão por venda).
- **Nunca** dar lance em palavra-chave "Shopee" ou na marca Noma Mini.
- **Nada de Google/Bing search** apontando pro link; **nada de cloaking/redirect**.
- Criativo segue a política por canal: em anúncio pago, **nenhuma criança** (nem
  de IA) — só manequim/produto. Rode `/revisar-criativo` antes de subir.
- Todo criativo de IA exige o toggle "conteúdo de IA" ligado no Ads Manager.

## Passo a passo

### 1. Estrutura da campanha (padrão Advantage+ broad)
- **1 conjunto broad** (sem segmentação manual fina) — deixa o algoritmo achar.
- Objetivo: **mensagens (CTWA)** ou tráfego pra LP do parceiro que leva ao
  produto na Shopee com o cupom dele. Otimize por conversa/lead, não por compra
  (a compra fecha na Shopee, fora do pixel).
- **Teste no criativo**, não no público: suba **vários criativos** (10+), Reels
  **9:16**, deixe o sistema distribuir verba pro que performar.

### 2. Pixel próprio (do parceiro)
- Use o `meta_pixel_id` configurado no plugin (conta do parceiro).
- Instale o pixel na **LP do parceiro** (não na Shopee — lá não dá pra instalar).
- Evento principal: `Lead` ou `Contact` (clique pro WhatsApp/Shopee). `Purchase`
  real só via o fluxo CAPI abaixo, quando o parceiro confirmar a venda.

### 3. Fluxo n8n + CAPI (opcional, pra quem quer mandar a conversão de volta)
- Importe `${CLAUDE_PLUGIN_ROOT}/templates/n8n-capi-pixel-flow.json` no n8n **do
  parceiro**.
- Troque os placeholders pelos dados DELE:
  - `SEU_PIXEL_ID` → `meta_pixel_id`
  - o token CAPI entra como **credencial do n8n** dele (nunca no arquivo). O
    `meta_capi_token` do plugin está no keychain só pra referência local.
- O fluxo recebe a venda confirmada (webhook) e manda um evento `Purchase` pro
  pixel **do parceiro**, melhorando o aprendizado da campanha dele.

### 4. Atribuição da comissão (não esquecer)
- Use o `cupom_codigo` do parceiro em TODO criativo e na LP. É só esse código no
  pedido Shopee que faz a marca atribuir e pagar a comissão. Sem o código, a
  venda não é contada como sua.

## Saída
- Entregue um plano enxuto e acionável (estrutura + criativos sugeridos + evento
  de pixel + lembrete do cupom).
- Se faltar `meta_pixel_id` ou `cupom_codigo`, peça pra configurar no plugin antes.
- Sempre feche lembrando: rode `/revisar-criativo` em cada criativo antes de subir.
