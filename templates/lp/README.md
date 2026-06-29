# Landing page do parceiro (template)

Uma página pronta pra você mandar tráfego pago e levar pra Shopee com o **seu
cupom**. Já vem na identidade da marca. Sobe em qualquer host grátis em ~5 min.

## 1. Troque 3 valores no `index.html`
Procure e substitua (só estes):
- `SEU_PIXEL_ID` → o pixel da **sua** conta de anúncios (aparece 1x no script do pixel).
- `SEU_LINK_SHOPEE` → o link do produto na Shopee (com a sua atribuição/cupom).
- `SEU_CODIGO` → o seu cupom de parceiro. **Se esta LP recebe seu tráfego pago,
  use o sub-código do anúncio** (ex.: `SEUNOME-ADS`) — assim a marca sabe que essa
  venda veio da campanha paga. Ver `../../vendas/inteligencia-de-campanha.md`.

Troque também a imagem `conjunto-marrom-flatlay.png` se quiser outra cor/peça
(use qualquer uma de `assets/criativos/` — **só-produto**, sem criança).

## 2. Suba num host grátis (escolha um)
- **Cloudflare Pages / Netlify:** arraste a pasta `lp/` no painel → publica sozinho.
- **Carrd / Linktree:** se preferir algo ainda mais simples (cole os textos).
- **Vercel:** `vercel deploy` na pasta.

Pronto — você tem um link tipo `seunome.pages.dev` pra usar no anúncio e na bio.

## 3. O que a página faz
- Mostra a promessa da marca + benefícios + cupom em destaque.
- Botão "Ver na Shopee" leva pro seu link (com seu cupom).
- Dispara o evento **Lead** no **seu pixel** quando clicam no botão — assim sua
  campanha aprende e você pode remarketing.

## Sobre o domínio (importante)
- **Recomendado:** hospede no **seu** domínio/host (acima). Aí o pixel é seu e
  nativo, e a entrega do seu anúncio não depende de mais ninguém.
- A marca **não cede acesso** ao `nomamini.com`. Se um dia rodar uma vanity tipo
  `nomamini.com/p/seunome`, é a **marca quem hospeda e gera** a página — e precisa
  compartilhar o domínio pro seu Business Manager pra seu anúncio entregar.
- De qualquer jeito, a **comissão é atribuída pelo cupom** — não depende do domínio.

## Regras
- Imagem da LP: **só produto/manequim** (nenhuma criança — ela recebe tráfego pago).
- Não altere logo/cores. Não prometa o que a marca não promete.
- Rode `/revisar-criativo` no anúncio que aponta pra essa LP.
