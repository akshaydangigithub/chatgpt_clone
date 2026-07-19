from uuid import UUID

from fastapi import Depends
from google import genai
from google.genai import types
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.circuit_breaker import CircuitBreaker
from app.core.config import settings
from app.core.database import get_db
from app.core.security import oauth2_scheme, verify_access_token
from app.exceptions.auth import InvalidTokenError
from app.models.user import User
from app.providers.base import AIProvider
from app.providers.fallback_provider import FallbackProvider
from app.providers.gemini_provider import GeminiProvider
from app.services.chat_service import ChatService
from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService
from app.services.user_service import UserService


def get_message_service():
    return MessageService()


def get_conversation_service():
    return ConversationService()


def get_user_service():
    return UserService()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
) -> User:
    """
    Resolve the authenticated user from the Bearer token.

    Decodes the JWT, loads the user, and raises InvalidTokenError (→ 401) if
    the token is invalid/expired or the user no longer exists.
    """

    try:
        user_id = verify_access_token(token)
        user_uuid = UUID(user_id)
    except (JWTError, ValueError):
        raise InvalidTokenError()

    user = user_service.get_by_id(db, user_uuid)

    if user is None:
        raise InvalidTokenError()

    return user


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
