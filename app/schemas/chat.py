from pydantic import BaseModel


class ChatRequest(BaseModel):
    conversation_id: str
    message: str


class ChatResponse(BaseModel):
    response: str


class AIResponse(BaseModel):
    answer: str
    category: str
    confidence: float
