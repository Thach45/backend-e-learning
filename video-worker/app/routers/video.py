import os
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from worker.celery_app import celery_app

router = APIRouter()

INTERNAL_SECRET = os.getenv("INTERNAL_API_SECRET", "")


class ProcessVideoRequest(BaseModel):
    lesson_id: str
    video_url: str
    is_translate: bool = True


@router.post("/process-video")
async def process_video(
    req: ProcessVideoRequest,
    x_internal_secret: str = Header(default=""),
):
    """
    Nhận yêu cầu xử lý video từ NestJS.
    Xác thực internal secret rồi đẩy task vào Celery queue.
    """
    if INTERNAL_SECRET and x_internal_secret != INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid internal secret")

    # Dùng send_task để tránh import nặng (Whisper) vào FastAPI process
    task = celery_app.send_task(
        "worker.tasks.process_dubbing_video",
        args=[req.lesson_id, req.video_url, req.is_translate],
    )

    return {
        "success": True,
        "task_id": task.id,
        "message": f"Task queued successfully for lesson {req.lesson_id}",
    }


@router.get("/health")
async def health_check():
    """Health check endpoint dùng cho Render và monitoring."""
    return {"status": "ok", "service": "video-worker"}
