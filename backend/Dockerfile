FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV UPLOAD_DIRECTORY=/app/uploads
RUN mkdir -p /app/uploads

EXPOSE 8000

# Shell form so $PORT (set by Render) expands. Service root is backend/, hence app.main:app.
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
