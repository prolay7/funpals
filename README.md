# Funpals

> Social connection mobile app (iOS & Android) — React Native + Node.js + PostgreSQL

**Zero subscriptions. Full control. Production-ready.**

---

## Architecture

```
React Native App (iOS + Android)
        ↓ HTTPS        ↓ WSS
  [Express REST API]  [WebSocket Server]
        ↓                    ↓
      PostgreSQL 16 + PostGIS
        ↓
      Redis 7 (Cache + Pub/Sub)
        ↓
  React Admin Panel
```

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Mobile      | React Native 0.74                   |
| API         | Node.js 20 + Express 4 + TypeScript |
| Real-time   | Native WebSockets (`ws`) + Redis pub/sub |
| Database    | PostgreSQL 16 + PostGIS             |
| Cache       | Redis 7                             |
| Admin       | React 18 + Vite                     |
| Media       | Cloudinary CDN (Sharp preprocessing) |
| Auth        | JWT (access 15 m / refresh 30 d) + Google OAuth |
| Video/Audio | Stream.IO (token-based)             |
| Location    | LocationIQ autocomplete proxy       |
| Push        | APNs (iOS) + FCM (Android)          |

---

## Prerequisites

- Node.js >= 20
- PostgreSQL 16 with PostGIS extension
- Redis 7
- (Mobile) Xcode 15+ (iOS) / Android Studio (Android)

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-org/funpals.git
cd funpals
npm install

# 2. Environment setup
cp .env.example .env
# Edit .env — see Environment Variables section below

# 3. Database setup
createdb funpals_dev
psql funpals_dev -c "CREATE EXTENSION postgis;"
cd apps/api && npm run migrate && npm run seed

# 4. Start services
npm run dev:api      # API on :3000
npm run dev:admin    # Admin panel on :5173

# 5. Mobile (in apps/mobile/)
cd apps/mobile
npm install --legacy-peer-deps
npx pod-install          # iOS only
npx react-native run-ios       # or run-android
```

---

## Environment Variables

| Variable                  | Required | Default                          | Description                              |
|---------------------------|----------|----------------------------------|------------------------------------------|
| `DATABASE_URL`            | Yes      | —                                | PostgreSQL connection string             |
| `DATABASE_TEST_URL`       | No       | —                                | Separate DB for integration tests        |
| `JWT_SECRET`              | Yes      | —                                | Must be ≥ 32 characters                  |
| `REDIS_URL`               | No       | `redis://localhost:6379`         | Redis connection string                  |
| `PORT`                    | No       | `3000`                           | HTTP server port                         |
| `NODE_ENV`                | No       | `development`                    | `development` / `test` / `production`    |
| `ALLOWED_ORIGINS`         | No       | `http://localhost:5173`          | Comma-separated CORS origins             |
| `MEDIA_UPLOAD_PATH`       | No       | `./uploads`                      | Local upload directory (dev fallback)    |
| `MEDIA_BASE_URL`          | No       | `http://localhost:3000/media`    | Base URL for locally served media        |
| `GOOGLE_CLIENT_ID`        | No       | —                                | Google OAuth — enables `/auth/google`    |
| `GOOGLE_CLIENT_SECRET`    | No       | —                                | Google OAuth client secret               |
| `CLOUDINARY_CLOUD_NAME`   | No       | —                                | Cloudinary — enables CDN avatar upload   |
| `CLOUDINARY_API_KEY`      | No       | —                                | Cloudinary API key                       |
| `CLOUDINARY_API_SECRET`   | No       | —                                | Cloudinary API secret                    |
| `STREAM_API_KEY`          | No       | —                                | Stream.IO — enables call token generation|
| `STREAM_API_SECRET`       | No       | —                                | Stream.IO secret (HS256 JWT signing)     |
| `LOCATION_IQ_KEY`         | No       | —                                | LocationIQ — enables `/location/suggestions` |
| `APNS_KEY_ID`             | No       | —                                | APNs push key ID                         |
| `APNS_TEAM_ID`            | No       | —                                | APNs team ID                             |
| `APNS_BUNDLE_ID`          | No       | —                                | App bundle ID for APNs                   |
| `APNS_KEY_PATH`           | No       | —                                | Path to APNs `.p8` key file              |
| `FCM_SERVER_KEY`          | No       | —                                | Firebase Cloud Messaging server key      |

