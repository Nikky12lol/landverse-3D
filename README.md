# LANDVERSE 3D — AI-Powered 3D Property Intelligence

Full-stack app: **FastAPI backend** (SQLite out-of-the-box, Postgres-ready) + **React + Three.js frontend** with dynamic procedural 3D city, real OpenCV AI detection, ULPIN registry, validation engine and underground infrastructure view.

## 🌍 Live demo

**https://boil-earshot-wilt.ngrok-free.dev** — the Docker stack below, served publicly via tunnel. (Needs this PC + Docker running; if offline, launch it yourself with `docker compose up --build` + `start-public.bat`.)

## Deploy to Railway (persistent cloud hosting) — ✅ LIVE

- **Site:** https://web-production-0de0c.up.railway.app
- **API:** https://api-production-4fb6.up.railway.app (`/docs`, `/health`)
- Project `landverse-3d`: `db` (Postgres 15) + `api` (FastAPI) + `web` (nginx; browser API URL injected at runtime via `/config.js`, so the image never needs rebuilding for URL changes)
- Redeploy from this machine: `railway up ./backend --service api` / `railway up ./frontend --service web`
- Repro from scratch: New Project → add Postgres → `api` + `web` services → vars (`DATABASE_URL` ref to db, `API_URL` = api domain) → `railway domain -s <svc>` (full CLI transcript available; ask if needed)

## Run it (Windows)

```bat
REM terminal 1 — backend  → http://localhost:8000/docs
start-backend.bat

REM terminal 2 — frontend → http://localhost:5173
start-frontend.bat
```

Manual alternative:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

cd ../frontend
npm install
npm run dev
```

> `npm` may be blocked by PowerShell execution policy — use `npm.cmd` (`start-frontend.bat` already does).

## What was verified

- `GET /health` → healthy; auto-seed on startup (5 parcels, 8 buildings, 5 infra, 1 ULPIN)
- `GET /stats/dashboard`, `/buildings/`, `/buildings/1/hierarchy` (12 floors)
- Real OpenCV detection on synthetic image → footprint polygon + annotated overlay
- `POST /validation/run` → score 100 / valid for BLD-2041
- `POST /ulpin/validate` → parses IND-TG-HYD-01928-B01-F04-U01
- `POST /infrastructure/check-conflict` → 3 conflicts at 8 m foundation
- `npm run build` (tsc + vite) → clean

## Structure

```
backend/app/
  main.py  database.py  models.py  seed.py
  routes/ parcels, buildings, units, ulpin, analysis, validation, infrastructure, stats
  services/ ai_detector (OpenCV), ulpin, validation
frontend/src/
  components/Layout, StatCard, 3d/CityScene (procedural dynamic 3D)
  pages/ Landing, Dashboard, Map3D, Parcels, Analysis, ULPIN, Validation, Infrastructure
  api/client.ts  config.ts  types.ts
database/ schema.sql + seed_data.sql (PostgreSQL path)
uploads/  user uploads + annotated overlays
```

## API map

| Area | Endpoints |
|---|---|
| Parcels | `GET/POST /parcels/`, `GET/PUT/DELETE /parcels/{id}` |
| Buildings | `GET/POST /buildings/`, `GET/PUT/DELETE /buildings/{id}`, `GET /buildings/{id}/hierarchy`, `GET/POST /buildings/{id}/floors` |
| Units | `GET/POST /units/floors/{floor_id}/units` |
| ULPIN | `GET /ulpin/`, `POST /ulpin/generate`, `POST /ulpin/validate` |
| AI | `POST /analysis/upload`, `POST /analysis/run`, `GET /analysis/` |
| Validation | `POST /validation/run`, `GET /validation/` |
| Infra | `GET/POST /infrastructure/`, `POST /infrastructure/check-conflict` |
| Stats | `GET /stats/dashboard` |

## Deploy with Docker (recommended — free, runs anywhere)

Prerequisites: Docker Desktop (on Windows it needs WSL2 — run `wsl --install`, reboot, then install Docker Desktop).

```bash
docker compose up --build
```

That's it:
- UI → http://localhost:5173
- API → http://localhost:8000 (docs at `/docs`, health at `/health`)
- Postgres → localhost:5432 (user `landverse`, db `landverse3d`)

Tables + seed data auto-create on first API start. Data persists in the `pgdata` / `uploads` volumes. Rebuild after code changes with `docker compose up --build`; stop with `docker compose down` (add `-v` to wipe demo data).

## Deploy to cloud (alternative)

**Backend + Postgres on Render** — via `render.yaml` blueprint:
1. Render dashboard → New → Blueprint → select `Akshithsan11/landverse-3D`
2. Render auto-provisions the `landverse-3d-api` web service (Docker, `backend/Dockerfile`) + `landverse-db` Postgres, wiring `DATABASE_URL` for you
3. Wait for deploy, then check `https://<your-api>.onrender.com/health`
4. Tables + seed data are created automatically on startup

**Frontend on Vercel:**
1. Vercel → Add New → Project → import `Akshithsan11/landverse-3D`, set **Root Directory** to `frontend/`
2. Add env var `VITE_API_URL=https://<your-api>.onrender.com` (no trailing slash)
3. Deploy — `frontend/vercel.json` handles SPA rewrites for react-router

> Render free API sleeps after 15 min idle (~50s cold start): open `/health` a minute before demos. Uploads live on ephemeral disk and reset on redeploy.

## Postgres (optional)

Set `DATABASE_URL=postgresql://landverse:landverse123@localhost:5432/landverse3d` in `backend/.env`,
apply `database/schema.sql` + `database/seed_data.sql`, restart the API. Default is zero-config SQLite.
