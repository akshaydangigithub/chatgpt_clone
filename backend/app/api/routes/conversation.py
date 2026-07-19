from uuid import UUID

from fastapi import APIRouter, Depends, Response, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.conversation import (
    ConversationResponse,
    RenameConversationRequest,
    ConversationListResponse,
)
from app.schemas.message import MessageListResponse
from app.services.conversation_service import ConversationService
from app.services.message_service import MessageService
from app.exceptions.conversation import ConversationNotFoundError

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)

conversation_service = ConversationService()
message_service = MessageService()


@router.post(
    "/",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = conversation_service.create_conversation(db, current_user.id)

    db.commit()
    db.refresh(conversation)

    return conversation


@router.get(
    "/",
    response_model=ConversationListResponse,
    status_code=status.HTTP_200_OK,
)
def list_conversations(
    page: int = Query(
        default=1,
        ge=1,
        description="Page number",
    ),
    page_size: int = Query(
        default=10,
        ge=1,
        le=100,
        description="Number of conversations per page",
    ),
    search_query: str | None = Query(default=None, description="Search with the title"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return conversation_service.list_conversations(
        page, page_size, search_query, db, current_user.id
    )


@router.get(
    "/{conversation_id}/messages",
    response_model=MessageListResponse,
    status_code=status.HTTP_200_OK,
)
def list_conversation_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Enforce ownership before returning any messages: a conversation owned by
    # another user (or a non-existent one) is simply "not found".
    conversation = conversation_service.get_conversation_by_id(
        db, conversation_id, current_user.id
    )

    if conversation is None:
        raise ConversationNotFoundError(conversation_id)

    messages = message_service.get_conversation_messages(
        db=db,
        conversation_id=conversation_id,
    )

    return MessageListResponse(messages=messages)


@router.patch(
    "/{conversation_id}",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK,
)
def rename_conversation(
    conversation_id: UUID,
    request: RenameConversationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = conversation_service.rename_conversation(
        db=db,
        conversation_id=conversation_id,
        title=request.title,
        user_id=current_user.id,
    )

    db.commit()
    db.refresh(conversation)

    return conversation


@router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation_service.delete_conversation(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id,
    )

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
