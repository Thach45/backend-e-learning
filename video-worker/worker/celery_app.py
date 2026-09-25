import os
from pathlib import Path
from dotenv import load_dotenv
from celery import Celery

# Load .env từ root của video-worker/
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)

REDIS_BROKER_URL = os.getenv("REDIS_BROKER_URL")
if not REDIS_BROKER_URL:
    raise RuntimeError("Missing REDIS_BROKER_URL in environment.")

# Celery instance nhẹ — chỉ kết nối Redis, không load Whisper hay AI models
celery_app = Celery(
    "video_worker",
    broker=REDIS_BROKER_URL,
    include=["worker.tasks"],  # Tự động discover tasks khi worker khởi động
)
