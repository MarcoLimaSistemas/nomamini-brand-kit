-- Migração: adiciona A/B testing (coluna variant) a quem já rodou o schema.sql base.
-- Aplique uma vez:  wrangler d1 execute noma_tracking --file=migrations/0002_variant.sql --remote
-- (Instalações novas já vêm com variant pelo schema.sql — não precisam disto.)

ALTER TABLE clicks ADD COLUMN variant TEXT;
ALTER TABLE events ADD COLUMN variant TEXT;

-- Funil por variante (qual versão da LP/oferta converte mais).
CREATE VIEW IF NOT EXISTS funil_por_variante AS
SELECT
  COALESCE(variant, 'a')                     AS variante,
  channel,
  COUNT(*)                                   AS cliques,
  SUM(converted)                             AS vendas,
  ROUND(100.0 * SUM(converted) / COUNT(*), 2) AS taxa_conversao_pct,
  ROUND(SUM(COALESCE(value, 0)), 2)          AS receita
FROM clicks
GROUP BY variante, channel;
