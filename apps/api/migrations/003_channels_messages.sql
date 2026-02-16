CREATE TABLE IF NOT EXISTS channels (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  type        TEXT        NOT NULL DEFAULT 'public' CHECK (type IN ('public','private','group')),
  created_by  UUID        REFERENCES users(id),
  photo_url   TEXT,
  is_default  BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_members (
  channel_id  UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id)    ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id  UUID        REFERENCES channels(id) ON DELETE CASCADE,
  sender_id   UUID        REFERENCES users(id)    ON DELETE SET NULL,
  content     TEXT,
  type        TEXT        NOT NULL DEFAULT 'text' CHECK (type IN ('text','image','system')),
  media_url   TEXT,
  reply_to_id UUID        REFERENCES messages(id),
  is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_channel    ON messages (channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members (user_id);
