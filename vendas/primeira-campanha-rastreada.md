# Primeira campanha rastreada (passo a passo)

> Junta tudo: os criativos do kit + os **links rastreados** (`/go`) + a medição.
> Pré-requisito: infra no ar (`/configurar-tracking`). Sem CNPJ ainda? Dá pra montar
> tudo em **modo rascunho** e só ligar a verba quando o MEI sair.

## 1. Gere seus links rastreados
Na pasta `infra/cloudflare/tracker/tools`:
```
TRACKER=https://noma-tracker.SEU.workers.dev \
SHOPEE=https://shopee.com.br/SEU-PRODUTO-i.123.456 \
CUPOM_BASE=SEUNOME node gerar-links.mjs
```
Você recebe um link por canal (`ads`, `reel`, `bio`, `parc`). **Use o link do canal
em cada lugar** — é ele que rastreia e leva pro Shopee com o cupom certo.

## 2. Escolha o destino do anúncio
- **Recomendado:** anúncio → **LP** (`infra/cloudflare/pages`) → CTA `/go` → Shopee.
  A LP captura pixel/GA com consentimento e melhora a atribuição.
- Alternativa enxuta: anúncio → link `/go` direto (sem LP). Rastreia o clique, mas
  perde o PageView/ViewContent do browser.

## 3. Os 5 ângulos (já prontos) com o link certo
Use os roteiros de [`angulos-de-anuncio.md`](angulos-de-anuncio.md). Em cada um, o
destino é o **link `ads`** e o cupom é o **`SEUNOME-ADS`**:

| Ângulo | Criativo do kit | Destino |
|---|---|---|
| 1. Problema do tecido | `assets/criativos/video/pushin-camisa.mp4` | link `ads` |
| 2. Liberdade de movimento | `assets/criativos/video/colorswap-grade.mp4` | link `ads` |
| 3. Produto/design | `assets/criativos/video/pan-detalhe.mp4` | link `ads` |
| 4. Voz do pai/mãe | `assets/criativos/conjunto-marrom-flatlay.png` | link `ads` |
| 5. Presente | `assets/criativos/conjunto-grade-4-cores.png` | link `ads` |

Estrutura: 1 conjunto Advantage+ broad, 9:16, os 5 criativos juntos, otimiza por
clique/Lead (a compra fecha na Shopee). Detalhes: `/montar-campanha`.

## 4. Orgânico no mesmo dia
- **Reels:** link `reel` na bio/CTA, cupom `SEUNOME-REEL`. Roteiros em `roteiros-reels.md`.
- **Bio:** link `bio`, cupom `SEUNOME-BIO`. Veja `bio-instagram.md`.

## 5. Antes de publicar (trava de qualidade)
- Rode `/revisar-criativo` em **cada** peça (criança real nunca em IG/anúncio).
- Toggle "conteúdo de IA" ligado se algum elemento for de IA.
- Teste um clique real: abra o link `ads`, veja se cai no Shopee e se o clique
  apareceu no D1 (`/medir-funil`).

## 6. Depois: deixa o dado falar
- Em ~3 dias, rode `/medir-funil`: qual canal converteu, taxa e receita.
- Corta o que não vende, dobra no que vende. Essa é a inteligência de campanha —
  agora com número, não achismo (`inteligencia-de-campanha.md`).

## Modo pré-CNPJ (faça agora)
- Monte os criativos, a LP e os links **hoje**.
- No Ads Manager, deixe a campanha **em rascunho/pausada**.
- Quando o MEI sair (`abrir-mei.md`) e o contrato estiver assinado, é só ligar a verba.
