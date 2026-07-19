from abc import ABC, abstractmethod

from app.schemas.chat import AIResponse


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
