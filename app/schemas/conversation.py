from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ConversationResponse(BaseModel):
    id: UUID
    title: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
