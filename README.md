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

| Layer    | Technology            |
|----------|-----------------------|
| Mobile   | React Native 0.74     |
| API      | Node.js + Express 4   |
| Real-time| Native WebSockets (ws)|
| Database | PostgreSQL 16 + PostGIS|
| Cache    | Redis 7               |
| Admin    | React 18 + Vite       |

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
# Edit .env and fill in DATABASE_URL, REDIS_URL, JWT_SECRET

# 3. Database setup
createdb funpals_dev
psql funpals_dev -c "CREATE EXTENSION postgis;"
cd apps/api && npm run migrate && npm run seed

# 4. Start services
npm run dev:api      # API on :3000
npm run dev:admin    # Admin panel on :5173

# 5. Mobile (in apps/mobile/)
cd apps/mobile
npm install
npx pod-install          # iOS only
npx react-native run-ios       # or run-android
```

---

## Scripts

```bash
npm run test           # Run all tests
npm run test:api       # API tests only
npm run build          # Build all packages
npm run ci             # Full CI: lint + build + test
```

---

## Project Structure

```
funpals/
├── apps/
│   ├── api/           # Node.js REST + WebSocket API
│   ├── admin/         # React Web Admin Panel
│   └── mobile/        # React Native App
├── packages/
│   ├── shared-types/  # TypeScript types
│   └── shared-utils/  # Utility functions
├── infra/
│   ├── nginx/         # Nginx reverse proxy config
│   ├── postgres/      # DB init scripts
│   └── redis/         # Redis config
├── docs/              # Architecture docs
├── .github/workflows/ # CI/CD
└── ecosystem.config.js # PM2 production config
```

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Development Guide](Funpals_Development_Guide.docx)

---

## License

Private — All rights reserved.
