from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.exceptions.conversation import ConversationNotFoundError


class ConversationService:
    def create_conversation(self, db: Session) -> Conversation:
        conversation = Conversation()

        db.add(conversation)

        return conversation

    def get_conversation_by_id(self, db: Session, conversation_id) -> Conversation:
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def list_conversations(self, db: Session) -> list[Conversation]:
        return db.query(Conversation).order_by(Conversation.created_at.desc()).all()

    def rename_conversation(
        self, db: Session, conversation_id, title: str
    ) -> Conversation:
        conversation = self.get_conversation_by_id(db, conversation_id)

        if not conversation:
            raise ConversationNotFoundError(conversation_id)

        conversation.title = title

        return conversation

    def delete_conversation(self, db: Session, conversation_id) -> None:
        conversation = self.get_conversation_by_id(db, conversation_id)

        if not conversation:
            raise ConversationNotFoundError(conversation_id)

        db.delete(conversation)
        db.commit()

    def generate_title(
        self,
        conversation: Conversation,
        first_message: str,
    ) -> None:
        if conversation.title:
            return

        title = first_message.strip()

        conversation.title = title[:60]
