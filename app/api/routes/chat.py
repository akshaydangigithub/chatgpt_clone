from fastapi import APIRouter, status, Depends
from app.schemas.chat import ChatRequest, AIResponse
from sqlalchemy.orm import Session
from app.services.chat_service import ChatService
import logging

from app.dependencies import get_chat_service
from app.core.database import get_db

router = APIRouter(prefix="/chat", tags=["Chat"])

logger = logging.getLogger(__name__)


@router.post("/", response_model=AIResponse, status_code=status.HTTP_200_OK)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):

    response = chat_service.generate_response(db, request)

    db.commit()

    return response
