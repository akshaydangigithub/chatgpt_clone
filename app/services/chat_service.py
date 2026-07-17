from app.core.config import settings
from fastapi import HTTPException
from google import genai
from app.schemas.chat import ChatRequest, AIResponse
from google.genai import types


class ChatService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = settings.GEMINI_MODEL
        self.conversations = {}

    def generate_response(self, request: ChatRequest) -> AIResponse:
        try:
            conversation_id = request.conversation_id

            # Create conversation if it doesn't exist
            if conversation_id not in self.conversations:
                self.conversations[conversation_id] = []

            # Add user message
            self.conversations[conversation_id].append(
                {
                    "role": "user",
                    "parts": [{"text": request.message}],
                }
            )

            response = self.client.models.generate_content(
                model=self.model,
                contents=self.conversations[conversation_id],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AIResponse,
                ),
            )

            ai_response = response.parsed

            # Add model response
            self.conversations[conversation_id].append(
                {
                    "role": "model",
                    "parts": [{"text": ai_response.answer}],
                }
            )

            return ai_response

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
