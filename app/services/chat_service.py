from sqlalchemy.orm import Session

from app.exceptions.ai import (
    AIAuthenticationError,
    AIInvalidResponseError,
    AIRateLimitError,
    AIServiceError,
    AITimeoutError,
)
from app.exceptions.conversation import ConversationNotFoundError
from app.models.message import Message
from app.providers.base import AIProvider
from app.schemas.chat import AIResponse, ChatRequest
from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService
import logging

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(
        self,
        provider: AIProvider,
        message_service: MessageService,
        conversation_service: ConversationService,
    ):
        self.provider = provider
        self.message_service = message_service
        self.conversation_service = conversation_service

    def _build_history(self, messages: list[Message]) -> list[dict]:
        history = []

        for message in messages:
            history.append(
                {
                    "role": message.role,
                    "parts": [
                        {
                            "text": message.content,
                        }
                    ],
                }
            )

        return history

    def generate_response(
        self,
        db: Session,
        request: ChatRequest,
    ) -> AIResponse:
        try:

            conversation = self.conversation_service.get_conversation_by_id(
                db,
                request.conversation_id,
            )

            if conversation is None:
                logger.info("Conversation not found")
                raise ConversationNotFoundError(request.conversation_id)

            # Save user message
            self.message_service.save_message(
                db=db,
                conversation_id=request.conversation_id,
                role="user",
                content=request.message,
            )

            # Load conversation history
            messages = self.message_service.get_conversation_messages(
                db=db,
                conversation_id=request.conversation_id,
            )

            # Convert database messages to provider format
            history = self._build_history(messages)

            # Generate AI response
            ai_response = self.provider.generate_response(history)

            # Save assistant response
            self.message_service.save_message(
                db=db,
                conversation_id=request.conversation_id,
                role="model",
                content=ai_response.answer,
            )

            # Commit transaction
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
