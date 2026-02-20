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

## Database Seeding

The seeder (`apps/api/seeds/run.ts`) populates the database with realistic sample data.
It is **idempotent** — safe to run multiple times (uses `ON CONFLICT DO NOTHING`).

```bash
cd apps/api && npm run seed
```

### Seeded Accounts

All accounts use the password **`Funpals@123`**.

| Email | Role | Display Name |
|---|---|---|
| `admin@funpals.com` | `admin` | Admin |
| `alice@funpals.com` | `user` | Alice Johnson |
| `bob@funpals.com` | `user` | Bob Martinez |
| `carol@funpals.com` | `user` | Carol Chen |
| `dave@funpals.com` | `user` | Dave Thompson |

### Seeded Data Summary

| Table | Records | Notes |
|---|---|---|
| `users` | 5 | 1 admin + 4 regular users |
| `user_profiles` | 5 | Bio, interests, can_do, age range, zip |
| `online_presence` | 5 | One row per user (offline by default) |
| `activity_categories` | 6 | games, parks, trails, libraries, books, other |
| `activities` | 6 | Sample activities linked to categories |
| `categories` | 8 | Fitness, Arts, Tech, Books, Outdoors, Games, Wellness, Community |
| `channels` | 4 | General, Activities, Announcements (default) + Book Club |
| `channel_members` | 17 | All users in default channels; alice + carol in Book Club |
| `messages` | 11 | Sample messages across all channels |
| `events` | 4 | Upcoming events: hike, board game night, book club, park clean-up |
| `event_rsvps` | 7 | RSVPs spread across events |
| `open_posts` | 5 | Posts by alice, bob, carol, dave |
| `open_questions` | 5 | Questions by alice, bob, carol, dave |
| `shares` | 4 | Internal and global shares |
| `materials` | 7 | Learning materials across categories |
| `user_skills` | 12 | Skills with `can_do` / `learning` / `interested` status |
| `user_goals` | 8 | Personal goals for each user |
| `notifications` | 7 | Welcome + activity notifications |
| `user_activities` | 8 | Users linked to relevant activities |

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
│   └── mobile/                  # React Native App (iOS + Android)
│       ├── android/             # Gradle project — package com.funpals
│       ├── ios/                 # Xcode project — Funpals.xcodeproj
│       ├── src/                 # TypeScript source (screens, navigation, store)
│       ├── metro.config.js      # Metro bundler — monorepo watchFolders config
│       ├── app.json             # App name for AppRegistry
│       └── index.js             # RN entry point
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

## Admin Panel

