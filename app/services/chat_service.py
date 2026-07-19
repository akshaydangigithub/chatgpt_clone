from collections.abc import Iterator
from typing import Any

import logging
from sqlalchemy.orm import Session

from app.exceptions.conversation import ConversationNotFoundError
from app.models.message import Message
from app.providers.base import AIProvider
from app.schemas.chat import AIResponse, ChatRequest
from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService

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

    def _build_history(
        self,
        messages: list[Message],
    ) -> list[dict[str, Any]]:
        return [
            {
                "role": message.role,
                "parts": [{"text": message.content}],
            }
            for message in messages
        ]

    def _prepare_history(
        self,
        db: Session,
        request: ChatRequest,
    ) -> list[dict[str, Any]]:

        conversation = self.conversation_service.get_conversation_by_id(
            db,
            request.conversation_id,
        )

        if conversation is None:
            logger.warning(
                "Conversation %s not found",
                request.conversation_id,
            )
            raise ConversationNotFoundError(request.conversation_id)

        self.message_service.save_message(
            db=db,
            conversation_id=request.conversation_id,
            role="user",
            content=request.message,
        )

        messages = self.message_service.get_conversation_messages(
            db=db,
            conversation_id=request.conversation_id,
        )

        return self._build_history(messages)

    def _save_assistant_message(
        self,
        db: Session,
        conversation_id,
        content: str,
    ) -> None:
        self.message_service.save_message(
            db=db,
            conversation_id=conversation_id,
            role="model",
            content=content,
        )

    def generate_response(
        self,
        db: Session,
        request: ChatRequest,
    ) -> AIResponse:

        logger.info(
            "Generating AI response for conversation %s",
            request.conversation_id,
        )

        try:
            history = self._prepare_history(db, request)

            ai_response = self.provider.generate_response(history)

            self._save_assistant_message(
                db,
                request.conversation_id,
                ai_response.answer,
            )

            db.commit()

            logger.info(
                "AI response generated successfully for conversation %s",
                request.conversation_id,
            )

            return ai_response

        except Exception:
            db.rollback()
            logger.exception(
                "Failed to generate AI response for conversation %s",
                request.conversation_id,
            )
            raise

    def stream_response(
        self,
        db: Session,
        request: ChatRequest,
    ) -> Iterator[str]:

        logger.info(
            "Streaming AI response for conversation %s",
            request.conversation_id,
        )

        try:
            history = self._prepare_history(db, request)

            chunks: list[str] = []

            for chunk in self.provider.stream_response(history):
                chunks.append(chunk)
                yield chunk

            self._save_assistant_message(
                db,
                request.conversation_id,
                "".join(chunks),
            )

            db.commit()

            logger.info(
                "Streaming completed for conversation %s",
                request.conversation_id,
            )

        except Exception:
            db.rollback()
            logger.exception(
                "Streaming failed for conversation %s",
                request.conversation_id,
            )
            raise
