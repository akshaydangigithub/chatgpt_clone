import logging
from collections.abc import AsyncIterator
from typing import Any

from google import genai
from google.genai import types
from tenacity import (
    before_sleep_log,
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

from app.core.circuit_breaker import CircuitBreaker
from app.exceptions.ai import (
    AIInvalidResponseError,
    AIRateLimitError,
    AITimeoutError,
)
from app.providers.base_provider import BaseAIProvider
from app.schemas.chat import AIResponse

logger = logging.getLogger(__name__)


def _is_retryable_exception(exc: BaseException) -> bool:
    """Gemini retries only on transient timeout / rate-limit errors."""

    return isinstance(exc, (AITimeoutError, AIRateLimitError))


gemini_retry = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception(_is_retryable_exception),
    reraise=True,
    before_sleep=before_sleep_log(logger, logging.WARNING),
)


class GeminiProvider(BaseAIProvider):
    """Gemini implementation of the :class:`AIProvider` contract."""

    name = "Gemini"

    def __init__(self, client: genai.Client, model: str, breaker: CircuitBreaker):
        super().__init__(breaker)
        self.client = client
        self.model = model

    @gemini_retry
    def generate_response(self, history: list[dict[str, Any]]) -> AIResponse:
        def _call() -> AIResponse:
            response = self.client.models.generate_content(
                model=self.model,
                contents=history,
                config=types.GenerateContentConfig(
                    response_schema=AIResponse,
                    response_mime_type="application/json",
                ),
            )
            return self._validate_response(response)

        return self._execute_sync("generate response", _call)

    async def stream_response(
        self,
        history: list[dict[str, Any]],
    ) -> AsyncIterator[str]:
        async def _call() -> AsyncIterator[str]:
            stream = await self.client.aio.models.generate_content_stream(
                model=self.model,
                contents=history,
            )
            async for chunk in stream:
                text = getattr(chunk, "text", None)
                if text:
                    yield text

        async for chunk in self._execute_stream("stream response", _call):
            yield chunk

    @gemini_retry
    async def generate_title(
        self,
        user_message: str,
        assistant_message: str,
    ) -> str:
        async def _call() -> str:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=self._build_title_prompt(user_message, assistant_message),
            )
            if not response.text:
                raise AIInvalidResponseError()
            return self._normalize_title(response.text)

        return await self._execute_async("generate title", _call)

    # --- Gemini-specific helpers -------------------------------------------

    def _validate_response(self, response: Any) -> AIResponse:
        """Ensure Gemini returned a schema-valid, parsed response."""

        if response is None or response.parsed is None:
            raise AIInvalidResponseError()

        return response.parsed

    def _build_title_prompt(
        self,
        user_message: str,
        assistant_message: str,
    ) -> str:
        return f"""
            Generate a concise conversation title.

            Rules:
            - Maximum 5 words.
            - Use Title Case.
            - Do not use quotes.
            - Do not end with punctuation.
            - Return only the title.

            User:
            {user_message}

            Assistant:
            {assistant_message}
            """

    def _normalize_title(self, raw_title: str) -> str:
        title = raw_title.strip()
        title = title.removeprefix("Title:").strip()
        # Strip surrounding quotes and trailing punctuation in either order,
        # e.g. both 'Trip To Japan.' and '"Trip To Japan".'.
        title = title.strip("\"'")
        title = title.rstrip(".!?,;: ")
        title = title.strip("\"'")
        return title.strip()
