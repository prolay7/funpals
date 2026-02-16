CREATE TABLE IF NOT EXISTS activity_categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT UNIQUE NOT NULL,
  icon  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID        REFERENCES activity_categories(id),
  title        TEXT        NOT NULL,
  description  TEXT,
  image_url    TEXT,
  address      TEXT,
  external_url TEXT,
  location     GEOGRAPHY(POINT,4326),
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_activities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID        REFERENCES activities(id),
  status      TEXT        NOT NULL DEFAULT 'available',
  started_at  TIMESTAMPTZ,
  ended_at    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, activity_id)
);
