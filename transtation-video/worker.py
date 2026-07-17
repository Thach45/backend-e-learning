from config import app
from pipeline import VideoDubbingPipeline
from tts import generate_edge_voice, generate_fpt_voice

@app.task(name='worker.process_dubbing_video')
def process_dubbing_video(video_id: str, video_url: str, is_translate: bool = True) -> str:
    """Celery task entry point to dub and transcribe custom lectures."""
    pipeline = VideoDubbingPipeline(video_id, video_url, is_translate)
    return pipeline.run()