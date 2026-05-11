-- ================================================
-- ViperGuard Dashboard — Database Setup
-- Run this file once in your Postgres database
-- Command: psql -U your_user -d your_db -f setup.sql
-- ================================================


-- Sessions table (used by express-session to store logins)
CREATE TABLE IF NOT EXISTS dashboard_sessions (
  sid    VARCHAR NOT NULL PRIMARY KEY,
  sess   JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON dashboard_sessions (expire);


-- Dashboard users (staff who have logged in via Discord OAuth)
CREATE TABLE IF NOT EXISTS dashboard_users (
  discord_id    VARCHAR(20) PRIMARY KEY,
  username      VARCHAR(100) NOT NULL,
  avatar        VARCHAR(200),
  access_token  TEXT,
  refresh_token TEXT,
  is_staff      BOOLEAN DEFAULT false,
  last_login    TIMESTAMP DEFAULT NOW(),
  created_at    TIMESTAMP DEFAULT NOW()
);


-- Guild settings (channels, welcome messages, auto-role, etc.)
CREATE TABLE IF NOT EXISTS guild_settings (
  guild_id          VARCHAR(20) PRIMARY KEY,
  welcome_channel   VARCHAR(20),
  goodbye_channel   VARCHAR(20),
  log_channel       VARCHAR(20),
  audit_log_channel VARCHAR(20),
  ticket_category   VARCHAR(20),
  auto_role         VARCHAR(20),
  welcome_message   TEXT DEFAULT 'Welcome {user} to {server}! We now have {memberCount} members!',
  goodbye_message   TEXT DEFAULT '{user} has left the server. We now have {memberCount} members.',
  -- Feature toggles stored as JSON: { "economy": true, "leveling": false, ... }
  features          JSONB DEFAULT '{
    "economy": true,
    "leveling": true,
    "moderation": true,
    "logging": true,
    "welcome": true,
    "tickets": true,
    "giveaways": true,
    "birthday": true,
    "counter": true,
    "verification": true,
    "reactionRoles": true,
    "joinToCreate": true,
    "autoRole": true,
    "boostRewards": true,
    "notes": true,
    "history": true,
    "staffHistory": true,
    "crossBan": true,
    "voice": true,
    "search": true,
    "tools": true,
    "utility": true,
    "community": true,
    "fun": true
  }',
  updated_at TIMESTAMP DEFAULT NOW()
);


-- Moderation logs (warns, kicks, bans, mutes, timeouts, strikes)
CREATE TABLE IF NOT EXISTS mod_logs (
  id           SERIAL PRIMARY KEY,
  guild_id     VARCHAR(20) NOT NULL,
  target_id    VARCHAR(20) NOT NULL,
  moderator_id VARCHAR(20) NOT NULL,
  action       VARCHAR(20) NOT NULL, -- warn | kick | ban | mute | timeout | strike | unban
  reason       TEXT,
  expires_at   TIMESTAMP,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mod_logs_guild_target ON mod_logs (guild_id, target_id);
CREATE INDEX IF NOT EXISTS idx_mod_logs_guild_mod    ON mod_logs (guild_id, moderator_id);


-- Bans table
CREATE TABLE IF NOT EXISTS bans (
  guild_id     VARCHAR(20) NOT NULL,
  user_id      VARCHAR(20) NOT NULL,
  moderator_id VARCHAR(20),
  reason       TEXT,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (guild_id, user_id)
);


-- Cross-bans (synced across all servers the bot is in)
CREATE TABLE IF NOT EXISTS cross_bans (
  user_id    VARCHAR(20) PRIMARY KEY,
  issuer_id  VARCHAR(20),
  reason     TEXT,
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- User notes (staff notes attached to a specific user)
CREATE TABLE IF NOT EXISTS user_notes (
  id         SERIAL PRIMARY KEY,
  guild_id   VARCHAR(20) NOT NULL,
  user_id    VARCHAR(20) NOT NULL,
  staff_id   VARCHAR(20) NOT NULL,
  note       TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notes_guild_user ON user_notes (guild_id, user_id);


-- Economy table
CREATE TABLE IF NOT EXISTS economy (
  guild_id   VARCHAR(20) NOT NULL,
  user_id    VARCHAR(20) NOT NULL,
  balance    BIGINT DEFAULT 0,
  bank       BIGINT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (guild_id, user_id)
);


-- Economy adjustment logs (track staff edits to balances)
CREATE TABLE IF NOT EXISTS economy_logs (
  id         SERIAL PRIMARY KEY,
  guild_id   VARCHAR(20) NOT NULL,
  user_id    VARCHAR(20) NOT NULL,
  staff_id   VARCHAR(20),
  amount     BIGINT NOT NULL,
  reason     TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);


-- Shop items
CREATE TABLE IF NOT EXISTS shop_items (
  id          SERIAL PRIMARY KEY,
  guild_id    VARCHAR(20) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  price       BIGINT NOT NULL,
  role_id     VARCHAR(20),
  type        VARCHAR(20) DEFAULT 'role', -- role | item | custom
  created_at  TIMESTAMP DEFAULT NOW()
);


-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id          SERIAL PRIMARY KEY,
  guild_id    VARCHAR(20) NOT NULL,
  channel_id  VARCHAR(20),
  user_id     VARCHAR(20) NOT NULL,
  status      VARCHAR(20) DEFAULT 'open', -- open | claimed | closed
  priority    VARCHAR(20) DEFAULT 'none',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tickets_guild_status ON tickets (guild_id, status);


-- ================================================
-- Done! All tables created.
-- ================================================
