-- MamaLedger D1 Schema
-- Run: wrangler d1 execute mamaledger-db --file=schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  phone       TEXT    NOT NULL UNIQUE,
  pin_hash    TEXT    NOT NULL,
  name        TEXT,
  market      TEXT,
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  item        TEXT    NOT NULL,
  quantity    REAL    NOT NULL DEFAULT 1,
  price       REAL    NOT NULL DEFAULT 0,
  type        TEXT    NOT NULL CHECK(type IN ('sale','credit','expense','stock')),
  customer    TEXT,
  category    TEXT,
  timestamp   INTEGER NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX IF NOT EXISTS idx_entries_timestamp ON entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_entries_type      ON entries(type);