---

## Scripts

```bash
npm run test           # Run all tests
npm run test:api       # API tests only
npm run build          # Build all packages
npm run ci             # Full CI: lint + build + test

# Inside apps/api
npm run migrate        # Run pending SQL migrations
npm run seed           # Seed database with initial data
```

---

## Project Structure

```
funpals/
├── apps/
│   ├── api/                     # Node.js REST + WebSocket API
│   │   ├── migrations/          # SQL migration files (001–007)
│   │   ├── seeds/               # Database seeders
│   │   ├── src/
│   │   │   ├── config/          # env.ts, database.ts, redis.ts
│   │   │   ├── middleware/      # auth, validate, rateLimiter, logger, errorHandler
│   │   │   ├── modules/         # Feature modules (service / controller / routes)
│   │   │   │   ├── activities/
│   │   │   │   ├── admin/
│   │   │   │   ├── auth/
│   │   │   │   ├── calendar/
│   │   │   │   ├── categories/
│   │   │   │   ├── channels/
│   │   │   │   ├── favorites/
│   │   │   │   ├── goals/
│   │   │   │   ├── groups/
│   │   │   │   ├── location/
│   │   │   │   ├── materials/
│   │   │   │   ├── meetings/
│   │   │   │   ├── nearby/
│   │   │   │   ├── notifications/
│   │   │   │   ├── posts/
│   │   │   │   ├── questions/
│   │   │   │   ├── reports/
│   │   │   │   ├── search/
│   │   │   │   ├── share/
│   │   │   │   ├── skills/
│   │   │   │   ├── users/
│   │   │   │   └── verification/
│   │   │   ├── utils/           # geoUtils, pagination helpers
│   │   │   ├── websocket/       # WsServer.ts
│   │   │   └── app.ts           # Express bootstrap
│   │   └── tests/
│   │       ├── unit/            # Jest unit tests (mocked DB)
│   │       └── integration/     # Supertest integration tests (live DB)
│   ├── admin/                   # React Web Admin Panel
│   └── mobile/                  # React Native App
├── packages/
│   ├── shared-types/            # TypeScript types
│   └── shared-utils/            # Utility functions
├── infra/
│   ├── nginx/                   # Nginx reverse proxy config
│   ├── postgres/                # DB init scripts
│   └── redis/                   # Redis config
├── docs/                        # Architecture docs
├── .github/workflows/           # CI/CD
└── ecosystem.config.js          # PM2 production config
```

---

## API Reference

All endpoints are prefixed with `/api/v1`. Authentication is via `Authorization: Bearer <accessToken>` unless stated otherwise.

Global rate limit: **200 requests/minute per IP**.
Auth endpoints rate limit: **10 requests/minute per IP**.

---

### Authentication — `/api/v1/auth`

| Method | Endpoint        | Auth | Body / Params                                                                 | Description                            |
|--------|-----------------|------|-------------------------------------------------------------------------------|----------------------------------------|
| POST   | `/register`     | No   | `email`, `password` (min 8), `username` (3–30), `display_name` (1–60)       | Register a new user                    |
| POST   | `/login`        | No   | `email`, `password`                                                           | Email/password login                   |
| POST   | `/google`       | No   | `id_token` — Google ID token from client SDK                                  | Google OAuth sign-in / sign-up         |
| POST   | `/refresh`      | No   | `refreshToken` (body or cookie)                                               | Exchange refresh token for new pair    |
| POST   | `/logout`       | No   | `refreshToken`                                                                | Invalidate refresh token               |

---

### Users — `/api/v1/users`

| Method | Endpoint         | Auth | Body / Params                                                                        | Description                     |
|--------|------------------|------|--------------------------------------------------------------------------------------|---------------------------------|
| GET    | `/me`            | Yes  | —                                                                                    | Get current user profile        |
| PATCH  | `/me`            | Yes  | `display_name?`, `available_for?` (array), `expertise_level?` (1–5)                 | Update current user profile     |
| POST   | `/me/photo`      | Yes  | `multipart/form-data` — field `photo` (max 10 MB)                                   | Upload avatar (Cloudinary / local) |
| GET    | `/me/goal`       | Yes  | —                                                                                    | Get current user's daily goal   |
| PATCH  | `/me/goal`       | Yes  | `daily_goal` (max 280 chars)                                                         | Set/update daily goal           |
| GET    | `/online`        | Yes  | —                                                                                    | List currently online users     |
| GET    | `/:id`           | Yes  | —                                                                                    | Get user by ID                  |

