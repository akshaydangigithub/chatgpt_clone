from fastapi import Depends
from google import genai
from app.services.chat_service import ChatService
from app.services.message_service import MessageService
from app.services.conversation_service import ConversationService
from app.core.config import settings


def get_message_service():
    return MessageService()


def get_conversation_service():
    return ConversationService()


client = genai.Client(api_key=settings.GEMINI_API_KEY)


def get_genai_client():
    return client


def get_chat_service(
    client: genai.Client = Depends(get_genai_client),
    message_service: MessageService = Depends(get_message_service),
    conversation_service: ConversationService = Depends(get_conversation_service),
):
    return ChatService(
        client=client,
        model=settings.GEMINI_MODEL,
        message_service=message_service,
        conversation_service=conversation_service,
    )
