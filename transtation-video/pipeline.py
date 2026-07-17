import os
import re
import requests
import gdown
import subprocess
import boto3
import mimetypes
from pydub import AudioSegment
from config import (
    R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, 
    R2_BUCKET_NAME, R2_PUBLIC_DOMAIN, BACKEND_WEBHOOK_URL, whisper_model, logger
)
from tts import TTSFactory
from translation import TranslationService

def format_time_srt(seconds: float) -> str:
    """Formats float seconds into standard SRT time format (HH:MM:SS,mmm)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def download_video(url: str, save_path: str) -> None:
    """Downloads video supporting standard direct URLs, Cloudinary, and Google Drive."""
    drive_pattern = r'(https?://drive\.google\.com/(?:file/d/|open\?id=)|https?://docs\.google\.com/uc\?id=)([a-zA-Z0-9_-]+)'
    match = re.search(drive_pattern, url)
    
    if match:
        logger.info("Detecting Google Drive link, initializing download via gdown...")
        file_id = match.group(2)
        direct_url = f'https://drive.google.com/uc?id={file_id}'
        try:
            gdown.download(direct_url, save_path, quiet=False)
        except Exception as e:
            raise Exception(f"Failed downloading from Google Drive: {str(e)}")
    else:
        logger.info("Downloading file using standard stream request...")
        try:
            with requests.get(url, stream=True, timeout=60) as response:
                response.raise_for_status()
                with open(save_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=1024 * 1024):
                        if chunk:
                            f.write(chunk)
        except Exception as e:
            raise Exception(f"Failed downloading video: {str(e)}")


class VideoDubbingPipeline:
    """Manages the full end-to-end video processing and dubbing workflow."""
    def __init__(self, video_id: str, video_url: str, is_translate: bool = True):
        self.video_id = video_id
        self.video_url = video_url
        self.is_translate = is_translate
        
        # Setup paths
        project_root = os.path.dirname(os.path.abspath(__file__))
        self.temp_dir = os.path.join(project_root, "tmp")
        
        self.video_goc = os.path.join(self.temp_dir, f"{video_id}_video_goc.mp4")
        self.audio_goc = os.path.join(self.temp_dir, f"{video_id}_audio_goc.wav")
        self.audio_vi = os.path.join(self.temp_dir, f"{video_id}_audio_vi.wav")
        self.file_srt = os.path.join(self.temp_dir, f"{video_id}_phude.srt")
        self.video_final = os.path.join(self.temp_dir, f"{video_id}_final.mp4")
        
        # Select active TTS engine
        self.tts = TTSFactory.get_engine("edge")

    def run(self) -> str:
        try:
            os.makedirs(self.temp_dir, exist_ok=True)

            # Step 1: Download Video
            logger.info("[0/4] Downloading original video...")
            download_video(self.video_url, self.video_goc)

            if not self.is_translate:
                logger.info("[HLS] Skipping translation. Starting direct standard HLS slicing...")
                self._generate_hls_standard()
            else:
                # Step 2: Extract Original Audio
                logger.info("[1/4] Extracting original audio via FFmpeg...")
                subprocess.run([
                    "ffmpeg", "-y", "-i", self.video_goc, 
                    "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", self.audio_goc
                ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

                # Step 3: Transcription
                logger.info("[2/4] Whisper transcribing audio...")
                transcribe_result = whisper_model.transcribe(self.audio_goc)
                segments = transcribe_result.get("segments", [])

                # Step 4: Batch Translation
                logger.info(f"[3/4] Packaging {len(segments)} segments for batch translation...")
                english_texts = [seg["text"].strip() for seg in segments if seg["text"].strip()]
                translated_texts = TranslationService.translate_segments(english_texts)

                # Step 5: Build Dubbed Track & Subtitles
                self._build_audio_track_and_subtitles(segments, translated_texts)

                # Step 6: Multiplex and Render Final Multilingual Video
                logger.info("[4/4] Remuxing final video with multi-audio and subtitles...")
                self._remux_video()

                # Step 7: HLS Slicing
                logger.info("[HLS] Starting HLS slicing into 1080p and 720p...")
                self._generate_hls()

            # Step 8: Upload to Cloudflare R2
            logger.info("[R2] Starting HLS upload to Cloudflare R2...")
            master_url = self._upload_hls_to_r2()

            logger.info(f"Task completed successfully! HLS Public link: {master_url}")
            
            # Post success webhook notification back to NestJS
            self._trigger_webhook(status="SUCCESS", new_url=master_url)

            # Post-processing cleanup of the entire HLS output directory and source files
            self._cleanup_all()
            return master_url

        except Exception as e:
            logger.exception(f"Pipeline processing failed: {str(e)}")
            self._trigger_webhook(status="FAILED", new_url="")
            self._cleanup_all(force=True)
            return "FAILED"


    def _build_audio_track_and_subtitles(self, segments: list, translated_texts: list):
        """Assembles the Vietnamese dubbed track and structures the SRT subtitles."""
        audio_goc_pydub = AudioSegment.from_file(self.audio_goc)
        total_duration_ms = len(audio_goc_pydub)
        dubbed_track = AudioSegment.silent(duration=total_duration_ms)
        
        srt_content = ""
        vi_index = 0

        for i, seg in enumerate(segments):
            text_en = seg["text"].strip()
            if not text_en:
                continue

            start_time_ms = int(seg["start"] * 1000)
            
            # Calculate maximum allowed space before the next segment starts
            if i < len(segments) - 1:
                next_start_ms = int(segments[i+1]["start"] * 1000)
                max_allowed_duration_ms = next_start_ms - start_time_ms
            else:
                max_allowed_duration_ms = 5000 

            # Map the translated text or default to English if index out of range
            text_vi = translated_texts[vi_index] if vi_index < len(translated_texts) else text_en
            vi_index += 1

            logger.info(f"Segment ({seg['start']}s): {text_en} -> {text_vi}")
            
            # Format subtitle block
            start_str = format_time_srt(seg["start"])
            end_str = format_time_srt(seg["end"])
            srt_content += f"{i+1}\n{start_str} --> {end_str}\n{text_vi}\n\n"
            
            # Generate local TTS file
            temp_seg_file = os.path.join(self.temp_dir, f"temp_voice_{start_time_ms}.mp3")
            self.tts.generate(text_vi, temp_seg_file)
            
            seg_audio = AudioSegment.from_file(temp_seg_file)
            tts_duration_ms = len(seg_audio)
            
            # Enforce speed adjustments if the TTS duration exceeds the allocated slot
            if tts_duration_ms > max_allowed_duration_ms:
                ratio = min(tts_duration_ms / max_allowed_duration_ms, 1.8)
                logger.info(f"  ⚠️ Audio length exceeded ({tts_duration_ms}ms > {max_allowed_duration_ms}ms). Rescaling speed by x{round(ratio, 2)}...")
                
                speedup_file = os.path.join(self.temp_dir, f"speedup_{start_time_ms}.mp3")
                subprocess.run([
                    "ffmpeg", "-y", "-i", temp_seg_file, 
                    "-filter:a", f"atempo={ratio}", 
                    speedup_file
                ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
                seg_audio = AudioSegment.from_file(speedup_file)
                os.remove(speedup_file)
                
            dubbed_track = dubbed_track.overlay(seg_audio, position=start_time_ms)
            os.remove(temp_seg_file)
            
        # Export final audio track and save SRT file
        dubbed_track.export(self.audio_vi, format="wav")
        with open(self.file_srt, "w", encoding="utf-8") as f:
            f.write(srt_content)

    def _remux_video(self):
        """Muxes the original video stream, original English track, dubbed Vietnamese track, and subtitles."""
        subprocess.run([
            "ffmpeg", "-y", 
            "-i", self.video_goc,      
            "-i", self.audio_vi,  
            "-i", self.file_srt,
            "-map", "0:v",        # Original Video stream
            "-map", "0:a:0",      # Original English audio track
            "-map", "1:a:0",      # Dubbed Vietnamese audio track
            "-map", "2:s",        # SRT subtitle stream
            "-c:v", "copy",       
            "-c:a", "aac",
            "-metadata:s:a:0", "language=eng",
            "-metadata:s:a:0", "title=English",
            "-disposition:a:0", "default",
            "-metadata:s:a:1", "language=vie",
            "-metadata:s:a:1", "title=Vietnamese",
            "-disposition:a:1", "0",
            "-c:s", "mov_text",   # Compatible subtitle format for MP4 containers
            self.video_final
        ], check=True)

    def _generate_hls(self):
        """Slices the finalized multi-track video file into standard HLS streams (1080p and 720p)."""
        output_dir = os.path.join(self.temp_dir, f"{self.video_id}_hls")
        os.makedirs(output_dir, exist_ok=True)
        master_playlist = os.path.join(output_dir, "master.m3u8")

        # HLS FFmpeg command mapping the video and two audio tracks
        command = [
            'ffmpeg', '-y', '-i', self.video_final,
            
            # --- BÓC TÁCH VÀ RENDER VIDEO (Hình ảnh) ---
            # Map hình ảnh ra làm bản 1080p
            '-map', '0:v:0', '-c:v:0', 'libx264', '-b:v:0', '5000k', '-s:v:0', '1920x1080',
            # Map hình ảnh ra làm bản 720p
            '-map', '0:v:0', '-c:v:1', 'libx264', '-b:v:1', '2500k', '-s:v:1', '1280x720',
            
            # --- BÓC TÁCH AUDIO (Âm thanh) ---
            # Map track tiếng Việt (từ track audio thứ 2 của video_final)
            '-map', '0:a:1', '-c:a:0', 'aac', '-b:a:0', '128k',
            # Map track tiếng Anh (từ track audio thứ 1 của video_final)
            '-map', '0:a:0', '-c:a:1', 'aac', '-b:a:1', '128k',
            
            # --- THIẾT LẬP HLS & MASTER PLAYLIST ---
            '-f', 'hls',
            '-hls_time', '6', # Mỗi cục .ts dài 6 giây
            '-hls_playlist_type', 'vod', # Khai báo đây là Video On Demand
            '-hls_flags', 'independent_segments',
            '-master_pl_name', 'master.m3u8',
            
            # --- ĐỊNH NGHĨA SỰ LIÊN KẾT (VAR STREAM MAP) ---
            '-var_stream_map', 
            'v:0,agroup:audio_group ' +
            'v:1,agroup:audio_group ' +
            'a:0,agroup:audio_group,language:vi,default:yes,name:Tiếng_Việt ' +
            'a:1,agroup:audio_group,language:en,name:English',
            
            f'{output_dir}/stream_%v/playlist.m3u8'
        ]

        logger.info("🚀 Đang khởi chạy Worker băm HLS...")
        
        # Chạy lệnh
        process = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if process.returncode == 0:
            logger.info(f"✅ Băm HLS thành công! File lưu tại: {master_playlist}")
        else:
            logger.error("❌ Lỗi FFmpeg HLS:")
            logger.error(process.stderr)
            raise Exception("HLS generation failed via FFmpeg")

    def _generate_hls_standard(self):
        """Slices the original video directly into HLS without multi-audio dubbing."""
        output_dir = os.path.join(self.temp_dir, f"{self.video_id}_hls")
        os.makedirs(output_dir, exist_ok=True)
        master_playlist = os.path.join(output_dir, "master.m3u8")

        # Standard HLS slice command for single audio track mapped to multiple qualities
        command = [
            'ffmpeg', '-y', '-i', self.video_goc,
            
            # --- VIDEO RENDER ---
            # 1080p
            '-map', '0:v:0', '-c:v:0', 'libx264', '-b:v:0', '5000k', '-s:v:0', '1920x1080',
            # 720p
            '-map', '0:v:0', '-c:v:1', 'libx264', '-b:v:1', '2500k', '-s:v:1', '1280x720',
            
            # --- AUDIO RENDER ---
            # Map the original audio stream to the first output audio stream (for 1080p)
            '-map', '0:a:0', '-c:a:0', 'aac', '-b:a:0', '128k',
            # Map the original audio stream to the second output audio stream (for 720p)
            '-map', '0:a:0', '-c:a:1', 'aac', '-b:a:1', '128k',
            
            # --- HLS SETTINGS ---
            '-f', 'hls',
            '-hls_time', '6',
            '-hls_playlist_type', 'vod',
            '-hls_flags', 'independent_segments',
            '-master_pl_name', 'master.m3u8',
            
            # --- PLAYLIST & SEGMENT CONFIG ---
            '-var_stream_map', 'v:0,a:0 v:1,a:1',
            f'{output_dir}/stream_%v/playlist.m3u8'
        ]
        
        logger.info(f"Running standard HLS command: {' '.join(command)}")
        
        process = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if process.returncode == 0:
            logger.info(f"✅ Standard HLS generation succeeded! Master playlist: {master_playlist}")
        else:
            logger.error("❌ FFmpeg Standard HLS failed:")
            logger.error(process.stderr)
            raise Exception("Standard HLS generation failed via FFmpeg")

    def _upload_hls_to_r2(self) -> str:

        """Uploads the sliced HLS files to Cloudflare R2 and returns the public master URL."""
        local_dir = os.path.join(self.temp_dir, f"{self.video_id}_hls")
        lesson_id = self.video_id
        
        logger.info(f"☁️ Đang upload lên Cloudflare R2 cho bài học {lesson_id}...")
        
        s3_client = boto3.client(
            's3',
            endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            region_name='auto'
        )

        for root, dirs, files in os.walk(local_dir):
            for file in files:
                local_path = os.path.join(root, file)
                relative_path = os.path.relpath(local_path, local_dir)
                s3_key = f"lessons/{lesson_id}/{relative_path}".replace("\\", "/")
                
                content_type, _ = mimetypes.guess_type(local_path)
                if file.endswith('.m3u8'):
                    content_type = 'application/vnd.apple.mpegurl'
                elif file.endswith('.ts'):
                    content_type = 'video/MP2T'
                    
                s3_client.upload_file(
                    local_path, 
                    R2_BUCKET_NAME, 
                    s3_key,
                    ExtraArgs={'ContentType': content_type or 'application/octet-stream'}
                )
                logger.info(f"  -> Đã up: {s3_key}")

        master_url = f"{R2_PUBLIC_DOMAIN}/lessons/{lesson_id}/master.m3u8"
        logger.info(f"✅ Upload hoàn tất! Link HLS: {master_url}")
        return master_url

    def _cleanup_all(self, force: bool = False):
        """Deletes all workspace intermediary files and local HLS temporary outputs."""
        files_to_remove = [self.audio_goc, self.audio_vi, self.file_srt, self.video_final]
        if force:
            files_to_remove.append(self.video_goc)
        else:
            files_to_remove.append(self.video_goc)

        # Remove primary workspace files
        for file_path in files_to_remove:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except OSError as e:
                logger.error(f"Error removing temporary file {file_path}: {str(e)}")

        # Remove HLS local sliced folder
        hls_dir = os.path.join(self.temp_dir, f"{self.video_id}_hls")
        if os.path.exists(hls_dir):
            for root, dirs, files in os.walk(hls_dir, topdown=False):
                for name in files:
                    try:
                        os.remove(os.path.join(root, name))
                    except OSError:
                        pass
                for name in dirs:
                    try:
                        os.rmdir(os.path.join(root, name))
                    except OSError:
                        pass
            try:
                os.rmdir(hls_dir)
            except OSError:
                pass

    def _trigger_webhook(self, status: str, new_url: str):
        """Notifies the NestJS backend about the HLS slicing task results."""
        payload = {
            "video_id": self.video_id,
            "status": status,
            "new_url": new_url
        }
        try:
            logger.info(f"☎️ Đang gửi webhook báo kết quả xử lý cho Backend: {BACKEND_WEBHOOK_URL}...")
            response = requests.post(BACKEND_WEBHOOK_URL, json=payload, timeout=10)
            if response.status_code == 201 or response.status_code == 200:
                logger.info("  -> Gửi webhook thành công!")
            else:
                logger.warning(f"  -> Gửi webhook thất bại, NestJS trả về status code: {response.status_code}")
        except Exception as e:
            logger.warning(f"  -> Lỗi kết nối đến webhook của Backend: {str(e)}")

