-- migrations/0001_init.sql (Cloudflare D1 SQLite Schema — Open-Source Edition)
CREATE TABLE IF NOT EXISTS kv_config (
  key TEXT PRIMARY KEY,
  val TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS groups (
  chat_id INTEGER PRIMARY KEY,
  title TEXT DEFAULT '',
  target_lang TEXT NOT NULL DEFAULT 'zh-CN',
  tz_offset INTEGER NOT NULL DEFAULT 8,
  digest_hour INTEGER NOT NULL DEFAULT 21,
  last_digest_at INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS buffer_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  msg_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL DEFAULT 0,
  reply_to_id INTEGER NOT NULL DEFAULT 0,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_buf_chat ON buffer_messages (chat_id, id);
