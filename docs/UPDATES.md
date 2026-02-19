# Funpals — Project Updates

---

## 2026-02-19 — Backend API Feature Complete

### Summary
The server-side API is now feature-complete per the development specification. All modules, endpoints, integrations, tests, and documentation have been delivered and pushed to the `main` branch.

---

### New Modules Added

| Module        | Endpoints | Description                                              |
|---------------|-----------|----------------------------------------------------------|
| Groups        | 10        | Community groups with integrated Stream.IO calling       |
| Meetings      | 5         | 1-on-1, group, and scheduled meeting management          |
| Skills        | 4         | User skill tracking (can_do / learning / interested)     |
| Goals         | 4         | Personal goal creation and completion tracking           |
| Favourites    | 4         | Save favourite callers and groups                        |
| Categories    | 5         | Hierarchical interest/activity categories                |
| Verification  | 2         | Identity verification with ephemeral photo relay         |
| Search        | 1         | Global search across all entity types                    |
| Materials     | 2         | Learning materials catalogue (Redis-cached)              |
| Reports       | 1         | User report/flag system                                  |
| Location      | 1         | Server-side LocationIQ autocomplete proxy                |
| Conversations | 1         | Private 1-on-1 conversation listing                     |

---

### Integrations Completed

- **Google OAuth** — users can register and sign in with their Google account via `POST /api/v1/auth/google`
- **Cloudinary CDN** — avatar uploads are resized to 400×400 WebP via Sharp before being stored on Cloudinary; local filesystem fallback active in dev
- **Stream.IO** — server-side JWT token generation for group calls, private calls, and scheduled meetings
- **LocationIQ** — address autocomplete proxied through the API so the API key is never exposed to mobile clients

---

### Database Changes

Migration `007_extra_tables.sql` added 9 new tables:

- `materials`
- `categories`
- `user_liked_categories`
- `user_skills`
- `user_goals`
- `user_reports`
- `meetings`
- `meeting_participants`
- `verification_reports`

---

### WebSocket Protocol Extended

Five new message types added to the real-time server:

| Direction        | Type                   | Purpose                                           |
|------------------|------------------------|---------------------------------------------------|
| Client → Server  | `meet_invite`          | Send a call invite to another user                |
| Client → Server  | `meet_accept`          | Accept an incoming call invite                    |
| Client → Server  | `meet_decline`         | Decline an incoming call invite                   |
| Client → Server  | `verification_photo`   | Relay verification photos ephemerally (not stored)|
| Client → Server  | `verification_report`  | Submit a verification result about another user   |

---

### Tests

14 test files added covering all new modules:

- **Unit tests (7):** geoUtils, websocket, skills, goals, favorites, search, categories
- **Integration tests (7):** auth, users, nearby, channels, skills, goals, search, groups

---

### Documentation

- `README.md` — fully updated with all 60+ endpoints, environment variables, WebSocket protocol, database migration history, and test guide
- `docs/Funpals.postman_collection.json` — importable Postman collection with auto-token-capture test scripts for all endpoints

---

### Status at Close of Sprint

| Area                    | Status        |
|-------------------------|---------------|
| REST API (60+ endpoints)| Complete      |
| WebSocket server        | Complete      |
| Database schema (007)   | Complete      |
| Google OAuth            | Complete      |
| Cloudinary upload       | Complete      |
| Stream.IO calling       | Complete      |
| Automated test suite    | Complete      |
| API documentation       | Complete      |
| Postman collection      | Complete      |
| Admin panel (web)       | In progress   |
| Mobile app              | In progress   |

---

### Next Steps

1. TypeScript production build verification — clean compile, resolve any type errors
2. Admin panel — connect new endpoints (materials, settings, reports) to the React UI
3. Mobile app — integrate new screens for groups, meetings, skills, goals, and verification
4. Deployment — configure production environment variables and run migrations on live database

---

*Committed to `main` branch — commits `f53881b`, `81a494e`, `9a7507a`.*

---
