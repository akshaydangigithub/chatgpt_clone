from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_chat_service
from app.schemas.chat import AIResponse, ChatRequest
from app.services.chat_service import ChatService

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post(
    "/",
    response_model=AIResponse,
    status_code=status.HTTP_200_OK,
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    return chat_service.generate_response(
        db=db,
        request=request,
    )


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    return StreamingResponse(
        chat_service.stream_response(
            db=db,
            request=request,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
