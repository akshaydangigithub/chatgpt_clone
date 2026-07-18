from app.core.config import settings
from fastapi import HTTPException
from google import genai
from app.schemas.chat import ChatRequest, AIResponse
from google.genai import types
from app.models.message import Message
from sqlalchemy.orm import Session
from app.services.message_service import MessageService


class ChatService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = settings.GEMINI_MODEL
        self.message_service = MessageService()

    def _build_history(self, messages: list[Message]) -> list[dict]:
        history = []

        for message in messages:
            history.append({"role": message.role, "parts": [{"text": message.content}]})

        return history

    def generate_response(self, db: Session, request: ChatRequest) -> AIResponse:
        try:
            conversation_id = request.conversation_id

            self.message_service.save_message(
                db, conversation_id, role="user", content=request.message
            )

            messages = self.message_service.get_conversation_messages(
                db, conversation_id
            )

            history = self._build_history(messages)

            response = self.client.models.generate_content(
                model=self.model,
                contents=history,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AIResponse,
                ),
            )

            ai_response = response.parsed

            # Add model response
            self.message_service.save_message(
                db, conversation_id, role="model", content=ai_response.answer
            )

            return ai_response

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
