import os
import time
import base64
import asyncio
import requests
import edge_tts
from config import FPT_API_KEY, logger

class BaseTTSEngine:
    """Base class defining the interface for all TTS Engines."""
    def generate(self, text: str, save_path: str) -> None:
        raise NotImplementedError("Each TTS Engine must implement 'generate'.")


class EdgeTTSEngine(BaseTTSEngine):
    """TTS Engine using Microsoft Edge TTS (Online & Free)."""
    def __init__(self, voice: str = "vi-VN-NamMinhNeural", retries: int = 10, delay: float = 3.0):
        self.voice = voice
        self.retries = retries
        self.delay = delay

    def generate(self, text: str, save_path: str) -> None:
        text = text.replace('*', '').replace('"', "'").strip()
        if not text:
            return

        async def _run():
            for attempt in range(self.retries):
                try:
                    communicate = edge_tts.Communicate(text, self.voice)
                    await communicate.save(save_path)
                    return
                except Exception as e:
                    if attempt == self.retries - 1:
                        raise e
                    logger.warning(f"Edge TTS error on attempt {attempt + 1}: {str(e)}. Retrying in {self.delay}s...")
                    await asyncio.sleep(self.delay)

        asyncio.run(_run())
        # Safe delay after generation
        time.sleep(1.0)



class FptTTSEngine(BaseTTSEngine):
    """TTS Engine using FPT.AI API."""
    def __init__(self, api_key: str = None, voice: str = "leminh"):
        self.api_key = api_key or FPT_API_KEY
        self.voice = voice

    def generate(self, text: str, save_path: str) -> None:
        if not self.api_key:
            raise RuntimeError("FPT API Key is missing.")

        url = "https://api.fpt.ai/hmi/tts/v5"
        payload = text.encode('utf-8')
        headers = {
            'api-key': self.api_key,
            'voice': self.voice,
            'speed': ''
        }

        response = requests.post(url, headers=headers, data=payload)
        if response.status_code != 200:
            raise Exception(f"FPT API error: {response.text}")

        audio_url = response.json().get('async')
        
        # Polling for FPT to process the voice file (up to 30 seconds)
        for _ in range(30):
            time.sleep(1)
            res = requests.get(audio_url)
            if res.status_code == 200:
                with open(save_path, 'wb') as f:
                    f.write(res.content)
                return

        raise TimeoutError("FPT AI Voice processing timed out.")


class TTSFactory:
    """Factory to retrieve designated TTS engines."""
    _engines = {
        "edge": EdgeTTSEngine,
        "fpt": FptTTSEngine
    }

    @classmethod
    def get_engine(cls, name: str = "edge", **kwargs) -> BaseTTSEngine:
        engine_cls = cls._engines.get(name.lower())
        if not engine_cls:
            raise ValueError(f"Unknown TTS Engine: {name}")
        return engine_cls(**kwargs)


# Helper backward compatibility functions requested by the user

def generate_edge_voice(text: str, save_path: str):
    TTSFactory.get_engine("edge").generate(text, save_path)

def generate_fpt_voice(text: str, save_path: str):
    TTSFactory.get_engine("fpt").generate(text, save_path)
