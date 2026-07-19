from abc import ABC, abstractmethod

from app.schemas.chat import AIResponse
from collections.abc import AsyncIterator


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
    def stream_response(self, history: list) -> AsyncIterator[str]:
        """
        Asynchronously stream an AI response from the conversation history.

        Implementations must be async generators yielding plain text chunks.
        """

        raise NotImplementedError

    @abstractmethod
    async def generate_title(
        self,
        user_message: str,
        assistant_message: str,
    ) -> str:
        """
        Generate a concise title for a conversation.
        """

        pass
