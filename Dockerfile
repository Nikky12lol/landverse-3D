# LANDVERSE 3D — single-container release image (Hugging Face Spaces / any host).
# Builds the React UI, then serves UI + API from one FastAPI process on $PORT
# (Spaces sets PORT=7860). SQLite auto-seeds on startup, so no database needed.

# ---- Stage 1: build frontend ----
FROM node:20-slim AS webbuild
WORKDIR /web
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Stage 2: backend + bundled UI ----
FROM python:3.11-slim
WORKDIR /app/backend
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=webbuild /web/dist /app/frontend/dist
ENV UPLOAD_DIRECTORY=/app/uploads
RUN mkdir -p /app/uploads
EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD curl -f http://localhost:${PORT:-7860}/health || exit 1
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860} --proxy-headers"
