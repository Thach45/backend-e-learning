import os
import logging
import whisper
from pathlib import Path
from celery import Celery
from google import genai
from dotenv import load_dotenv

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)

# Initialize Celery
REDIS_BROKER_URL = os.getenv("REDIS_BROKER_URL")
if not REDIS_BROKER_URL:
    raise RuntimeError("Missing REDIS_BROKER_URL in environment.")
app = Celery('video_worker', broker=REDIS_BROKER_URL)

# Initialize Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY in environment.")
client = genai.Client(api_key=GEMINI_API_KEY)

FPT_API_KEY = os.getenv("FPT_API_KEY", "")

# Load Whisper model globally
logger.info("Đang tải AI Whisper vào RAM...")
whisper_model = whisper.load_model("base")

# Cloudflare R2 Configurations
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "thay_account_id_cua_ban")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "thay_access_key")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "thay_secret_key")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "elearning-videos")
R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN", "https://pub-xxxxx.r2.dev")

# NestJS Webhook configuration
BACKEND_WEBHOOK_URL = os.getenv("BACKEND_WEBHOOK_URL", "http://127.0.0.1:3000/api/webhook/video-done")
