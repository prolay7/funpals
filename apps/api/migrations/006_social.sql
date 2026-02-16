CREATE TABLE IF NOT EXISTS open_posts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  tags       TEXT[]      DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS open_questions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  question   TEXT        NOT NULL,
  tags       TEXT[]      DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shares (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  category    TEXT,
  share_type  TEXT        NOT NULL DEFAULT 'internal' CHECK (share_type IN ('internal','global')),
  channel_id  UUID        REFERENCES channels(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS online_presence (
  user_id        UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_online      BOOLEAN     NOT NULL DEFAULT FALSE,
  is_on_call     BOOLEAN     NOT NULL DEFAULT FALSE,
  available_call BOOLEAN     NOT NULL DEFAULT FALSE,
  last_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorite_groups (
  user_id    UUID REFERENCES users(id)    ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, channel_id)
);

CREATE TABLE IF NOT EXISTS favorite_callers (
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  favorite_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, favorite_user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL,
  title      TEXT        NOT NULL,
  body       TEXT,
  data       JSONB,
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  sent_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id                  SERIAL PRIMARY KEY,
  default_radius_miles INTEGER NOT NULL DEFAULT 25,
  notif_frequency     TEXT    NOT NULL DEFAULT 'batched',
  admob_force_watch   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO app_settings (default_radius_miles) VALUES (25) ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shares_category    ON shares (category, created_at DESC);
