FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV UPLOAD_DIRECTORY=/app/uploads
RUN mkdir -p /app/uploads

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=10s --retries=3 --start-period=30s \
  CMD curl -f http://localhost:8000/health || exit 1

# Shell form so $PORT expands on hosts that set it (Render); defaults to 8000 (compose/local).
# --proxy-headers so redirects honour X-Forwarded-Proto/Host behind tunnel proxies.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers
