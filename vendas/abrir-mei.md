# Abrir o MEI pra esse projeto (guia prático)

> Guia de orientação, **não** é consultoria contábil/jurídica. Regras, valores e
> CNAEs mudam — **confirme no Portal do Empreendedor e com um contador** antes de
> decidir. Abrir e ter o MEI é grátis (cuidado com sites que cobram).

## Por que você precisa
Pra **emitir nota fiscal da comissão** que a marca te paga (ou que a Shopee te
paga, no trilho afiliado) e receber via Pix de forma regular. Sem CNPJ, não há
nota — e sem nota, o repasse trava. Veja `faq-parceiro.md`.

## O que é o MEI (resumo)
- Pessoa jurídica simplificada pra faturamento até um **teto anual** (confirme o
  valor vigente no Portal do Empreendedor — costuma ser reajustado).
- Paga um valor **fixo mensal** (DAS) que já inclui os impostos — não é % do
  faturamento.
- Pode ter **CNPJ, conta PJ, maquininha e emitir NF**. Não pode ter sócio.

## Atividade (CNAE) — o ponto que mais importa pra você
Seu trabalho aqui é **divulgação/marketing de afiliado** (você promove e direciona
venda; quem entrega é a marca/Shopee). Procure na lista de ocupações do MEI algo do
tipo:
- **Promotor(a) de vendas independente**
- **Agente / assistente de marketing** (publicidade, marketing direto)

Se você também for **revender/estoque próprio** um dia (não é o caso hoje — você não
tem estoque), aí entra um CNAE de comércio varejista. Como hoje é **só afiliação**,
fique no de marketing/promoção de vendas. **Confirme com o contador** qual ocupação
da lista oficial encaixa — só dá pra escolher entre as permitidas ao MEI.

## Passo a passo
1. Tenha em mãos: CPF, título de eleitor (ou recibo do IR), endereço.
2. Acesse o **Portal do Empreendedor** (gov.br) → "Quero ser MEI" → "Formalize-se".
3. Escolha a **ocupação principal** (CNAE de promoção/marketing) e secundárias se quiser.
4. Confirme os dados → sai o **CCMEI** (certificado) com o **CNPJ** na hora.
5. Guarde o CNPJ e configure a **emissão de NF** (a prefeitura/portal indica como;
   serviço de marketing geralmente é **NFS-e** municipal).

## Depois de aberto (não esqueça)
- **DAS mensal:** pague todo mês (boleto no app "MEI" ou Portal). Atraso gera multa.
- **DASN-SIMEI:** uma **declaração anual** do faturamento (uma vez por ano).
- **Conta PJ + Pix da PJ:** peça o repasse da comissão nessa conta.
- **Contrato:** assine o `../juridico/contrato-afiliado-modelo.md` com o seu CNPJ.

## Como isso conecta com a infra
- O CNPJ é o que destrava o **bloco B** do `../infra/CHECKLIST-LANCAMENTO.md`
  (conta de Ads no nome do negócio, pixel, e ligar a verba).
- Enquanto não sai, faça o **bloco A** (Worker, LP, criativos, campanha em rascunho).

## Dúvidas comuns
- **Preciso de MEI só pra postar orgânico sem vender ainda?** Não. Só quando for
  **receber comissão com nota**. Dá pra preparar tudo antes.
- **E o trilho afiliado Shopee?** A Shopee também pede dados fiscais pra pagar; o MEI
  resolve. Não misture os dois trilhos (`comece-aqui.md`).
- **Posso usar meu CPF no começo?** Pra receber repasse recorrente com nota, não — é
  o que o MEI regulariza. Confirme com o contador o melhor momento de abrir.
