# Clinic Booking (MVP)

Minimal appointment booking app for a small clinic.

## Tech Stack & Trade-offs
- **Express + Postgres (Neon)**: fast to scaffold; SQL unique constraint on `bookings.slot_id` ensures atomic **no double-booking**. Chose Postgres over SQLite for persistent cloud storage on free tier.
- **JWT Auth (RBAC)**: simple stateless auth; role checked per-route.
- **React + Vite**: minimal, fast dev, very small footprint.

**Timezone:** All slots and bookings use **UTC** consistently. The UI labels times as UTC.

## Architecture Notes
- **Folder Structure**: `/backend` (Express routes, DB init/seed) and `/frontend` (React pages, simple routing).
- **Auth+RBAC**: Upon login, JWT `{ userId, role, name }` issued. Middleware validates token; `requireRole('patient'|'admin')` gates routes.
- **Slots**: 30-min intervals 09:00–17:00 for next 7 days. Generated on seed and also lazily upserted on `/slots` requests to ensure availability.
- **Concurrency/Atomicity**: DB uniqueness on `bookings(slot_id)` prevents two users booking the same slot; API returns `409 SLOT_TAKEN`.
- **Error Handling**: JSON shape `{ "error": { "code", "message" } }`, with correct HTTP codes (400, 401, 403, 404, 409, 500).
- **Security Hygiene**: bcrypt password hashing, rate-limit on login, CORS allowlist, helmet for sane headers. No secrets logged.

## Run Locally

### Backend
```bash
cd backend
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, FRONTEND_ORIGIN (http://localhost:5173 for local)
npm install
npm run seed
npm start
