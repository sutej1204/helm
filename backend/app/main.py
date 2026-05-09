"""FastAPI entry point.

Single-service deployment: this app serves the JSON API at /api/* AND the
built React SPA from `app/static/` at /. Any non-/api path falls back to
`index.html` so client-side routing (Wouter) works on hard reloads.

Schema and seed are managed at startup (see `lifespan` below). Production
swap to Alembic when migrations are needed; for the thin slice MVP,
`Base.metadata.create_all()` + an idempotent seed is sufficient.
"""
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .db import Base, get_engine
from .routers import ai, claims, expected_credits, programs, recon, suppliers
from .seed import seed as seed_data

settings = get_settings()
logger = logging.getLogger("helm.startup")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=get_engine())
    if os.environ.get("HELM_AUTO_SEED", "true").lower() in {"1", "true", "yes"}:
        try:
            seed_data()
        except Exception:  # noqa: BLE001 — log + continue rather than crash boot
            logger.exception("Seeding failed; continuing without seed data.")
    yield


app = FastAPI(
    title="Helm API",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

if settings.cors_origins != "*":
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok"}


app.include_router(suppliers.router)
app.include_router(programs.router)
app.include_router(expected_credits.router)
app.include_router(claims.router)
app.include_router(recon.router)
app.include_router(ai.router)

# ── Static SPA serving ───────────────────────────────────────────────────────
# Resolve `static_dir` relative to this file so the path works whether the
# server is launched from the repo root, the `backend/` folder, or inside the
# Docker image (where dist is copied to /app/app/static).
_static_dir = Path(__file__).resolve().parent.parent / settings.static_dir
if not _static_dir.is_absolute():
    _static_dir = (Path(__file__).resolve().parent.parent / settings.static_dir).resolve()

if _static_dir.exists():
    # Mount /assets directly so the bundle hashes are served correctly.
    assets_dir = _static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str, request: Request) -> FileResponse:
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        # Try to serve the requested file (for /favicon.ico, /robots.txt, etc.)
        candidate = _static_dir / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        index = _static_dir / "index.html"
        if not index.exists():
            raise HTTPException(status_code=500, detail="index.html missing — was the frontend built?")
        return FileResponse(index)
else:
    # Helpful in dev when running just the API without a built frontend.
    @app.get("/", include_in_schema=False)
    def root_dev_hint() -> dict:
        return {
            "message": "FastAPI backend is up. Frontend bundle not present.",
            "static_dir_expected_at": str(_static_dir),
            "api_docs": "/api/docs",
        }


def main() -> None:
    """Console entrypoint: `python -m app.main` runs uvicorn locally."""
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    main()
