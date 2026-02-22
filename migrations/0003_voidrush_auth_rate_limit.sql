PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS voidrush_auth_identities (
  player_id TEXT PRIMARY KEY,
  proof_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voidrush_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  counter INTEGER NOT NULL DEFAULT 0,
  expires_at_epoch INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_voidrush_rate_limits_expires
  ON voidrush_rate_limits (expires_at_epoch);
