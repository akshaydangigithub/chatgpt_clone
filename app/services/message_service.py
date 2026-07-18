from uuid import UUID

from sqlalchemy.orm import Session

from app.models.message import Message


class MessageService:
    def save_message(
        self,
        db: Session,
        conversation_id: UUID,
        role: str,
        content: str,
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    def get_conversation_messages(
        self,
        db: Session,
        conversation_id: UUID,
    ) -> list[Message]:
        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .all()
        )

        return messages
