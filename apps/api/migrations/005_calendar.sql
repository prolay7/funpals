CREATE TABLE IF NOT EXISTS events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  description  TEXT,
  location     TEXT,
  geo_location GEOGRAPHY(POINT,4326),
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  created_by   UUID        REFERENCES users(id),
  channel_id   UUID        REFERENCES channels(id),
  is_group     BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  event_id   UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id)  ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going','maybe','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_events_starts_at  ON events (starts_at);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events (created_by);
