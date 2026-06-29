-- ============================================================================
-- Banco de eventos do funil Noma Mini (Cloudflare D1 / SQLite)
-- Aplique com:  wrangler d1 execute noma_tracking --file=schema.sql --remote
-- ============================================================================

-- Um clique de saída = uma linha aqui. É a âncora de junção com o Shopee.
CREATE TABLE IF NOT EXISTS clicks (
  click_id      TEXT PRIMARY KEY,           -- id curto first-party (= sub_id Shopee = event_id Meta)
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  channel       TEXT,                        -- ads | reel | bio | parc
  coupon        TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_content   TEXT,
  utm_term      TEXT,
  fbp           TEXT,
  fbc           TEXT,
  ga_client_id  TEXT,
  dest          TEXT,                        -- url de destino (Shopee)
  page          TEXT,                        -- de onde veio o clique
  referrer      TEXT,
  ip_hash       TEXT,                        -- sha256(ip + salt) — NUNCA o ip cru
  ua            TEXT,
  country       TEXT,
  -- preenchidos na reconciliação (n8n lê o conversionReport do Shopee):
  converted     INTEGER NOT NULL DEFAULT 0,
  order_id      TEXT,
  value         REAL,
  commission    REAL,
  purchase_time INTEGER
);
CREATE INDEX IF NOT EXISTS idx_clicks_channel  ON clicks(channel);
CREATE INDEX IF NOT EXISTS idx_clicks_created  ON clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_converted ON clicks(converted);

-- Cada evento do funil (PageView, ViewContent, Lead, OutboundClick, Purchase...).
CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  click_id      TEXT,
  event_id      TEXT,                        -- dedup pixel × CAPI
  event_name    TEXT NOT NULL,
  event_time    INTEGER NOT NULL,            -- unix segundos
  source        TEXT,                        -- 'browser' | 'server'
  channel       TEXT,
  coupon        TEXT,
  page          TEXT,
  value         REAL,
  currency      TEXT,
  meta_sent     INTEGER NOT NULL DEFAULT 0,  -- 1 quando o CAPI confirmou recebimento
  ga_sent       INTEGER NOT NULL DEFAULT 0,
  raw           TEXT,                        -- JSON do payload original (auditoria)
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_events_click ON events(click_id);
CREATE INDEX IF NOT EXISTS idx_events_name  ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_time  ON events(event_time);

-- Conversões cruas vindas do Shopee Affiliate conversionReport (idempotente por id).
CREATE TABLE IF NOT EXISTS conversions (
  conversion_id    TEXT PRIMARY KEY,
  order_id         TEXT,
  click_id         TEXT,                     -- = utmContent/sub_id devolvido pela Shopee
  purchase_time    INTEGER,
  value            REAL,
  total_commission REAL,
  net_commission   REAL,
  utm_content      TEXT,
  campaign_type    TEXT,
  capi_sent        INTEGER NOT NULL DEFAULT 0,
  ga_sent          INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_conv_click ON conversions(click_id);
CREATE INDEX IF NOT EXISTS idx_conv_sent  ON conversions(capi_sent);

-- View pronta de funil por canal (clique → conversão).
CREATE VIEW IF NOT EXISTS funil_por_canal AS
SELECT
  channel,
  COUNT(*)                                   AS cliques,
  SUM(converted)                             AS vendas,
  ROUND(100.0 * SUM(converted) / COUNT(*), 2) AS taxa_conversao_pct,
  ROUND(SUM(COALESCE(value, 0)), 2)          AS receita,
  ROUND(SUM(COALESCE(commission, 0)), 2)     AS comissao
FROM clicks
GROUP BY channel;
