FROM python:3.10-slim

WORKDIR /app

# Cài đặt ffmpeg và git (cần cho whisper và pipeline)
RUN apt-get update && \
    apt-get install -y ffmpeg git && \
    rm -rf /var/lib/apt/lists/*

# Cài đặt thư viện Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source code
COPY . .

# Cấp quyền thực thi cho start script
RUN chmod +x start.sh

EXPOSE 8000

# Chạy cả FastAPI (app.main:app) + Celery (worker.celery_app) trong 1 container
CMD ["./start.sh"]
