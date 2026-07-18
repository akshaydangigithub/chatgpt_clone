from fastapi import APIRouter, status
from app.schemas.chat import ChatRequest, AIResponse
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])

chat_service = ChatService()


@router.post("/", response_model=AIResponse, status_code=status.HTTP_200_OK)
def chat(request: ChatRequest):
    response = chat_service.generate_response(request)

    return response
