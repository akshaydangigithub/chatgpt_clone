"""add users and conversation ownership

Revision ID: a1b2c3d4e5f6
Revises: d2c10827e8ef
Create Date: 2026-07-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "d2c10827e8ef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # Existing conversations pre-date auth and have no owner. There is no
    # sensible user to assign them to, so drop them before enforcing NOT NULL.
    # (This only affects pre-auth test data.)
    op.execute("DELETE FROM conversations")

    op.add_column(
        "conversations",
        sa.Column("user_id", sa.Uuid(), nullable=False),
    )
    op.create_foreign_key(
        op.f("fk_conversations_user_id_users"),
        "conversations",
        "users",
        ["user_id"],
        ["id"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        op.f("fk_conversations_user_id_users"),
        "conversations",
        type_="foreignkey",
    )
    op.drop_column("conversations", "user_id")

    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