---

### Nearby — `/api/v1/nearby`

| Method | Endpoint    | Auth | Body / Params                                                                | Description                       |
|--------|-------------|------|------------------------------------------------------------------------------|-----------------------------------|
| GET    | `/`         | Yes  | `?lat` (float), `?lng` (float), `?radius` (miles, optional)                 | Get nearby users via PostGIS      |
| PATCH  | `/location` | Yes  | `lat`, `lng`                                                                 | Update current user's location    |
| PATCH  | `/presence` | Yes  | `is_online?` (bool), `is_on_call?` (bool), `available_call?` (bool)        | Update presence/availability flags|

---

### Channels — `/api/v1/channels`

| Method | Endpoint              | Auth | Body / Params                                           | Description                        |
|--------|-----------------------|------|---------------------------------------------------------|------------------------------------|
| GET    | `/`                   | Yes  | —                                                       | List channels the user has joined  |
| POST   | `/`                   | Yes  | `name` (1–80)                                           | Create a new channel               |
| GET    | `/:id`                | Yes  | —                                                       | Get channel details                |
| POST   | `/:id/join`           | Yes  | —                                                       | Join a channel                     |
| DELETE | `/:id/leave`          | Yes  | —                                                       | Leave a channel                    |
| POST   | `/:id/favorite`       | Yes  | —                                                       | Toggle channel as favourite        |
| GET    | `/:id/messages`       | Yes  | `?limit` (1–100, optional)                              | Get channel message history        |

### Conversations — `/api/v1/conversations`

| Method | Endpoint | Auth | Description                               |
|--------|----------|------|-------------------------------------------|
| GET    | `/`      | Yes  | List private conversations with last message |

---

### Activities — `/api/v1/activities`

| Method | Endpoint      | Auth | Description                          |
|--------|---------------|------|--------------------------------------|
| GET    | `/`           | Yes  | List all activities                  |
| GET    | `/random`     | Yes  | Get a random activity                |
| GET    | `/:id`        | Yes  | Get activity by ID                   |
| POST   | `/:id/join`   | Yes  | Join an activity                     |

---

### Groups — `/api/v1/groups`

| Method | Endpoint              | Auth | Body / Params                                                        | Description                                  |
|--------|-----------------------|------|----------------------------------------------------------------------|----------------------------------------------|
| POST   | `/`                   | Yes  | `name` (1–100), `description?`, `member_ids?` (array)               | Create a group                               |
| GET    | `/`                   | Yes  | —                                                                    | List groups the current user is in           |
| GET    | `/public`             | Yes  | —                                                                    | List all public groups                       |
| GET    | `/:id`                | Yes  | —                                                                    | Get group details                            |
| PATCH  | `/:id`                | Yes  | `name?`, `description?`, `is_private?`                              | Update group (owner only)                    |
| POST   | `/:id/join`           | Yes  | —                                                                    | Join a public group                          |
| DELETE | `/:id/leave`          | Yes  | —                                                                    | Leave a group                                |
| POST   | `/:id/instant-call`   | Yes  | —                                                                    | Start an instant Stream.IO call in the group |
| PATCH  | `/:id/join-call`      | Yes  | —                                                                    | Join an active group call                    |
| GET    | `/:id/live-meetings`  | Yes  | —                                                                    | List currently live meetings in the group    |

---

### Meetings — `/api/v1/meetings`

| Method | Endpoint     | Auth | Body / Params                                                           | Description                             |
|--------|--------------|------|-------------------------------------------------------------------------|-----------------------------------------|
| POST   | `/invite`    | Yes  | `to_user_id` (UUID), `meeting_type?` (`audio`\|`video`\|`google_meet`) | Send a 1-on-1 meeting invite            |
| POST   | `/private`   | Yes  | `to_user_id` (UUID)                                                     | Start an instant private call           |
| GET    | `/live`      | Yes  | —                                                                       | List all currently live meetings        |
| GET    | `/:id/link`  | Yes  | —                                                                       | Get join link / Stream token for a meeting |
| POST   | `/schedule`  | Yes  | `title` (1–200), `starts_at` (ISO 8601), `meeting_type?`, `channel_id?` | Schedule a future meeting               |

