# Roadmap pós-CNPJ — as alavancas que esperam o MEI

Estas features **valem mais em receita**, mas dependem de conta de Ads / WhatsApp
Business no nome do negócio (logo, do CNPJ). Ficam aqui **desenhadas e prontas pra
ligar** — quando o MEI sair, é configurar, não construir do zero.

## 1. Captura de lead + WhatsApp (CTWA) — maior alavanca
**O que é:** em vez de mandar direto pro Shopee, um passo de WhatsApp/lead. Cria
lista própria (não depende de pixel/cookie) e aquece quem ainda não comprou.

**O que precisa do CNPJ:** WhatsApp Business API (via Meta) ou número Business;
anúncio "Click to WhatsApp" precisa da conta de Ads no negócio.

**Onde pluga na infra de hoje:**
- A LP ganha um campo (nome + WhatsApp) → `POST {tracker}/lead` (endpoint novo,
  pequeno: grava em `leads` no D1 com o `click_id` que já temos).
- n8n: webhook do lead → manda 1ª mensagem (template aprovado) com o link `/go`.
- O `click_id` continua costurando: lead → clique → venda no Shopee.

**Esforço quando ligar:** ~meio dia (endpoint `/lead` + tabela + 1 fluxo n8n).

## 2. Remarketing automático (Custom Audiences)
**O que é:** quem clicou e **não** comprou vira público de remarketing no Meta —
anúncio de lembrete converte barato.

**O que precisa do CNPJ:** conta de Ads + acesso à Marketing API (Custom Audiences).

**Onde pluga:** já guardamos tudo em `clicks` (com `converted=0` e `fbp/fbc`). Um
fluxo n8n (ou cron no Worker) lê os não-convertidos dos últimos N dias e dá
`update_custom_audience_users` no Meta. Os dados de match (fbp/fbc) já existem.

**Esforço quando ligar:** ~meio dia (1 query + 1 chamada à Marketing API).

## 3. Mensagens/relatório no WhatsApp (em vez de e-mail)
O `/relatorio` já existe e devolve texto. Trocar o e-mail por WhatsApp é só mudar o
último nó do fluxo `relatorio-semanal.json` — mas o WhatsApp API pede o número
Business (CNPJ). Pré-CNPJ, use e-mail ou Telegram (não exige CNPJ).

## 4. Conta de Ads "de verdade" + pixel no negócio
Hoje o pixel/CAPI funcionam com qualquer conta. Com o CNPJ, abra a conta de Ads no
**Gerenciador de Negócios** no nome da empresa (separa pessoal de PJ, protege a
conta, habilita verificação de domínio e eventos priorizados). Aí:
- `META_PIXEL_ID` / `META_CAPI_TOKEN` passam a ser os do negócio.
- Verifique o domínio (`nomamini.com`) no Business Manager.

## Ordem sugerida quando o CNPJ sair
1. Conta de Ads no negócio + verificar domínio (base de tudo).
2. Ligar remarketing (#2) — usa dado que já existe, retorno rápido.
3. Captura de lead + WhatsApp (#1) — maior alavanca, mais trabalho.
4. Relatório no WhatsApp (#3) — cosmético, rápido.

> Tudo isso reusa o `click_id` e o D1 que já estão no ar. Nada aqui exige refazer a
> base — só plugar o que o CNPJ destrava. Ver `CHECKLIST-LANCAMENTO.md` bloco B.
