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

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):

    def __init__(
        self,
        client: genai.Client,
        model: str,
    ):
        self.client = client
        self.model = model

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

            logger.info("Gemini response received")

            return response.parsed

        except AIInvalidResponseError:
            raise

        except Exception as e:
            logger.exception("Gemini request failed")
            raise AIServiceError() from e