---

### Skills — `/api/v1/skills`

| Method | Endpoint | Auth | Body / Params                                                                                          | Description             |
|--------|----------|------|--------------------------------------------------------------------------------------------------------|-------------------------|
| GET    | `/`      | Yes  | —                                                                                                      | List current user's skills |
| POST   | `/`      | Yes  | `name` (1–100), `status?` (`can_do`\|`learning`\|`interested`\|`not_interested`), `description?`      | Add a skill             |
| PUT    | `/:id`   | Yes  | `name?` (1–100), `status?` (`can_do`\|`learning`\|`interested`\|`not_interested`)                     | Update a skill          |
| DELETE | `/:id`   | Yes  | —                                                                                                      | Remove a skill          |

---

### Goals — `/api/v1/goals`

| Method | Endpoint | Auth | Body / Params                                             | Description             |
|--------|----------|------|-----------------------------------------------------------|-------------------------|
| GET    | `/`      | Yes  | —                                                         | List current user's goals |
| POST   | `/`      | Yes  | `description` (1–500)                                     | Create a goal           |
| PATCH  | `/:id`   | Yes  | `is_complete?` (bool), `description?` (1–500)            | Update/complete a goal  |
| DELETE | `/:id`   | Yes  | —                                                         | Delete a goal           |

---

### Favorites — `/api/v1/favorites`

| Method | Endpoint     | Auth | Body / Params                 | Description                              |
|--------|--------------|------|-------------------------------|------------------------------------------|
| POST   | `/callers`   | Yes  | `user_id` (UUID)              | Toggle a user as a favourite caller      |
| GET    | `/callers`   | Yes  | —                             | List favourite callers                   |
| POST   | `/groups`    | Yes  | `channel_id` (UUID)           | Toggle a group as a favourite            |
| GET    | `/groups`    | Yes  | —                             | List favourite groups                    |

---

### Categories — `/api/v1/categories`

| Method | Endpoint          | Auth | Body / Params                      | Description                              |
|--------|-------------------|------|------------------------------------|------------------------------------------|
| GET    | `/`               | Yes  | —                                  | List top-level categories                |
| GET    | `/search`         | Yes  | `?q` (min 1 char)                  | Search categories by name                |
| GET    | `/:id/children`   | Yes  | —                                  | Get sub-categories of a category         |
| GET    | `/:id/users`      | Yes  | —                                  | Get users who have liked a category      |
| POST   | `/liked`          | Yes  | `category_id` (UUID)               | Toggle a liked category for current user |

---

### Search — `/api/v1/search`

| Method | Endpoint | Auth | Params                                                                                                 | Description             |
|--------|----------|------|--------------------------------------------------------------------------------------------------------|-------------------------|
| GET    | `/`      | Yes  | `?q` (1–200), `?type` (`users`\|`skills`\|`posts`\|`groups`\|`meetings`\|`categories`\|`activities`\|`all`) | Global search           |

Response shape for `type=all`:
```json
{
  "data": {
    "users": [...],
    "skills": [...],
    "posts": [...],
    "groups": [...],
    "meetings": [...],
    "categories": [...],
    "activities": [...]
  }
}
```

---

### Materials — `/api/v1/materials`

| Method | Endpoint   | Auth | Params              | Description                              |
|--------|------------|------|---------------------|------------------------------------------|
| GET    | `/`        | Yes  | `?category?` (str)  | List learning materials (Redis-cached)   |
| GET    | `/random`  | Yes  | —                   | Get a random material                    |

---

### Verification — `/api/v1/verification`

| Method | Endpoint   | Auth | Body / Params                                                    | Description                                          |
|--------|------------|------|------------------------------------------------------------------|------------------------------------------------------|
| POST   | `/`        | Yes  | `target_id` (UUID), `approved` (bool), `age_range?`, `gender?`  | Submit a verification report about another user      |
| POST   | `/photos`  | Yes  | —                                                                | Initiate ephemeral photo verification (relayed via WS) |

---

### Reports — `/api/v1/reports`

| Method | Endpoint | Auth | Body / Params                                  | Description              |
|--------|----------|------|------------------------------------------------|--------------------------|
| POST   | `/`      | Yes  | `reported_id` (UUID), `reason` (1–500 chars)   | Report a user            |

---

