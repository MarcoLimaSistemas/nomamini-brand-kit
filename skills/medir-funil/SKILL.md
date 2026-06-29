---
name: medir-funil
description: Lê o banco de eventos (D1) e entrega o relatório do funil da Noma Mini — cliques, conversões, taxa e receita por canal. Use quando pedirem "como está o funil?", "qual canal converte", "métricas", "relatório de vendas", "quantos cliques viraram venda", "ROI por campanha".
user_invocable: true
---

# Medir o funil (D1)

Você consulta o banco de eventos do Worker (`infra/cloudflare/tracker`) e devolve
uma leitura acionável: **qual canal vale o esforço/verba**. Rode os comandos via
`wrangler d1 execute noma_tracking --remote --command "<SQL>"` (na pasta do tracker).

## Consultas prontas

**Funil por canal (a principal):**
```sql
SELECT * FROM funil_por_canal ORDER BY vendas DESC;
```
Já traz cliques, vendas, taxa de conversão, receita e comissão por `ch`.

**Cliques x vendas nos últimos 7 dias:**
```sql
SELECT channel,
       COUNT(*) AS cliques,
       SUM(converted) AS vendas,
       ROUND(100.0*SUM(converted)/COUNT(*),2) AS conv_pct
FROM clicks WHERE created_at > unixepoch()-7*24*3600
GROUP BY channel ORDER BY vendas DESC;
```

**Eventos do funil (volume por etapa):**
```sql
SELECT event_name, COUNT(*) FROM events
WHERE event_time > unixepoch()-7*24*3600
GROUP BY event_name;
```

**Cupom que mais converteu:**
```sql
SELECT coupon, SUM(converted) AS vendas, ROUND(SUM(value),2) AS receita
FROM clicks GROUP BY coupon ORDER BY vendas DESC;
```

## Como interpretar (a parte que importa)
- **Compare canais pela taxa de conversão E pela receita**, não só por cliques: o
  pixel otimiza clique, mas quem paga é a venda (vem do cupom/Shopee).
- Canal com muito clique e zero venda = corte de verba. Canal com conversão alta =
  dobra. É a inteligência de `vendas/inteligencia-de-campanha.md`, agora com dado.
- Se `vendas` está sempre 0 mas você sabe que vendeu: o loop de reconciliação
  (n8n → `/conversion`) não rodou ou o `click_id` não casou. Veja `/conectar-shopee`.

## Saída
Entregue: (1) tabela funil por canal, (2) o canal vencedor e o que cortar, (3) uma
ação concreta pra semana. Se o banco estiver vazio, oriente rodar `/configurar-tracking`.
