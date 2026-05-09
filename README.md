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

The repo ships ready for a one-Blueprint deploy. The Postgres database
is **not** provisioned by `render.yaml` — you should create it manually
first (or reuse an existing one) and paste the URL into the service.

### One-time setup

1. **Postgres** (skip if you already have one)
   - Render dashboard → **New → PostgreSQL** → name `helmdb`, plan
     `Starter`, region `Ohio`.
   - When it lights up, copy the **Internal Database URL** from the Info
     tab — that's what the web service will use.
2. **Web service**
   - Render dashboard → **New → Blueprint** → connect your GitHub repo.
   - Render reads `render.yaml` and proposes a Docker Web Service named
     `helm`. Apply.
3. **Set required env vars** on the new service's **Environment** tab:
   | Key                  | Value |
   |----------------------|-------|
   | `DATABASE_URL`       | Internal Database URL from step 1 |
   | `ANTHROPIC_API_KEY`  | from https://console.anthropic.com/settings/keys |
   | `HELM_API_TOKEN`     | (optional) any random string for shared-token auth |

   The other env vars in `render.yaml` (`HELM_AUTO_SEED`, `STATIC_DIR`,
   `CORS_ORIGINS`) have safe defaults baked in.
4. Trigger a manual deploy (the first Blueprint apply usually does this
   automatically). The Docker build takes ~3-4 min on Starter:
   - **Stage 1:** Node 20 builds the React SPA into `dist/public/`.
   - **Stage 2:** Python 3.12 installs requirements and copies the build
     into `app/static/`.
5. On the first boot, the lifespan hook does three things:
   - `Base.metadata.create_all()` creates the 5 thin-slice tables.
   - `_apply_pending_migrations()` runs `ALTER TABLE … IF NOT EXISTS` for
     the upload-analysis columns on `expected_credits`.
   - `seed()` populates 11 suppliers / 11 agreements / 10 programs / 2
     expected_credits, plus the AI-Analysis placeholder records used as
     FK targets for upload-derived data.
6. Visit your service URL — the SPA loads at `/`, the API lives at
   `/api/*`, OpenAPI docs at `/api/docs`. Healthcheck is `/api/health`.

### Re-deploying

`git push origin main` triggers a new build automatically. The seed
function is idempotent (skips when demo data already exists), and the
migrations are `IF NOT EXISTS` so the schema upgrade is safe to run on
every boot.

### Build args (optional)

If you set `HELM_API_TOKEN` and want the frontend to send it, you also
need to bake the matching value into the SPA at build time. On Render:
**Settings → Build & Deploy → Docker Build Args** → add
`VITE_HELM_API_TOKEN` with the same value as `HELM_API_TOKEN`.
Otherwise the SPA sends no auth header.

## API surface

The deployed service exposes:

| Method | Path                                | Purpose |
|--------|-------------------------------------|---------|
| GET    | `/api/health`                       | Liveness |
| GET    | `/api/suppliers` / `/{id}`          | List / get supplier |
| GET    | `/api/programs` / `/{id}`           | List / get rebate program (with agreement + supplier) |
| GET    | `/api/expected-credits`             | List computed credits |
| POST   | `/api/expected-credits/bulk`        | Persist a per-VCSC analysis from an upload run |
| GET    | `/api/claims` / `/{id}`             | List / get claim |
| POST   | `/api/claims`                       | Create draft claim (Export-to-Claim button) |
| POST   | `/api/recon/ap-match/{id}`          | 4-Way Match stub (canned scenarios for invoices 2/3/4) |
| POST   | `/api/ai/extract-pdf`               | Multipart upload → pypdf text |
| POST   | `/api/ai/expected-credit/analyze`   | Engine: Python math + tiny AI metadata call |
| POST   | `/api/ai/agreement/extract`         | AI-extract structured programs from a PDF agreement, persist to DB |
| POST   | `/api/ai/contracts/extract`         | Standalone "Extract terms" on /contract-ingestion |
| POST   | `/api/ai/resolver/draft-email`      | AI Resolver: drafts dispute email |
| POST   | `/api/chat/supply-chain`            | Dashboard chat sidebar |

When `HELM_API_TOKEN` is set, every `/api/*` route except `/api/health`
and `/api/docs` requires `Authorization: Bearer <token>`.

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