### Location — `/api/v1/location`

| Method | Endpoint        | Auth | Params             | Description                                    |
|--------|-----------------|------|--------------------|------------------------------------------------|
| GET    | `/suggestions`  | Yes  | `?q` (2–200 chars) | LocationIQ autocomplete proxy (key kept server-side) |

---

### Notifications — `/api/v1/notifications`

| Method | Endpoint    | Auth | Description                         |
|--------|-------------|------|-------------------------------------|
| GET    | `/`         | Yes  | List notifications for current user |
| PATCH  | `/read-all` | Yes  | Mark all notifications as read      |

---

### Posts — `/api/v1/posts`

| Method | Endpoint | Auth | Body / Params                                        | Description    |
|--------|----------|------|------------------------------------------------------|----------------|
| GET    | `/`      | Yes  | —                                                    | List posts     |
| POST   | `/`      | Yes  | `title` (1–120), `content` (1–2000)                  | Create a post  |

---

### Admin — `/api/v1/admin` *(requires admin role)*

| Method | Endpoint                  | Body / Params                                          | Description                          |
|--------|---------------------------|--------------------------------------------------------|--------------------------------------|
| GET    | `/stats`                  | —                                                      | Platform statistics                  |
| GET    | `/users`                  | —                                                      | List all users                       |
| PATCH  | `/users/:id/ban`          | —                                                      | Ban / unban a user                   |
| GET    | `/activities`             | —                                                      | List all activities                  |
| POST   | `/activities`             | `name`, `description`, `category_id`                   | Create an activity                   |
| PATCH  | `/activities/:id`         | `name?`, `description?`                                | Update an activity                   |
| DELETE | `/activities/:id`         | —                                                      | Delete an activity                   |
| POST   | `/notifications/send`     | `userId`, `title`, `body`, `data?`                     | Push notification to a user          |
| GET    | `/settings`               | —                                                      | Get app settings                     |
| PATCH  | `/settings`               | `key-value pairs`                                      | Update app settings                  |
| GET    | `/materials`              | —                                                      | List all materials                   |
| POST   | `/materials`              | `title`, `url`, `category?`, `description?`            | Create a material                    |
| PATCH  | `/materials/:id`          | `title?`, `url?`, `category?`, `description?`          | Update a material                    |
| DELETE | `/materials/:id`          | —                                                      | Delete a material                    |

---

### Health Check

| Method | Endpoint  | Auth | Description            |
|--------|-----------|------|------------------------|
| GET    | `/health` | No   | Returns `{ status: "ok", ts: "..." }` |

---

## WebSocket Protocol

Connect to `wss://<host>/ws`. All messages are JSON.

### Connection Sequence

```
Client                           Server
  |                                 |
  |-- { type: "auth", token }  -->  |
  |<-- { type: "auth_ok", userId }  |
  |                                 |
  |-- { type: "join", channelId }-->|  (join a chat channel)
  |-- { type: "ping" }          --> |
  |<-- { type: "pong" }             |
```

### Client → Server Messages

| `type`                | Required Fields                                              | Description                                        |
|-----------------------|--------------------------------------------------------------|----------------------------------------------------|
| `auth`                | `token` — JWT access token                                   | Authenticate the WS connection                     |
| `join`                | `channelId`                                                  | Subscribe to a channel's messages                  |
| `message`             | `channelId`, `content`                                       | Send a chat message (saved to DB, fanned out via Redis) |
| `typing`              | `channelId`, `isTyping` (bool)                               | Broadcast typing indicator to channel members      |
| `presence`            | `status` — `"online"` \| `"away"` \| `"oncall"`             | Update presence status                             |
| `ping`                | —                                                            | Keepalive ping                                     |
| `meet_invite`         | `targetUserId`, `meetingType` (`audio`\|`video`\|`google_meet`) | Invite a user to a call                         |
| `meet_accept`         | `meetingId`                                                  | Accept a meeting invite                            |
| `meet_decline`        | `meetingId`                                                  | Decline a meeting invite                           |
| `verification_photo`  | `targetUserId`, `photos` (array)                             | Relay verification photos (ephemeral, not stored)  |
| `verification_report` | `targetUserId`, `ageRange`, `gender`, `approved` (bool)     | Submit a verification report                       |

### Server → Client Messages

