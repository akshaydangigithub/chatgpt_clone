from typing import Any

from app.exceptions.ai import AIServiceError
from app.providers.base import AIProvider
from app.schemas.chat import AIResponse

import logging

logger = logging.getLogger(__name__)


class FallbackProvider(AIProvider):

    def __init__(self, providers: list[AIProvider]):
        self.providers = providers

    def generate_response(
        self,
        history: list[dict[str, Any]],
    ) -> AIResponse:

        failures: list[str] = []

        for provider in self.providers:
            try:
                logger.info(
                    "Trying provider: %s",
                    provider.__class__.__name__,
                )

                return provider.generate_response(history)

            except AIServiceError as e:
                logger.warning(
                    "Provider '%s' failed: %s",
                    provider.__class__.__name__,
                    str(e),
                )

                failures.append(f"{provider.__class__.__name__}: {e}")

        error_message = "All AI providers failed.\n" + "\n".join(failures)

        logger.error(error_message)

        raise AIServiceError(error_message)
