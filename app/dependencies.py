from fastapi import Depends
from google import genai
from app.services.chat_service import ChatService
from app.services.message_service import MessageService
from app.services.conversation_service import ConversationService
from app.core.config import settings
from app.providers.gemini import GeminiProvider
from app.providers.base import AIProvider
from google.genai import types


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


def get_ai_provider(
    client: genai.Client = Depends(get_genai_client),
) -> AIProvider:
    return GeminiProvider(
        client=client,
        model=settings.GEMINI_MODEL,
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
