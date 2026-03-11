PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS lead_submissions (
  submission_id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  consent INTEGER NOT NULL DEFAULT 1,
  source_path TEXT NOT NULL DEFAULT '/contact',
  status TEXT NOT NULL DEFAULT 'received',
  meta_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lead_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES lead_submissions(submission_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_submissions_service_created
  ON lead_submissions (service, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_events_submission_created
  ON lead_events (submission_id, created_at DESC);
