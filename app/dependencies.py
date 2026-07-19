from fastapi import Depends
from google import genai
from google.genai import types

from app.core.circuit_breaker import CircuitBreaker
from app.core.config import settings
from app.providers.base import AIProvider
from app.providers.fallback import FallbackProvider
from app.providers.gemini import GeminiProvider
from app.services.chat_service import ChatService
from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService


def get_message_service():
    return MessageService()


def get_conversation_service():
    return ConversationService()


client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
    http_options=types.HttpOptions(
        timeout=settings.GEMINI_TIMEOUT,
    ),
)


def get_genai_client():
    return client


breaker = CircuitBreaker()


def get_circuit_breaker():
    return breaker


def get_gemini_provider(
    client: genai.Client = Depends(get_genai_client),
    breaker: CircuitBreaker = Depends(get_circuit_breaker),
) -> GeminiProvider:
    return GeminiProvider(
        client=client,
        model=settings.GEMINI_MODEL,
        breaker=breaker,
    )


def get_ai_provider(
    gemini_provider: GeminiProvider = Depends(get_gemini_provider),
) -> AIProvider:
    return FallbackProvider(
        providers=[
            gemini_provider,
        ]
    )


def get_chat_service(
    provider: AIProvider = Depends(get_ai_provider),
    message_service: MessageService = Depends(get_message_service),
    conversation_service: ConversationService = Depends(get_conversation_service),
):
    return ChatService(
        provider=provider,
        message_service=message_service,
        conversation_service=conversation_service,
    )
