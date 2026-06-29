# Noma Mini — Brand Kit (plugin Claude Code)

Plugin de marca para os parceiros do braço de vendas da Noma Mini. Quando
instalado, injeta as diretrizes de marca em toda sessão do Claude Code e dá duas
skills para criar conteúdo na voz da marca **sem quebrar a conta**.

## O que vem dentro
- **Diretrizes sempre-ativas** (hook `SessionStart`): tom de voz + política de
  criativos por canal carregam no início de cada sessão.
- **`/revisar-criativo`** — confere um post/anúncio contra as regras antes de publicar.
- **`/gerar-copy-na-marca`** — escreve legenda/anúncio na voz da Noma Mini.
- **`/montar-campanha`** — monta a campanha paga na **sua** conta (pixel e verba
  seus), com o playbook Advantage+ e o template n8n+CAPI.

> Este kit contém **só** marca, tom, regras de criativo e playbook. Não inclui
> dados, preços, contas ou credenciais da Noma Mini.

## Configuração no install (suas credenciais, nunca as da marca)
No install, o plugin pergunta (e guarda **no seu** Claude Code / keychain):
- `meta_ad_account_id`, `meta_pixel_id` — da **sua** conta de Ads.
- `meta_capi_token` — **sensitive**, fica no keychain do seu sistema.
- `cupom_codigo` — o código de parceiro que a Noma Mini te deu (atribui suas vendas).

Nada disso é enviado pra Noma Mini nem versionado no repositório.

## Como instalar
No Claude Code:

```
/plugin marketplace add MarcoLimaSistemas/nomamini-brand-kit
/plugin install nomamini-brand-kit@nomamini
```

Depois é só conversar normalmente — as regras já estão ativas — ou chamar
`/revisar-criativo` e `/gerar-copy-na-marca`.

## Regra de ouro
**Criança real nunca.** No Instagram e em anúncio pago, **nenhuma criança** (nem
de IA) — só manequim ou produto. Na dúvida, rode `/revisar-criativo` antes de postar.

## Estrutura
```
.claude-plugin/
  plugin.json          manifesto do plugin
  marketplace.json     pra /plugin marketplace add
hooks/
  hooks.json           SessionStart -> injeta as diretrizes
context/
  diretrizes-marca.md      as regras sempre-ativas
  identidade-da-marca.md   manifesto, posicionamento, tom, paleta, persona
skills/
  revisar-criativo/SKILL.md     checa post/anúncio contra as regras
  gerar-copy-na-marca/SKILL.md  escreve copy no tom
  montar-campanha/SKILL.md      campanha paga na conta do parceiro
  responder-cliente/SKILL.md    responde dúvida de cliente na voz da marca
  planejar-semana/SKILL.md      monta o calendário da semana a partir do kit
  fazer-minhas-fotos/SKILL.md   brief de foto/vídeo só-produto (celular)
templates/
  lp/                        landing page pronta (troca 3 valores e sobe num host grátis)
  n8n-capi-pixel-flow.json   fluxo CAPI com placeholders (credencial do parceiro)
assets/
  logo/                logo (svg + png)
  criativos/           fotos só-produto + tabela-tamanhos.png + video/ (10 Reels 9:16)
  estaticos/           20 criativos prontos com copy (9×16/4×5/1×1 + A/B)
  templates-social/    fundos prontos (story/feed/status/perfil)
  carrosseis/          7 carrosséis educativos prontos
  cards/               8 cards de frase da marca
  marca-cores-fontes.md  paleta + fontes pra Canva
vendas/
  comece-aqui.md         onboarding do parceiro (6 passos)
  faq-parceiro.md        dúvidas de quem vai divulgar (comissão, MEI, etc.)
  bio-instagram.md       como posicionar seu perfil de parceiro
  historia-da-marca.md   a história da fundadora pra você contar
  ficha-de-produto.md    o que você vende (tecido, cores, tamanhos, preços)
  faq-e-objecoes.md      respostas prontas pro cliente
  guia-de-tamanhos.md    tabelas + resposta pronta (a pergunta nº1)
  scripts-de-conversa.md DM proativo + pré-venda + objeções
  ideias-de-conteudo.md  ganchos e calendário de posts
  inteligencia-de-campanha.md  use 1 código por canal pra saber o que converte
  legendas-prontas.md    legendas copia-e-cola (pra quem não usa o Claude Code)
  roteiros-reels.md      8 roteiros de Reels plano a plano
  roteiros-stories.md    6 sequências de stories prontas
  banco-de-posts.md      10 posts evergreen com legenda + hashtags
  angulos-de-anuncio.md  5 ângulos de copy pra mídia paga
  calendario-de-conteudo.md  ritmo do mês + datas de pico
juridico/
  contrato-afiliado-modelo.md    contrato de parceria (modelo, revisar c/ advogado)
  uso-imagem-ia-afiliado.md      regra de imagem/IA pro parceiro
TERMOS-DE-USO.md                 licença de uso da marca/assets (pode/não pode)
```

**Novo parceiro?** Comece por [`vendas/comece-aqui.md`](vendas/comece-aqui.md).

> Os assets liberados são **só-produto** e os jurídicos são **modelos voltados ao
> parceiro**. Nada de credencial, conta, workflow vivo ou jurídico interno da marca.