The admin panel lives in `apps/admin/` and is built with **React 18 + Vite + TypeScript + TailwindCSS**.
It is being migrated to the [shadcn-admin-kit](https://github.com/marmelab/shadcn-admin-kit) template,
which wraps **react-admin (ra-core)** with **shadcn/ui** components.

### Current State (`apps/admin/`)

| File | Status | Description |
|---|---|---|
| `src/api/client.ts` | Done | Axios instance with auto Bearer token + 401 redirect |
| `src/App.tsx` | Done | React Router v6 protected routes |
| `src/components/Layout.tsx` | Done | Sidebar + topbar with Funpals brand colours |
| `src/pages/Login.tsx` | Done | Email/password login with admin role check |
| `src/pages/Dashboard.tsx` | Done | Stats cards from `/admin/stats` |
| `src/pages/Users.tsx` | Done | User table with search and ban/unban |
| `src/pages/Activities.tsx` | Partial | Basic grid, no create/edit/delete |
| `src/pages/Posts.tsx` | Stub | Heading only — not implemented |
| `src/pages/Notifications.tsx` | Done | Send push notification form |
| `src/pages/Settings.tsx` | Partial | Displays raw JSON, no edit UI |

### Tech Stack — Admin Panel

| Concern | Library |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Admin scaffolding | react-admin (ra-core) via shadcn-admin-kit |
| UI components | shadcn/ui + Radix UI |
| Styling | TailwindCSS 3 |
| Icons | Lucide |
| Routing | React Router DOM v6 |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| HTTP client | Axios |

---

### Admin Panel — Build Plan

The following 14 steps take the admin panel from its current partial state to a
fully featured, production-ready dashboard. Each step is independent and can be
approved and executed individually.

---

#### Phase 1 — Foundation

**Step 1 — Install dependencies and configure shadcn/ui**

- Add `react-admin`, `ra-core`, `shadcn-admin-kit` to `apps/admin/package.json`
- Install Radix UI primitives (`dialog`, `dropdown-menu`, `select`, `table`, etc.)
- Add `lucide-react`
- Run `shadcn init` — generates `components.json`, `lib/utils.ts`, base CSS variables
- Update `tailwind.config.ts` with shadcn/ui preset
- Update `index.css` with CSS variable palette for light/dark mode
- Keep existing Vite dev proxy (`/api → http://localhost:3000`)

*Output: blank app that boots with shadcn/ui theme applied.*

---

#### Phase 2 — Auth Provider

**Step 2 — Write the Funpals Auth Provider**

react-admin requires an `authProvider` object with these methods:

| Method | API Call | Behaviour |
|---|---|---|
| `login({ email, password })` | `POST /api/v1/auth/login` | Saves tokens to localStorage; rejects if `role !== 'admin'` |
| `logout()` | `POST /api/v1/auth/logout` | Clears localStorage |
| `checkAuth()` | Local | Reads token; rejects if missing → redirects to login |
| `checkError(error)` | Local | Rejects on HTTP 401/403 → forces logout |
| `getPermissions()` | Local | Returns `'admin'` from decoded JWT |
| `getIdentity()` | `GET /api/v1/users/me` | Returns `{ id, fullName, avatar }` for header display |

*Output: login works, all routes protected, user identity shown in topbar.*

---

#### Phase 3 — Data Provider

**Step 3 — Write the Funpals Data Provider**

Bridges react-admin CRUD operations to the Funpals REST API:

| react-admin method | Funpals endpoint | Notes |
|---|---|---|
| `getList('users')` | `GET /api/v1/admin/users` | Maps pagination params |
| `getOne('users', id)` | `GET /api/v1/users/:id` | |
| `update('users', id)` | `PATCH /api/v1/admin/users/:id/ban` | Ban toggle |
| `getList('activities')` | `GET /api/v1/admin/activities` | |
| `create('activities')` | `POST /api/v1/admin/activities` | |
| `update('activities', id)` | `PATCH /api/v1/admin/activities/:id` | |
| `delete('activities', id)` | `DELETE /api/v1/admin/activities/:id` | |
| `getList('materials')` | `GET /api/v1/admin/materials` | |
| `create('materials')` | `POST /api/v1/admin/materials` | |
| `update('materials', id)` | `PATCH /api/v1/admin/materials/:id` | |
| `delete('materials', id)` | `DELETE /api/v1/admin/materials/:id` | |
| `getList('groups')` | `GET /api/v1/groups/public` | Read-only |
| `getList('reports')` | `GET /api/v1/admin/users` + reports | Read-only |

*Output: all CRUD pages connect to the real API with no per-page fetch logic needed.*

---

#### Phase 4 — Layout & Shell

**Step 4 — App shell (App.tsx + Layout)**

- Replace current `App.tsx` with react-admin `<Admin dataProvider authProvider layout>` root
- Custom `FunpalsLayout` wrapping shadcn-admin-kit sidebar:
  - Funpals logo at the top
  - Navigation links to all resources
  - Brand colours: dark navy `#1A3C5E` + teal `#0E7F6B` via CSS variables
  - Topbar with user identity and logout
- Custom `<Login>` page with shadcn `Card`, `Input`, `Button`

*Output: full shell loads — sidebar, topbar, login — styled in Funpals branding.*

---

#### Phase 5 — Dashboard

**Step 5 — Dashboard page**

Stats cards from `GET /api/v1/admin/stats`:

- Total Users
- Total Channels
- Messages Today
- Active Activities
- Live Meetings *(new)*
- Reports Pending *(new)*

Charts (Recharts):
- User registrations over time — line chart
- Activity categories breakdown — pie chart

Layout: 3-column stat card grid on top, charts below, all using shadcn `Card`.

*Output: rich dashboard with live stats and charts.*

---

#### Phase 6 — Resources

**Step 6 — Users Resource** (`/users`)

- List: DataTable with Avatar, Username, Email, Role badge, Status badge, Joined date, Actions
- Server-side search by email / username
- Row actions: View profile, Ban / Unban (with confirmation dialog)
- Bulk action: Ban selected
- Show page: profile card, skills list, goals list, recent activity
- No create page (users self-register)

**Step 7 — Activities Resource** (`/activities`)

- List: DataTable — Name, Category, Created date, Actions
- Filter by category
- Create page: Name, Description, Category (select from `/categories`)
- Edit page: same form pre-populated
- Delete: confirmation dialog

**Step 8 — Materials Resource** (`/materials`) *(was missing — now complete)*

- List: DataTable — Title, URL (clickable), Category, Created date, Actions
- Create page: Title, URL, Category, Description
- Edit and Delete: same pattern as Activities

**Step 9 — Reports Resource** (`/reports`) *(new)*

- List: DataTable — Reporter, Reported user, Reason, Date
- Read-only — no create/edit
- Row action: View both user profiles

**Step 10 — Groups & Meetings (read-only overview)**

- Groups list: DataTable — Name, Member count, Private/Public badge, Created date
- Meetings list: DataTable — Call ID, Type, Created by, Live badge, Participants count
- Both are read-only (user-created content, not admin-managed)

**Step 11 — Posts Moderation** (`/posts`) *(was stub — now complete)*

- List: DataTable — Title, Author, Created date, Actions
- Row action: Delete post (moderation)

---

#### Phase 7 — Custom Action Pages

**Step 12 — Notifications Page** (`/notifications`)

- Recipient: All users or Specific user (UUID input with autocomplete)
- Fields: Title, Body
- Preview card showing the notification appearance
- Submit → `POST /api/v1/admin/notifications/send`
- Send history table (last 20 sent)

**Step 13 — Settings Page** (`/settings`)

- Fetch from `GET /api/v1/admin/settings`
- Render each setting as a typed form field (toggle, text, number — inferred from value type)
- Save → `PATCH /api/v1/admin/settings`
- React Hook Form + Zod validation

---

#### Phase 8 — Polish & Build

**Step 14 — Polish, types, and build verification**

- TypeScript types for all API response shapes in `src/types/`
- Dark mode toggle (shadcn/ui native support)
- Clean `tsc && vite build` with zero type errors
- Verify Vite dev proxy and production Nginx config are aligned
- Update `docs/UPDATES.md` with admin panel completion entry

---

### Step Summary

| Step | Phase | Deliverable |
|---|---|---|
| 1 | Foundation | shadcn/ui + react-admin installed, Tailwind configured |
| 2 | Auth | `authProvider` — login, logout, identity, permissions |
| 3 | Data | `dataProvider` — all CRUD mapped to Funpals API |
| 4 | Shell | Layout, sidebar, topbar, Funpals branding |
| 5 | Dashboard | Stats cards + Recharts charts |
| 6 | Users | Full table + ban/unban + show page |
| 7 | Activities | Full CRUD table + create/edit forms |
| 8 | Materials | Full CRUD table + create/edit forms |
| 9 | Reports | Read-only list with profile links |
| 10 | Groups & Meetings | Read-only overview tables |
| 11 | Posts | Moderation list + delete action |
| 12 | Notifications | Custom send form + history |
| 13 | Settings | Form-based settings editor |
| 14 | Polish | Types, dark mode, build verification |

---

## Mobile App

The mobile app lives in `apps/mobile/` and is built with **React Native 0.74 + TypeScript**.

### Native Setup Status

| Item | Status | Details |
|---|---|---|
| `android/` | ✅ Done | Gradle project, `applicationId "com.funpals"`, `MainActivity.kt`, `MainApplication.kt` |
| `ios/` | ✅ Done | `Funpals.xcodeproj`, `AppDelegate`, `Info.plist`, `LaunchScreen.storyboard`, `Podfile` |
| `metro.config.js` | ✅ Done | Monorepo `watchFolders` + `nodeModulesPaths` configured |
| `app.json` | ✅ Done | `{ "name": "Funpals", "displayName": "Funpals" }` |
| `index.js` | ✅ Done | Registers `App` component via `AppRegistry` |
| CocoaPods (`pod install`) | ⚠️ macOS only | Must be run on a Mac before iOS build |
| `google-services.json` | ❌ Required | Firebase config for FCM push notifications + AdMob (Android) |
| `GoogleService-Info.plist` | ❌ Required | Firebase config for APNs push notifications (iOS) |
| Google Maps API key | ❌ Required | Add to `AndroidManifest.xml` and `Info.plist` for `react-native-maps` |
| AdMob App ID | ❌ Required | Add to `AndroidManifest.xml` and `Info.plist` for `react-native-google-mobile-ads` |

---

### Running Locally

Two equivalent ways to run the app — use whichever suits your workflow:

**Option A — convenience scripts from the repo root (recommended)**

```bash
# Install mobile dependencies (first time only)
npm run mobile:install

# Terminal 1 — start Metro bundler
npm run mobile:start

# Terminal 2 — build and launch
npm run mobile:android   # Android emulator / device
npm run mobile:ios       # iOS Simulator (macOS only)
```

**Option B — cd into apps/mobile**

```bash
# Install dependencies (first time only)
cd apps/mobile && npm install --legacy-peer-deps

# Terminal 1 — start Metro bundler
cd apps/mobile && npx react-native start

# Terminal 2 — build and launch
cd apps/mobile && npx react-native run-android

# iOS (macOS only — requires Xcode 15+ and CocoaPods)
cd apps/mobile/ios && pod install
cd apps/mobile && npx react-native run-ios
```

> **Important:** Never run `npx react-native` from the repo root directly — `apps/mobile` is not part of the npm workspace, so React Native commands must be run either via the `npm run mobile:*` scripts above or from inside `apps/mobile/`.

---

### Testing & Simulation

This is a **bare React Native** app (no Expo). It compiles to native code and cannot run directly in a browser. Use one of the options below to test the app on Windows, macOS, or in the cloud.

---

#### Option 1 — Android Emulator *(recommended on Windows)*

The best local option on Windows. Fully free, no physical device required.

**One-time setup:**
1. Download and install [Android Studio](https://developer.android.com/studio)
2. Open **SDK Manager** → install **Android SDK Platform 34**
3. Open **Device Manager** → **Create Virtual Device** → choose *Pixel 7* → select *API 34* system image → Finish
4. Add the Google Maps API key to `apps/mobile/android/app/src/main/AndroidManifest.xml` (required for `react-native-maps`):
   ```xml
   <meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_KEY"/>
   ```

**Run the app:**
```bash
# Terminal 1 — start Metro bundler
cd apps/mobile
npx react-native start

# Terminal 2 — launch on the running emulator
npx react-native run-android
```

> **Tip:** Make sure the emulator is already running before executing `run-android`, or pass `--deviceId` to target a specific emulator.

---

#### Option 2 — iOS Simulator *(macOS only)*

Requires a Mac with Xcode 15+ installed.

**One-time setup:**
```bash
# Install CocoaPods dependencies
cd apps/mobile/ios && pod install
```

Add the Google Maps API key to `apps/mobile/ios/Funpals/Info.plist`:
```xml
<key>GMSApiKey</key>
<string>YOUR_KEY</string>
```

**Run the app:**
```bash
# Terminal 1 — start Metro bundler
cd apps/mobile
npx react-native start

# Terminal 2 — launch on the iOS Simulator
npx react-native run-ios

# Target a specific device
npx react-native run-ios --simulator="iPhone 15 Pro"
```

---

#### Option 3 — Physical Android Device *(easiest if you have a phone)*

No emulator installation required.

1. On your Android phone go to **Settings → About Phone** → tap **Build Number** 7 times to unlock Developer Options
2. Go to **Settings → Developer Options** → enable **USB Debugging**
3. Connect the phone via USB cable
4. Verify it is detected:
   ```bash
   adb devices
   # Should list your device, e.g.: emulator-5554 device
   ```
5. Run the app:
   ```bash
   cd apps/mobile
   npx react-native start          # Terminal 1
   npx react-native run-android    # Terminal 2
   ```

> For wireless debugging (Android 11+): **Developer Options → Wireless Debugging → Pair device with pairing code**, then use `adb pair <ip>:<port>`.

---

#### Option 4 — Appetize.io *(browser-based, shareable)*

Run your app inside a browser — no simulator installation needed. Useful for sharing a demo link with stakeholders.

**Steps:**
1. Build a debug APK:
   ```bash
   cd apps/mobile/android
   ./gradlew assembleDebug
   # Output: android/app/build/outputs/apk/debug/app-debug.apk
   ```
2. Go to [appetize.io](https://appetize.io) → **Upload** your `.apk`
3. Appetize gives you a shareable browser URL that runs Android in the cloud

> **Free tier:** 100 minutes/month. Paid plans available for heavier use.
> **iOS on Appetize:** Requires a signed `.ipa` built on macOS.

---

#### Why React Native Web doesn't work for this project

Several dependencies used by this app have **no web support** and would need to be replaced or mocked before the app could run in a browser:

| Library | Web support |
|---------|-------------|
| `react-native-maps` | ❌ No |
| `react-native-fast-image` | ❌ No |
| `react-native-push-notification` | ❌ No |
| `react-native-google-mobile-ads` | ❌ No |
| `react-native-image-picker` | ❌ No |
| `@react-navigation/stack` | ⚠️ Partial |

Use **Option 1** (Android Emulator) or **Option 4** (Appetize.io) for browser-accessible testing instead.

---

### Troubleshooting

#### ⚠️ `react-native depends on @react-native-community/cli` warning

```
⚠️ react-native depends on @react-native-community/cli for cli commands.
To fix update your package.json to include:
  "devDependencies": { "@react-native-community/cli": "latest" }
```

**Cause:** You ran `npx react-native start` (or `run-android` / `run-ios`) directly from the repo root. The root `package.json` does not declare `apps/mobile` as a workspace, so React Native's working-directory check fails.

**Fix — use the convenience scripts instead:**
```bash
npm run mobile:start    # from repo root — always works
npm run mobile:android
npm run mobile:ios
```

Or `cd apps/mobile` first and then run any `npx react-native` command from there.

`@react-native-community/cli 13.6.9` is now declared in both the root and `apps/mobile` `package.json` so both approaches work without warnings.

---

#### Metro bundler fails to start / `ENOENT` on `metro.config.js`

Make sure you start Metro from `apps/mobile/`, not the repo root:
```bash
cd apps/mobile
npx react-native start
# or from root:
npm run mobile:start
```

---

#### Android build fails — `SDK location not found`

Android Studio must be installed and `ANDROID_HOME` must be set.

```bash
# Windows — add to System Environment Variables:
ANDROID_HOME = C:\Users\<you>\AppData\Local\Android\Sdk

# Or create apps/mobile/android/local.properties:
sdk.dir=C\:\\Users\\<you>\\AppData\\Local\\Android\\Sdk
```

---

#### Android build fails — `Google Maps API key not set`

`react-native-maps` requires a Google Maps API key on Android.
Add it to `apps/mobile/android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_KEY" />
```

Get a key at [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials → Create API Key** → restrict to **Maps SDK for Android**.

---

#### `npm install` peer dependency errors in `apps/mobile`

Several React Native libraries declare strict peer deps. Always install with the legacy resolver:
```bash
cd apps/mobile
npm install --legacy-peer-deps
# or from root:
npm run mobile:install
```

---

#### Metro fails — `Cannot find module '@react-native/metro-config'`

```
Error: Cannot find module '@react-native/metro-config'
Require stack:
- .../apps/mobile/metro.config.js
```

**Cause:** `@react-native/metro-config` was not listed in `apps/mobile/devDependencies`, so it wasn't installed locally.

**Fix:** It is now declared as `^0.74.83` in `apps/mobile/package.json`. If you cloned the repo before this fix, re-run the install:
```bash
npm run mobile:install
# or:
cd apps/mobile && npm install --legacy-peer-deps
```

---

### Metro Monorepo Config

`metro.config.js` is configured so Metro can resolve:
- Root `node_modules/` (npm workspace hoisted dependencies)
- `packages/shared-types/` and `packages/shared-utils/` (internal monorepo packages)

```js
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
```

---

### Before First Production Build

**Android:**
1. Obtain `google-services.json` from [Firebase Console](https://console.firebase.google.com) and place it in `apps/mobile/android/app/`
2. Add your Google Maps API key to `apps/mobile/android/app/src/main/AndroidManifest.xml`:
   ```xml
   <meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_KEY"/>
   ```
3. Add your AdMob App ID to `AndroidManifest.xml`:
   ```xml
   <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-XXXXXXXX~XXXXXXXX"/>
   ```
4. Generate a release keystore and configure signing in `android/app/build.gradle`

**iOS (macOS required):**
1. Obtain `GoogleService-Info.plist` from Firebase Console and add it to `apps/mobile/ios/Funpals/`
2. Add Google Maps API key to `Info.plist`:
   ```xml
   <key>GMSApiKey</key><string>YOUR_KEY</string>
   ```
3. Configure APNs capability in Xcode: **Signing & Capabilities → + Capability → Push Notifications**
4. Run `pod install` inside `apps/mobile/ios/`
5. Set the bundle identifier to `com.funpals` in Xcode → Signing & Capabilities

---

### Mobile Tech Stack

| Concern | Library |
|---|---|
| Framework | React Native 0.74 + TypeScript |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| State | Redux Toolkit + React Redux |
| Forms | React Hook Form + Zod |
| Maps | react-native-maps |
| Real-time | Socket.IO client |
| Video/Audio | Stream.IO (token from API) |
| Images | react-native-fast-image |
| Push | react-native-push-notification (APNs + FCM) |
| Ads | react-native-google-mobile-ads |
| Calendar | react-native-calendars |
| Gestures | react-native-gesture-handler + react-native-reanimated |
| Storage | @react-native-async-storage/async-storage |
| Sharing | react-native-share |

---

### Screen Implementation Plan

The mobile UI is built in **8 phases**. All screens use pure React Native `StyleSheet` (no third-party UI library), brand colours from `theme/colors.ts`, and are `SafeAreaView`-aware.

---

#### Current State

| Area | Status |
|---|---|
| Auth flow (Splash → Landing → Login → Register) | ✅ Done |
| Main tab shell (Home, Nearby, Chat, Activities, Profile) | ✅ Done |
| `ActivityBubble` floating widget | ✅ Done |
| `useWebSocket` hook (singleton, auto-reconnect) | ✅ Done |
| Redux store (auth, chat, ui slices) | ✅ Done |
| Theme (`colors.ts`, `typography.ts`) | ✅ Done |

---

#### Phase 1 — Infrastructure Fixes

- Fix `API_BASE` URL: port `3000` → `4000` in `utils/api.ts`
- Install missing `@tanstack/react-query` (used in `NearbyScreen` but absent from `package.json`)
- Restructure `AppNavigator` / `MainTabs` to include nested stack navigators so sub-screens (ChatRoom, UserDetail, etc.) are reachable from tabs

---

#### Phase 2 — Common Components

Shared UI building blocks used across all screens:

| Component | Purpose |
|---|---|
| `AppHeader` | Consistent header with back button, title, optional right action |
| `Avatar` | Circular avatar with presence dot (online / on-call / offline) |
| `LoadingSpinner` | Full-screen and inline loading states |
| `EmptyState` | Empty list placeholder with icon + message |
| `Toast` | Slide-in success / error notification |
| `PrimaryButton` | Reusable CTA button with loading state |

---

#### Phase 3 — Chat Screens

Complete the end-to-end chat flow:

| Screen / Component | Details |
|---|---|
| `ChatRoomScreen` | Message list with infinite scroll (older messages), real-time WS append, typing indicator |
| `MessageBubble` | Sent (teal, right-aligned) vs received (white, left-aligned), timestamp |
| `ChatInput` | Multiline text input + send button, emits `typing` WS events |
| `TypingIndicator` | Animated three-dot indicator when others are typing |

---

#### Phase 4 — Profile Screens

| Screen / Component | Details |
|---|---|
| `EditProfileScreen` | Bio, interests (multi-select chips), age range, zip, expertise slider |
| `UserDetailScreen` | View another user's profile, skills, goals — invite to meet or message |
| `SkillBadge` | Pill badge colour-coded by status (`can_do` / `learning` / `interested`) |

---

#### Phase 5 — Activities & Calendar

| Screen | Details |
|---|---|
| `ActivityDetailScreen` | Full activity detail, external link, join button |
| `CalendarScreen` | Monthly calendar (`react-native-calendars`), event dots on dates |
| `EventDetailScreen` | Event info, RSVP buttons (going / maybe / declined) |

---

#### Phase 6 — Social (Posts, Questions, Share)

| Screen | Details |
|---|---|
| `OpenPostsScreen` | Post feed + create new post (title, content, tags) |
| `OpenQuestionsScreen` | Question feed + ask new question |
| `GlobalShareScreen` | Share text content to a channel or globally |

---

#### Phase 7 — Search

| Screen | Details |
|---|---|
| `SearchScreen` | Global search across users, posts, questions, activities — tabbed results |

---

#### Phase 8 — Nearby Enhancements

Improvements to the existing `NearbyScreen`:

| Addition | Details |
|---|---|
| `RadiusChips` | Quick-select radius: 10 / 25 / 50 / 100 miles |
| `NearbyUserCard` | Card with avatar, presence dot, Meet / Message action buttons |
| `MapView` integration | `react-native-maps` pins for nearby users |

---

#### Screen Inventory

| Screen | Tab / Stack | Phase | Status |
|---|---|---|---|
| `SplashSequenceScreen` | Auth | — | ✅ Done |
| `LandingScreen` | Auth | — | ✅ Done |
| `LoginScreen` | Auth | — | ✅ Done |
| `RegisterScreen` | Auth | — | ✅ Done |
| `HomeScreen` | Main Tab | — | ✅ Done |
| `NearbyScreen` | Main Tab | — | ✅ Done |
| `ChannelListScreen` | Chat Tab | — | ✅ Done |
| `BrowseActivitiesScreen` | Activities Tab | — | ✅ Done |
| `ProfileScreen` | Profile Tab | — | ✅ Done |
| `ChatRoomScreen` | Chat Stack | 3 | ⏳ Pending |
| `EditProfileScreen` | Profile Stack | 4 | ⏳ Pending |
| `UserDetailScreen` | Nearby / Chat Stack | 4 | ⏳ Pending |
| `ActivityDetailScreen` | Activities Stack | 5 | ⏳ Pending |
| `CalendarScreen` | Main Tab | 5 | ⏳ Pending |
| `EventDetailScreen` | Calendar Stack | 5 | ⏳ Pending |
| `OpenPostsScreen` | Main Tab | 6 | ⏳ Pending |
| `OpenQuestionsScreen` | Main Tab | 6 | ⏳ Pending |
| `GlobalShareScreen` | Main Tab | 6 | ⏳ Pending |
| `SearchScreen` | Main Tab | 7 | ⏳ Pending |

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Project Updates](docs/UPDATES.md)

---

## License

Private — All rights reserved.
