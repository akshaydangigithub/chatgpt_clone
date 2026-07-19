from uuid import UUID

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.conversation import (
    ConversationResponse,
    RenameConversationRequest,
)
from app.services.conversation_service import ConversationService

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)

conversation_service = ConversationService()


@router.post(
    "/",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation(db: Session = Depends(get_db)):
    conversation = conversation_service.create_conversation(db)

    db.commit()
    db.refresh(conversation)

    return conversation


@router.get(
    "/",
    response_model=list[ConversationResponse],
    status_code=status.HTTP_200_OK,
)
def list_conversations(db: Session = Depends(get_db)):
    return conversation_service.list_conversations(db)


@router.patch(
    "/{conversation_id}",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK,
)
def rename_conversation(
    conversation_id: UUID,
    request: RenameConversationRequest,
    db: Session = Depends(get_db),
):
    conversation = conversation_service.rename_conversation(
        db=db,
        conversation_id=conversation_id,
        title=request.title,
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
):
    conversation_service.delete_conversation(
        db=db,
        conversation_id=conversation_id,
    )

    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
