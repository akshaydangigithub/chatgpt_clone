from uuid import UUID
from sqlalchemy.orm import Session
from math import ceil
from sqlalchemy import func

from app.models.conversation import Conversation
from app.schemas.conversation import ConversationListResponse
from app.exceptions.conversation import ConversationNotFoundError


class ConversationService:
    def create_conversation(self, db: Session, user_id: UUID) -> Conversation:
        conversation = Conversation(user_id=user_id)

        db.add(conversation)

        return conversation

    def get_conversation_by_id(
        self,
        db: Session,
        conversation_id,
        user_id: UUID,
    ) -> Conversation:
        # Ownership is enforced in the query itself: a conversation owned by
        # another user is simply "not found" for this user.
        return (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
            .first()
        )

    def list_conversations(
        self,
        page: int,
        page_size: int,
        search_query: str,
        db: Session,
        user_id: UUID,
    ) -> ConversationListResponse:
        offset = (page - 1) * page_size

        query = db.query(Conversation).filter(Conversation.user_id == user_id)

        if search_query:
            query = query.filter(Conversation.title.ilike(f"%{search_query}%"))

        conversations = (
            query.order_by(Conversation.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        total = (
            db.query(func.count(Conversation.id))
            .filter(Conversation.user_id == user_id)
            .scalar()
            or 0
        )

        total_pages = ceil(total / page_size) if total > 0 else 0

        return ConversationListResponse(
            conversations=conversations,
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )

    def rename_conversation(
        self,
        db: Session,
        conversation_id,
        title: str,
        user_id: UUID,
    ) -> Conversation:
        conversation = self.get_conversation_by_id(db, conversation_id, user_id)

        if not conversation:
            raise ConversationNotFoundError(conversation_id)

        conversation.title = title

        return conversation

    def delete_conversation(
        self,
        db: Session,
        conversation_id,
        user_id: UUID,
    ) -> None:
        conversation = self.get_conversation_by_id(db, conversation_id, user_id)

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
