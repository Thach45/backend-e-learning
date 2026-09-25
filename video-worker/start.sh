#!/bin/bash
set -e

echo "🚀 Starting Video Worker Service..."

# Khởi động Celery Worker ở background (pool=solo để fix lỗi deadlock của AI model)
echo "⚙️  Starting Celery Worker (pool=solo)..."
celery -A worker.celery_app worker \
    --pool=solo \
    --loglevel=info &

CELERY_PID=$!
echo "✅ Celery Worker started (PID: $CELERY_PID)"

# Khởi động FastAPI ở foreground
echo "🌐 Starting FastAPI Server on port ${PORT:-8000}..."
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
