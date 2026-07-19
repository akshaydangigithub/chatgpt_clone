import asyncio
from collections.abc import AsyncIterator
from typing import Any

import logging
from sqlalchemy.orm import Session

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

    def _generate_conversation_title(
        self,
        db: Session,
        request: ChatRequest,
    ) -> None:
        conversation = self.conversation_service.get_conversation_by_id(
            db,
            request.conversation_id,
        )

        if conversation and conversation.title is None:
            self.conversation_service.generate_title(
                conversation,
                request.message,
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

            self._generate_conversation_title(db, request)

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
    ) -> AsyncIterator[str]:

        logger.info(
            "Streaming AI response for conversation %s",
            request.conversation_id,
        )

        history = self._prepare_history(db, request)

        chunks: list[str] = []
        # Single-producer/single-consumer queue that multiplexes real AI
        # chunks with periodic heartbeats onto one SSE stream.
        queue: asyncio.Queue[tuple[str, Any]] = asyncio.Queue()

        async def produce() -> None:
            try:
                async for chunk in self.provider.stream_response(history):
                    chunks.append(chunk)
                    await queue.put(("data", format_message(chunk)))
            except Exception as exc:  # noqa: BLE001 - surfaced to consumer
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

            self._save_assistant_message(
                db,
                request.conversation_id,
                "".join(chunks),
            )

            yield format_done()

            self._generate_conversation_title(db, request)

            db.commit()

            logger.info(
                "Streaming completed for conversation %s",
                request.conversation_id,
            )

        finally:
            beat.cancel()
            producer.cancel()
            await asyncio.gather(beat, producer, return_exceptions=True)
