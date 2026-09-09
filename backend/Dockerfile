FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV UPLOAD_DIRECTORY=/app/uploads
RUN mkdir -p /app/uploads

EXPOSE 8000

# Shell form so $PORT expands on hosts that set it (Render); defaults to 8000 (compose/local).
# --proxy-headers so redirects honour X-Forwarded-Proto/Host behind tunnel proxies.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers
