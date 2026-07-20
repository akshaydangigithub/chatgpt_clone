import asyncio
from collections.abc import AsyncIterator
from typing import Any
from uuid import UUID

import logging
from sqlalchemy.orm import Session

from app.exceptions.ai import AIServiceError
from app.exceptions.conversation import ConversationNotFoundError
from app.models.message import Message
from app.providers.base import AIProvider
from app.schemas.chat import AIResponse, ChatRequest
from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService
from app.utils.sse import (
    format_done,
    format_error,
    format_heartbeat,
    format_message,
)

HEARTBEAT_INTERVAL_SECONDS = 15

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
        user_id: UUID,
    ) -> list[dict[str, Any]]:

        conversation = self.conversation_service.get_conversation_by_id(
            db,
            request.conversation_id,
            user_id,
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

    async def _generate_conversation_title(
        self,
        db: Session,
        request: ChatRequest,
        assistant_message: str,
        user_id: UUID,
    ) -> None:
        conversation = self.conversation_service.get_conversation_by_id(
            db,
            request.conversation_id,
            user_id,
        )

        # Only title a conversation once, on its first exchange.
        if conversation is None or conversation.title is not None:
            return

        try:
            conversation.title = await self.provider.generate_title(
                request.message,
                assistant_message,
            )
        except AIServiceError:
            # If the model is unavailable, fall back to a message snippet
            # so the conversation still gets a usable title.
            logger.warning(
                "AI title generation failed for conversation %s; "
                "falling back to message snippet",
                request.conversation_id,
            )
            self.conversation_service.generate_title(
                conversation,
                request.message,
            )

    async def generate_response(
        self,
        db: Session,
        request: ChatRequest,
        user_id: UUID,
    ) -> AIResponse:

        logger.info(
            "Generating AI response for conversation %s",
            request.conversation_id,
        )

        try:
            history = self._prepare_history(db, request, user_id)

            # provider.generate_response is a blocking (sync) network call, so
            # run it in a worker thread to avoid stalling the event loop.
            ai_response = await asyncio.to_thread(
                self.provider.generate_response,
                history,
            )

            self._save_assistant_message(
                db,
                request.conversation_id,
                ai_response.answer,
            )

            await self._generate_conversation_title(
                db,
                request,
                ai_response.answer,
                user_id,
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

    async def stream_response(
        self,
        db: Session,
        request: ChatRequest,
        user_id: UUID,
    ) -> AsyncIterator[str]:

        logger.info(
            "Streaming AI response for conversation %s",
            request.conversation_id,
        )

        history = self._prepare_history(db, request, user_id)

        chunks: list[str] = []
        queue: asyncio.Queue[tuple[str, Any]] = asyncio.Queue()

        async def produce() -> None:
            try:
                async for chunk in self.provider.stream_response(history):
                    chunks.append(chunk)
                    await queue.put(("data", format_message(chunk)))
            except Exception as exc:
                await queue.put(("error", exc))
            finally:
                await queue.put(("done", None))

        async def heartbeat() -> None:
            while True:
                await asyncio.sleep(HEARTBEAT_INTERVAL_SECONDS)
                await queue.put(("heartbeat", format_heartbeat()))

        producer = asyncio.create_task(produce())
        beat = asyncio.create_task(heartbeat())

        error: Exception | None = None

        try:
            while True:
                kind, payload = await queue.get()

                if kind == "done":
                    break

                if kind == "error":
                    error = payload
                    continue

                # "data" and "heartbeat" both carry a ready-to-send SSE frame.
                yield payload

            if error is not None:
                db.rollback()
                yield format_error(str(error))
                logger.error(
                    "Streaming failed for conversation %s: %s",
                    request.conversation_id,
                    error,
                )
                return

            assistant_message = "".join(chunks)

            self._save_assistant_message(
                db,
                request.conversation_id,
                assistant_message,
            )

            await self._generate_conversation_title(
                db,
                request,
                assistant_message,
                user_id,
            )

            db.commit()

            yield format_done()

            logger.info(
                "Streaming completed for conversation %s",
                request.conversation_id,
            )

        finally:
            beat.cancel()
            producer.cancel()
            await asyncio.gather(beat, producer, return_exceptions=True)
