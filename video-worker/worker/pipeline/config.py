import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Load .env từ root video-worker/
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)

# Initialize Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY in environment.")
client = genai.Client(api_key=GEMINI_API_KEY)

FPT_API_KEY = os.getenv("FPT_API_KEY", "")

# Deepgram API Key
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "")

# Cloudflare R2 Configurations
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "elearning-videos")
R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN", "https://pub-xxxxx.r2.dev")

# NestJS Webhook configuration
BACKEND_WEBHOOK_URL = os.getenv("BACKEND_WEBHOOK_URL", "http://127.0.0.1:3000/api/webhook/video-done")
