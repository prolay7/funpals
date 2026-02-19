-- 007_extra_tables.sql — Missing tables: materials, categories, skills, goals, reports, meetings, verification

CREATE TABLE IF NOT EXISTS materials (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category     TEXT        NOT NULL,
  title        TEXT        NOT NULL,
  description  TEXT,
  image_url    TEXT,
  external_url TEXT,
  address      TEXT,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  parent_id  UUID        REFERENCES categories(id),
  is_special BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_liked_categories (
  user_id     UUID REFERENCES users(id)      ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  priority    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, category_id)
);

CREATE TABLE IF NOT EXISTS user_skills (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  status      TEXT        NOT NULL DEFAULT 'can_do'
                          CHECK (status IN ('can_do','learning','interested','not_interested')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_goals (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES users(id) ON DELETE CASCADE,
  description TEXT        NOT NULL,
  is_complete BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_reports (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID        REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID        REFERENCES users(id) ON DELETE CASCADE,
  reason      TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meetings (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id      TEXT        UNIQUE NOT NULL,
  meeting_type TEXT        NOT NULL DEFAULT 'video'
                           CHECK (meeting_type IN ('audio','video','google_meet')),
  created_by   UUID        REFERENCES users(id),
  channel_id   UUID        REFERENCES channels(id),
  meet_link    TEXT,
  starts_at    TIMESTAMPTZ,
  is_live      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_participants (
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id)    ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (meeting_id, user_id)
);

CREATE TABLE IF NOT EXISTS verification_reports (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID        REFERENCES users(id) ON DELETE CASCADE,
  target_id   UUID        REFERENCES users(id) ON DELETE CASCADE,
  age_range   TEXT,
  gender      TEXT,
  approved    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user  ON user_skills (user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user   ON user_goals (user_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_id);
CREATE INDEX IF NOT EXISTS idx_meetings_live     ON meetings (is_live, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_materials_active  ON materials (is_active, sort_order);
