# Comece aqui — parceiro Noma Mini

Bem-vindo(a) ao braço de vendas. Em 6 passos você está pronto pra vender.

## Antes de tudo: qual é o seu modelo (escolha UM)
A Noma Mini trabalha com dois trilhos de atribuição — **você fica em um só**
(misturar = comissão em dobro):

- **🟢 Cupom da marca (padrão, recomendado):** a marca te dá códigos, **a marca te
  paga** a comissão (Pix, via NF) e você vê tudo no seu **extrato**. É o que este
  guia assume. Sem burocracia, sem código.
- **🔵 Afiliado Shopee (avançado):** você se cadastra no Programa de Afiliados
  Shopee, gera **seus links** e **a Shopee te paga**. Pra automatizar (links +
  relatório), tem a API — ver `conectar-api-shopee.md`. Exige aprovação Shopee.

Na dúvida, vá de **Cupom da marca**. O resto deste guia segue por ele.

## 1. Acerte o combinado
- Leia e assine o contrato de parceria (`../juridico/contrato-afiliado-modelo.md`).
- Confirme seus dados de MEI (CNPJ) e o **Pix** pra receber comissão.

## 2. Pegue os seus códigos
- A marca te entrega códigos de cupom — idealmente **um por canal** (`SEUNOME-REEL`,
  `SEUNOME-ADS`, `SEUNOME-BIO`). São eles que atribuem suas vendas **e** te mostram
  qual canal converte. **Use o código do canal em cada lugar.** Sem código, a venda
  não conta. Entenda em `inteligencia-de-campanha.md`.

## 3. Instale o kit no Claude Code
```
/plugin marketplace add MarcoLimaSistemas/nomamini-brand-kit
/plugin install nomamini-brand-kit@nomamini
```
No install, informe seu pixel/conta de Ads e o seu código de cupom.

## 4. Estude o produto (15 min)
- `ficha-de-produto.md` — o que você vende.
- `faq-e-objecoes.md` + `guia-de-tamanhos.md` — pra responder cliente.

## 5. Faça seus 3 primeiros posts
- Use `/gerar-copy-na-marca` e os criativos do kit (`../assets/criativos`).
- Ideias em `ideias-de-conteudo.md`.
- **Rode `/revisar-criativo` em cada um antes de publicar.**

## 6. (Opcional) Campanha paga
- `/montar-campanha` monta o anúncio na **sua** conta, com **sua** verba.
- Quer mandar a conversão de volta? Importe `../templates/n8n-capi-pixel-flow.json`.

---

## Como você recebe
- Comissão sobre as vendas que entraram com o **seu código**, descontados
  cancelamentos/devoluções.
- Você acompanha tudo no **seu link de extrato** (a marca te envia): comissão a
  receber + o que cada campanha converteu. Aí emite a **NF (MEI)** → recebe via **Pix**.

## Regras que protegem você
- Criança real nunca; nenhuma criança em Instagram/anúncio pago.
- Mídia paga é sua (não há reembolso). Não dê lance em "Shopee"/marca, nem
  Google/Bing pro link, nem cloaking.
- Na dúvida sobre um post: rode `/revisar-criativo` ou pergunte à marca.

Bora vender. 🤍
