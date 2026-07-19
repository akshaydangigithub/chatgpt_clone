from abc import ABC, abstractmethod

from app.schemas.chat import AIResponse
from collections.abc import Iterator


class AIProvider(ABC):
    @abstractmethod
    def generate_response(
        self,
        history: list,
    ) -> AIResponse:
        """
        Generate an AI response from the conversation history.
        """
        raise NotImplementedError

    @abstractmethod
    def stream_response(self, history: list) -> Iterator[str]:
        """
        Generate an AI stream Response from the conversation history.
        """

        raise NotImplementedError
