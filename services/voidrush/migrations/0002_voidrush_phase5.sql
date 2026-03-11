PRAGMA foreign_keys = ON;

ALTER TABLE voidrush_players
  ADD COLUMN season_id TEXT NOT NULL DEFAULT 'S0';

ALTER TABLE voidrush_match_events
  ADD COLUMN season_id TEXT NOT NULL DEFAULT 'S0';

CREATE TABLE IF NOT EXISTS voidrush_seasons (
  season_id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voidrush_anomaly_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warn',
  score INTEGER NOT NULL DEFAULT 0,
  detail_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voidrush_daily_rollups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season_id TEXT NOT NULL,
  day_key TEXT NOT NULL,
  active_players INTEGER NOT NULL DEFAULT 0,
  total_matches INTEGER NOT NULL DEFAULT 0,
  total_kills INTEGER NOT NULL DEFAULT 0,
  credits_earned INTEGER NOT NULL DEFAULT 0,
  exp_earned INTEGER NOT NULL DEFAULT 0,
  anomaly_count INTEGER NOT NULL DEFAULT 0,
  best_domination REAL NOT NULL DEFAULT 0,
  generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(season_id, day_key)
);

CREATE TABLE IF NOT EXISTS voidrush_season_archives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  total_matches INTEGER NOT NULL DEFAULT 0,
  total_kills INTEGER NOT NULL DEFAULT 0,
  best_domination REAL NOT NULL DEFAULT 0,
  win_count INTEGER NOT NULL DEFAULT 0,
  season_score INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(season_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_voidrush_players_season_score_v2
  ON voidrush_players (season_id, season_score DESC, total_kills DESC, best_domination DESC);

CREATE INDEX IF NOT EXISTS idx_voidrush_match_events_season_created
  ON voidrush_match_events (season_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_voidrush_anomaly_events_player_created
  ON voidrush_anomaly_events (player_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_voidrush_anomaly_events_season_score
  ON voidrush_anomaly_events (season_id, score DESC, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_voidrush_seasons_active
  ON voidrush_seasons(status)
  WHERE status = 'active';

INSERT OR IGNORE INTO voidrush_seasons (
  season_id,
  label,
  starts_on,
  ends_on,
  status,
  created_at,
  updated_at
) VALUES (
  'S' || strftime('%Y%m', 'now'),
  'Season ' || strftime('%Y-%m', 'now'),
  strftime('%Y-%m-01', 'now'),
  date(strftime('%Y-%m-01', 'now'), '+1 month', '-1 day'),
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
