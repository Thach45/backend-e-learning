from worker.celery_app import celery_app
from worker.pipeline.pipeline import VideoDubbingPipeline


@celery_app.task(name="worker.tasks.process_dubbing_video")
def process_dubbing_video(video_id: str, video_url: str, is_translate: bool = True) -> str:
    """
    Celery task entry point.
    Nhận video_id và video_url, chạy toàn bộ pipeline:
    Download → Whisper → Translate → TTS → HLS → Upload R2 → Webhook.
    """
    pipeline = VideoDubbingPipeline(video_id, video_url, is_translate)
    return pipeline.run()
