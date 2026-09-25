from fastapi import FastAPI
from app.routers.video import router

app = FastAPI(
    title="Video Worker Service",
    description="FastAPI gateway nhận lệnh xử lý video từ NestJS và đẩy vào Celery queue",
    version="1.0.0",
)

app.include_router(router)
