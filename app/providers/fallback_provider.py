import logging
from collections.abc import AsyncIterator
from typing import Any

from app.exceptions.ai import AIServiceError
from app.providers.base import AIProvider
from app.schemas.chat import AIResponse

logger = logging.getLogger(__name__)


class FallbackProvider(AIProvider):
    """
    Composite provider that tries each wrapped provider in order.

    It owns no resilience of its own — every wrapped provider already carries
    its own circuit breaker / retry — so this class only implements the
    ordered try-next-on-failure policy across providers.
    """

    def __init__(self, providers: list[AIProvider]):
        self.providers = providers

    def generate_response(
        self,
        history: list[dict[str, Any]],
    ) -> AIResponse:

        failures: list[str] = []

        for provider in self.providers:
            try:
                logger.info("Trying provider: %s", provider.__class__.__name__)
                return provider.generate_response(history)
            except AIServiceError as e:
                self._record_failure(failures, provider, e)

        raise self._all_failed(failures)

    async def stream_response(
        self,
        history: list[dict[str, Any]],
    ) -> AsyncIterator[str]:

        failures: list[str] = []

        for provider in self.providers:
            try:
                logger.info(
                    "Trying provider (stream): %s",
                    provider.__class__.__name__,
                )
                async for chunk in provider.stream_response(history):
                    yield chunk
                return
            except AIServiceError as e:
                self._record_failure(failures, provider, e)

        raise self._all_failed(failures)

    async def generate_title(
        self,
        user_message: str,
        assistant_message: str,
    ) -> str:

        failures: list[str] = []

        for provider in self.providers:
            try:
                logger.info(
                    "Trying provider (title): %s",
                    provider.__class__.__name__,
                )
                return await provider.generate_title(user_message, assistant_message)
            except AIServiceError as e:
                self._record_failure(failures, provider, e)

        raise self._all_failed(failures)

    # --- helpers -----------------------------------------------------------

    def _record_failure(
        self,
        failures: list[str],
        provider: AIProvider,
        error: AIServiceError,
    ) -> None:
        logger.warning(
            "Provider '%s' failed: %s",
            provider.__class__.__name__,
            str(error),
        )
        failures.append(f"{provider.__class__.__name__}: {error}")

    def _all_failed(self, failures: list[str]) -> AIServiceError:
        error_message = "All AI providers failed.\n" + "\n".join(failures)
        logger.error(error_message)
        return AIServiceError(error_message)
