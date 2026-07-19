from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)

from google import genai
from google.genai import types

from app.exceptions.ai import (
    AIInvalidResponseError,
    AIServiceError,
    AIRateLimitError,
    AITimeoutError,
)
from app.providers.base import AIProvider
from app.schemas.chat import AIResponse
import logging
from typing import Any
from app.core.circuit_breaker import CircuitBreaker
from pydantic import ValidationError
from collections.abc import AsyncIterator

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):

    def __init__(self, client: genai.Client, model: str, breaker: CircuitBreaker):
        self.client = client
        self.model = model
        self.breaker = breaker

    def is_retryable_exception(exc: BaseException) -> bool:
        return isinstance(exc, (AITimeoutError, AIRateLimitError))

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(
            multiplier=1,
            min=1,
            max=10,
        ),
        retry=retry_if_exception_type(is_retryable_exception),
        reraise=True,
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )
    def generate_response(
        self,
        history: list[dict[str, Any]],
    ) -> AIResponse:

        self.breaker.before_request()

        try:
            logger.info("Calling Gemini")

            response = self.client.models.generate_content(
                model=self.model,
                contents=history,
                config=types.GenerateContentConfig(
                    response_schema=AIResponse,
                    response_mime_type="application/json",
                ),
            )

            if response.parsed is None:
                raise AIInvalidResponseError(
                    "Gemini returned an empty or invalid response."
                )

            self.breaker.record_success()

            logger.info("Gemini response received")

            return response.parsed

        except Exception as e:
            self.breaker.record_failure()
            logger.exception("Gemini request failed")
            raise self._map_exception(e) from e

    async def stream_response(
        self,
        history: list[dict[str, Any]],
    ) -> AsyncIterator[str]:
        """
        Stream AI response chunks from Gemini using the async SDK client.

        Yields:
            Plain text chunks from the AI provider.
        """

        self.breaker.before_request()

        try:
            logger.info("Calling Gemini Stream API")

            stream = await self.client.aio.models.generate_content_stream(
                model=self.model,
                contents=history,
            )

            async for chunk in stream:
                if not hasattr(chunk, "text"):
                    continue

                if chunk.text:
                    yield chunk.text

            self.breaker.record_success()
            logger.info("Gemini stream completed successfully")

        except Exception as e:
            self.breaker.record_failure()
            logger.exception("Gemini streaming failed")
            raise self._map_exception(e) from e

    def _map_exception(self, exc: Exception) -> Exception:

        if isinstance(exc, AIServiceError):
            return exc

        if isinstance(exc, ValidationError):
            return AIInvalidResponseError("AI provider returned an invalid response.")

        if isinstance(exc, TimeoutError):
            return AITimeoutError("AI provider request timed out.")

        return AIServiceError(f"Unexpected AI provider error: {exc}")
