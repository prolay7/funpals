# Funpals Architecture

See the full development guide (Funpals_Development_Guide.docx) for comprehensive diagrams.

## Components

- **apps/api** — Express REST API + WS server. All business logic.
- **apps/mobile** — React Native 0.74 app for iOS and Android.
- **apps/admin** — React + Vite admin panel for content and user management.
- **PostgreSQL 16** — Primary data store. PostGIS for geospatial queries.
- **Redis 7** — Cache-aside pattern + pub/sub for WS horizontal scaling.
- **Nginx** — Reverse proxy, SSL termination, static media serving.
