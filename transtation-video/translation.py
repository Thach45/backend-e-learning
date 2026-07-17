import json
from config import client, logger

class TranslationService:
    """Handles multilingual translations via Gemini AI."""
    @staticmethod
    def translate_segments(english_texts: list) -> list:
        if not english_texts:
            return []

        prompt = f"""
        Đóng vai chuyên gia IT giảng bài. Hãy dịch mảng JSON chứa các câu tiếng Anh này sang tiếng Việt.
        Yêu cầu BẮT BUỘC:
        1. Giữ nguyên thuật ngữ chuyên ngành (NestJS, CLI, Framework...).
        2. Dịch thật ngắn gọn súc tích để khớp thời gian lồng tiếng.
        3. TUYỆT ĐỐI KHÔNG sử dụng dấu ngoặc kép (") bên trong nội dung câu dịch. Dùng dấu ngoặc đơn (') nếu cần.
        4. CHỈ trả về đúng 1 mảng JSON hợp lệ chứa các câu tiếng Việt. KHÔNG TRẢ VỀ GÌ KHÁC.
        Độ dài mảng tiếng Việt phải bằng chính xác độ dài mảng gốc.

        Dữ liệu gốc:
        {json.dumps(english_texts, ensure_ascii=False)}
        """

        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            raw_text = response.text.strip()
            
            # Clean possible markdown block wrapping
            if raw_text.startswith("```"):
                raw_text = raw_text.split("\n", 1)[1].rsplit("\n", 1)[0]
                
            translated_texts = json.loads(raw_text)
            logger.info(f"Successfully translated {len(translated_texts)} segments!")
            return translated_texts
        except Exception as e:
            logger.error(f"Gemini translation or JSON parsing failed: {str(e)}")
            return []
