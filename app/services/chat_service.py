from google import genai
from app.schemas.chat import ChatRequest, AIResponse
from google.genai import types
from app.models.message import Message
from sqlalchemy.orm import Session
from app.services.message_service import MessageService
from app.services.conversation_service import ConversationService
from app.exceptions.conversation import ConversationNotFoundError
from app.exceptions.ai import (
    AIServiceError,
    AIInvalidResponseError,
    AIRateLimitError,
    AIAuthenticationError,
    AITimeoutError,
)


class ChatService:
    def __init__(
        self,
        client: genai.Client,
        model: str,
        message_service: MessageService,
        conversation_service: ConversationService,
    ):
        self.client = client
        self.model = model
        self.message_service = message_service
        self.conversation_service = conversation_service

    def _build_history(self, messages: list[Message]) -> list[dict]:
        history = []

        for message in messages:
            history.append({"role": message.role, "parts": [{"text": message.content}]})

        return history

    def generate_response(
        self,
        db: Session,
        request: ChatRequest,
    ) -> AIResponse:
        try:
            # ---- Validate conversation
            conversation = self.conversation_service.get_conversation_by_id(
                db,
                request.conversation_id,
            )

            if conversation is None:
                raise ConversationNotFoundError(request.conversation_id)

            # ---- Save user message
            self.message_service.save_message(
                db=db,
                conversation_id=request.conversation_id,
                role="user",
                content=request.message,
            )

            # ---- Load history
            messages = self.message_service.get_conversation_messages(
                db,
                request.conversation_id,
            )

            history = self._build_history(messages)

            # ---- Call Gemini
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=history,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=AIResponse,
                    ),
                )

            except Exception as e:
                raise AIServiceError() from e

            # ---- Validate AI response
            ai_response = response.parsed

            if ai_response is None:
                raise AIInvalidResponseError()

            # ---- Save assistant message
            self.message_service.save_message(
                db=db,
                conversation_id=request.conversation_id,
                role="model",
                content=ai_response.answer,
            )

            # ---- Commit Transaction
            db.commit()

            return ai_response

        except (
            ConversationNotFoundError,
            AIServiceError,
            AIInvalidResponseError,
            AIRateLimitError,
            AITimeoutError,
            AIAuthenticationError,
        ):
            db.rollback()
            raise

        except Exception:
            db.rollback()
            raise
