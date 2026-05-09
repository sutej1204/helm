# Helm — Trade Intelligence Platform

A FastAPI + Postgres backend serving a React (Vite) SPA. Single-service
deployment on Render via Docker.

## Stack

- **Frontend:** React 18, Vite, TanStack Query, Tailwind, shadcn/ui, Wouter
- **Backend:** FastAPI, SQLAlchemy 2.0, psycopg 3, Pydantic v2
- **Database:** PostgreSQL 16
- **Deployment:** Single Docker container on Render Web Service

## Repository layout

```
.
├── client/              React SPA (Vite)
├── backend/
│   ├── app/             FastAPI app, models, routers, seed
│   └── requirements.txt
├── Dockerfile           Multi-stage: Node build → Python runtime
├── render.yaml          Render Blueprint
└── package.json         Frontend deps + scripts
```

## Local development

### Prerequisites

- Node 20+
- Python 3.11+
- A Postgres URL (use the External URL from your Render `helmdb` for a
  zero-setup option, or run a local Postgres on `:5432`)

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
cp .env.example .env
# Edit .env: set DATABASE_URL. Leave HELM_API_TOKEN blank for unauthenticated dev.

python -m uvicorn app.main:app --reload --port 8000
```

The lifespan hook runs `Base.metadata.create_all()` and seeds the demo data
on first boot. Hit `http://127.0.0.1:8000/api/docs` for interactive docs.

### Frontend

```bash
npm install
npm run dev
```

Vite serves on `http://localhost:5173` and proxies `/api/*` to the FastAPI
on `:8000` (see `vite.config.ts`). Open
`http://localhost:5173/prevention/expected-credit-engine` to test.

If you want to point at a remote backend instead of the local proxy, create
`client/.env`:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_HELM_API_TOKEN=  # match the backend's HELM_API_TOKEN, or leave empty
```

## Deploying to Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint** → select your repo → Render reads
   `render.yaml` and creates a Web Service named `helm`.
3. After the Blueprint applies, open the service's **Environment** tab and
   set `DATABASE_URL` to the **Internal Database URL** of your Postgres.
   (External URL works too but is slower.) Optionally set `HELM_API_TOKEN`
   to enforce bearer auth.
4. The first deploy will build the Docker image (~3 min). On boot, the
   lifespan hook auto-creates tables and seeds the demo data.
5. Visit your service URL — the SPA loads at `/`, the API lives at
   `/api/*`, OpenAPI docs at `/api/docs`.

## API surface (thin slice)

| Method | Path                              | Notes                                  |
|--------|-----------------------------------|----------------------------------------|
| GET    | /api/health                       | Liveness check                         |
| GET    | /api/suppliers                    | List all suppliers                     |
| GET    | /api/suppliers/{id}               | Single supplier                        |
| GET    | /api/programs                     | All rebate/SPA programs (with agreement + supplier) |
| GET    | /api/programs/{id}                | Single program                         |
| GET    | /api/expected-credits             | Computed credits with linked program   |
| GET    | /api/claims                       | All claims                             |
| GET    | /api/claims/{id}                  | Single claim                           |
| POST   | /api/claims                       | Create draft claim (used by Export-to-Claim) |

When `HELM_API_TOKEN` is set, every `/api/*` route except `/api/health` and
`/api/docs` requires `Authorization: Bearer <token>`.

## Adding more endpoints

The original Express backend exposed ~50 routes across 30+ tables. Bring
them online as their pages need:

1. Add the SQLAlchemy model in `backend/app/models.py`
2. Add Pydantic schemas in `backend/app/schemas.py` (`_to_camel` alias
   keeps the JSON wire format compatible with the existing React client)
3. Add a router in `backend/app/routers/` and register it in `main.py`
4. Bounce the server — `Base.metadata.create_all()` creates the new table
5. (Optional) extend `seed.py` to populate it on a fresh DB

## What's intentionally not included

- **Auth beyond a shared bearer token.** Real user login is out of scope
  for the MVP.
- **Alembic migrations.** `Base.metadata.create_all()` handles the
  thin-slice case. Move to Alembic before any production schema change you
  can't drop-and-recreate.
- **OpenAI integration.** The Helm AI Resolver modal in the
  expected-credit-engine page is fully client-side — no API calls.

## Security checklist before going public

- [ ] Set a strong `HELM_API_TOKEN` on Render (and the matching
      `VITE_HELM_API_TOKEN` at frontend build time).
- [ ] Restrict `CORS_ORIGINS` to your actual frontend origin instead of
      `*`.
- [ ] Rotate `DATABASE_URL` if it has ever been pasted into a chat or
      committed.
- [ ] Disable `HELM_AUTO_SEED` once the DB has data you care about.
