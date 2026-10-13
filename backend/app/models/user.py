from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import UserRole, UserStatus
from app.models.mixins import IntegerPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.rbac import Role
    from app.models.restaurant import Restaurant

class User(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default=UserRole.RESTAURANT_OWNER.value, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=UserStatus.ACTIVE.value, nullable=False)

    role_id: Mapped[int | None] = mapped_column(ForeignKey("roles.id"), nullable=True)
    restaurant_id: Mapped[int | None] = mapped_column(
        ForeignKey("restaurants.id", use_alter=True, name="fk_user_restaurant"),
        nullable=True
    )

    login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lock_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    role_rel: Mapped[Role | None] = relationship(back_populates="users")
    restaurant: Mapped[Restaurant | None] = relationship(
        "Restaurant",
        foreign_keys=[restaurant_id],
        back_populates="staff_members"
    )
    owned_restaurants: Mapped[list[Restaurant]] = relationship(
        "Restaurant",
        foreign_keys="Restaurant.owner_id",
        back_populates="owner"
    )
    refresh_tokens: Mapped[list[RefreshToken]] = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan"
    )

class RefreshToken(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "refresh_tokens"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token: Mapped[str] = mapped_column(String(500), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped[User] = relationship(back_populates="refresh_tokens")
