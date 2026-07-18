from sqlalchemy.orm import Session

from app.models.conversation import Conversation


class ConversationService:
    def create_conversation(self, db: Session) -> Conversation:
        conversation = Conversation()

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    def get_conversation_by_id(self, db: Session, conversation_id) -> Conversation:
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()
