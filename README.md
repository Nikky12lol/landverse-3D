# LANDVERSE 3D — AI-Powered 3D Property Intelligence

Full-stack app: **FastAPI backend** (SQLite out-of-the-box, Postgres-ready) + **React + Three.js frontend** with dynamic procedural 3D city, real OpenCV AI detection, ULPIN registry, validation engine and underground infrastructure view.

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

## Postgres (optional)

Set `DATABASE_URL=postgresql://landverse:landverse123@localhost:5432/landverse3d` in `backend/.env`,
apply `database/schema.sql` + `database/seed_data.sql`, restart the API. Default is zero-config SQLite.
