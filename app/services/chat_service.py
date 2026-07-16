from app.core.config import settings
from fastapi import HTTPException
from google import genai


class ChatService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = settings.GEMINI_MODEL
        self.history = []

    def generate_response(self, message: str) -> str:
        try:

            self.history.append({"role": "user", "parts": [{"text": message}]})

            print(self.history)

            response = self.client.models.generate_content(
                model=self.model,
                contents=self.history,
            )

            self.history.append({"role": "model", "parts": [{"text": response.text}]})
            return response.text

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
