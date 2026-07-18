from fastapi import Depends

from app.services.chat_service import ChatService
from app.services.message_service import MessageService
from app.services.conversation_service import ConversationService


def get_message_service():
    return MessageService()


def get_conversation_service():
    return ConversationService()


def get_chat_service(
    message_service: MessageService = Depends(get_message_service),
    conversation_service: ConversationService = Depends(get_conversation_service),
):
    return ChatService(
        message_service=message_service,
        conversation_service=conversation_service,
    )
