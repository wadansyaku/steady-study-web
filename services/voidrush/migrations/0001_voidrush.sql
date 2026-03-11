PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS voidrush_players (
  player_id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 2,
  state_json TEXT NOT NULL,
  total_matches INTEGER NOT NULL DEFAULT 0,
  total_kills INTEGER NOT NULL DEFAULT 0,
  best_domination REAL NOT NULL DEFAULT 0,
  win_count INTEGER NOT NULL DEFAULT 0,
  season_score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voidrush_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  path TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_json TEXT,
  response_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, request_id)
);

CREATE TABLE IF NOT EXISTS voidrush_match_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  domination_percent REAL NOT NULL,
  kills INTEGER NOT NULL,
  nodes_captured INTEGER NOT NULL,
  credits_earned INTEGER NOT NULL,
  exp_earned INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_voidrush_players_season_score
  ON voidrush_players (season_score DESC, total_kills DESC, best_domination DESC);

CREATE INDEX IF NOT EXISTS idx_voidrush_requests_player_created
  ON voidrush_requests (player_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_voidrush_match_events_player_created
  ON voidrush_match_events (player_id, created_at DESC);