| `type`                 | Fields                                              | Description                                          |
|------------------------|-----------------------------------------------------|------------------------------------------------------|
| `auth_ok`              | `userId`                                            | Connection authenticated                             |
| `new_message`          | `message` (full message object)                     | New chat message in a joined channel                 |
| `typing`               | `userId`, `channelId`, `isTyping`                   | Someone is typing in a channel                       |
| `presence`             | `userId`, `status`                                  | A user's presence changed                            |
| `notification`         | `title`, `body`, `data`                             | In-app push notification                             |
| `pong`                 | —                                                   | Response to `ping`                                   |
| `meet_request`         | `fromUser`, `meetingType`, `meetingId`              | Incoming meeting invite                              |
| `meet_accepted`        | `meetingId`, `callToken`                            | Your invite was accepted (includes Stream.IO token)  |
| `meet_declined`        | `meetingId`                                         | Your invite was declined                             |
| `meet_link`            | `meetingId`, `callToken`, `callId`                  | Your call is ready (sent to inviter on `meet_invite`)|
| `verification_photos`  | `fromUserId`, `photos`                              | Incoming verification photos (ephemeral relay)       |
| `verification_result`  | `fromUserId`, `approved`                            | Result of a verification report                      |

> **Heartbeat:** Server pings all clients every 30 seconds. Connections that miss 2 consecutive pings are terminated.

> **Scaling:** Redis pub/sub channels (`ws:chat`, `ws:typing`, `ws:presence`, `ws:notification`) ensure messages are fanned out across all API instances.

---

## Database Schema

Migrations run in order from `apps/api/migrations/`. Use `npm run migrate` to apply pending migrations.

| Migration | Tables Created                                                                              |
|-----------|---------------------------------------------------------------------------------------------|
| 001       | `users`, `refresh_tokens`                                                                   |
| 002       | `online_presence`, `activities`, `activity_categories`, `user_activities`                   |
| 003       | `channels`, `channel_members`, `messages`, `favorite_callers`, `favorite_groups`            |
| 004       | `posts`, `questions`, `calendar_events`, `app_settings`                                     |
| 005       | `notifications`                                                                             |
| 006       | `share_links`                                                                               |
| 007       | `materials`, `categories`, `user_liked_categories`, `user_skills`, `user_goals`, `user_reports`, `meetings`, `meeting_participants`, `verification_reports` |

---

## Testing

```bash
# Unit tests (no DB required — all external deps mocked)
cd apps/api && npm test -- --testPathPattern=tests/unit

# Integration tests (requires DATABASE_TEST_URL in .env)
cd apps/api && npm test -- --testPathPattern=tests/integration
```

### Test Coverage

| Suite       | File                                   | What it tests                                     |
|-------------|----------------------------------------|---------------------------------------------------|
| Unit        | `tests/unit/geoUtils.test.ts`          | `milesToMeters`, `haversineDistance`              |
| Unit        | `tests/unit/websocket.test.ts`         | `verifyToken` mock, `redisPublisher`, `WsServer` class |
| Unit        | `tests/unit/skills.test.ts`            | `listSkills`, `createSkill`, `deleteSkill` service |
| Unit        | `tests/unit/goals.test.ts`             | `createGoal`, `updateGoal`, `listGoals` service   |
| Unit        | `tests/unit/favorites.test.ts`         | Toggle add/remove logic for callers and groups    |
| Unit        | `tests/unit/search.test.ts`            | All-types vs single-type results                  |
| Unit        | `tests/unit/categories.test.ts`        | List, search, and toggle liked category           |
| Integration | `tests/integration/auth.test.ts`       | Register, login, refresh, logout                  |
| Integration | `tests/integration/users.test.ts`      | Profile update, photo upload                      |
| Integration | `tests/integration/nearby.test.ts`     | Location update, presence, nearby query           |
| Integration | `tests/integration/channels.test.ts`   | Create, join, message, leave channel              |
| Integration | `tests/integration/skills.test.ts`     | Full CRUD — create, list, update, delete          |
| Integration | `tests/integration/goals.test.ts`      | Full CRUD — create, list, complete, delete        |
| Integration | `tests/integration/search.test.ts`     | 401 / 422 / 200 with `type=all` and `type=users`  |
| Integration | `tests/integration/groups.test.ts`     | Create, list, public list, get by ID, 404         |

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## License

Private — All rights reserved.
