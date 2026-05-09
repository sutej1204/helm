# ── Stage 1: build the React SPA ─────────────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /build

# Install deps separately for better Docker layer caching.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy frontend sources. The Vite config emits into ../dist/public — see
# vite.config.ts; we re-route the output to /build/dist/public.
# `attached_assets/` is required because client/src/components/ui/sidebar.tsx
# imports the Helm logo via the `@assets` Vite alias.
COPY tsconfig.json vite.config.ts tailwind.config.ts postcss.config.js components.json ./
COPY client ./client
COPY attached_assets ./attached_assets

# `VITE_API_URL` is unset because the FastAPI service serves the SPA from the
# same origin. `VITE_HELM_API_TOKEN` is baked in at build time — pass it via
# `--build-arg` if you want bearer auth; otherwise builds anonymous.
ARG VITE_HELM_API_TOKEN=""
ENV VITE_HELM_API_TOKEN=${VITE_HELM_API_TOKEN}

RUN npm run build


# ── Stage 2: Python runtime ──────────────────────────────────────────────────
FROM python:3.12-slim AS runtime
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Backend deps
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Backend source
COPY backend/app ./app

# Frontend build output → app/static (matches STATIC_DIR default in config.py).
COPY --from=frontend /build/dist/public ./app/static

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
