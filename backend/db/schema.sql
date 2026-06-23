-- backend/db/schema.sql
-- Dijalankan otomatis sekali saat server pertama kali start (lihat src/server.js)

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL REFERENCES players(id),
  case_slug TEXT NOT NULL,
  puzzle_id TEXT NOT NULL,
  solved_at TEXT NOT NULL DEFAULT (datetime('now')),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  UNIQUE(player_id, case_slug, puzzle_id)
);

CREATE TABLE IF NOT EXISTS leaderboard_view_cache (
  player_id INTEGER PRIMARY KEY REFERENCES players(id),
  total_points INTEGER NOT NULL DEFAULT 0,
  last_solved_at TEXT
);
