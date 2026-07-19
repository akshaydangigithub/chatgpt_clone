from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import hashed_password, verify_password
from app.exceptions.auth import InvalidCredentialsError, UserAlreadyExistsError
from app.models.user import User


class UserService:
    def get_by_id(self, db: Session, user_id: UUID) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    def get_by_username(self, db: Session, username: str) -> User | None:
        return db.query(User).filter(User.username == username).first()

    def register(
        self,
        db: Session,
        username: str,
        email: str,
        password: str,
    ) -> User:
        existing = (
            db.query(User)
            .filter(or_(User.username == username, User.email == email))
            .first()
        )

        if existing is not None:
            raise UserAlreadyExistsError()

        user = User(
            username=username,
            email=email,
            password_hash=hashed_password(password),
        )

        db.add(user)
        db.flush()

        return user

    def authenticate(self, db: Session, username: str, password: str) -> User:
        user = self.get_by_username(db, username)

        # Verify even when the user is missing? We short-circuit here for
        # simplicity; the same generic error is returned either way so we
        # don't leak which usernames exist.
        if user is None or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()

        return user
