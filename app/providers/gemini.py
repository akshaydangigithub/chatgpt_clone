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
)
from app.providers.base import AIProvider
from app.schemas.chat import AIResponse
import logging
from typing import Any
from app.core.circuit_breaker import CircuitBreaker

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):

    def __init__(self, client: genai.Client, model: str, breaker: CircuitBreaker):
        self.client = client
        self.model = model
        self.breaker = breaker

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(
            multiplier=1,
            min=1,
            max=10,
        ),
        retry=retry_if_exception_type(AIServiceError),
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
                raise AIInvalidResponseError()

            self.breaker.record_success()

            logger.info("Gemini response received")

            return response.parsed

        except AIInvalidResponseError:
            self.breaker.record_failure()
            raise

        except Exception as e:
            self.breaker.record_failure()
            logger.exception("Gemini request failed")
            raise AIServiceError() from e
