CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  phone         TEXT        UNIQUE,
  password_hash TEXT        NOT NULL,
  username      TEXT        UNIQUE NOT NULL,
  display_name  TEXT        NOT NULL,
  photo_url     TEXT,
  role          TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id             UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  age_range           TEXT,
  gender              TEXT,
  zip_code            TEXT,
  location            GEOGRAPHY(POINT,4326),
  can_do              TEXT[]      DEFAULT '{}',
  cannot_do           TEXT[]      DEFAULT '{}',
  interests           TEXT[]      DEFAULT '{}',
  available_for       TEXT[]      NOT NULL DEFAULT '{""}',
  expertise_level     SMALLINT    CHECK (expertise_level BETWEEN 1 AND 5),
  bio                 TEXT,
  daily_goal          TEXT,
  goal_shown_date     DATE,
  search_radius_miles INTEGER     NOT NULL DEFAULT 25,
  notif_frequency     TEXT        NOT NULL DEFAULT 'batched',
  notif_batch_hours   INTEGER     NOT NULL DEFAULT 4,
  fcm_token           TEXT,
  apns_token          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_location ON user_profiles USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_users_email        ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_username     ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users (role);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token      TEXT        PRIMARY KEY,
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id);
