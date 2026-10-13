from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import IntegerPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.branch import Branch
    from app.models.menu import Menu
    from app.models.restaurant import Restaurant

class QRCode(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "qr_codes"

    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)
    menu_id: Mapped[int] = mapped_column(ForeignKey("menus.id", ondelete="CASCADE"), nullable=False, index=True)

    token: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    table_name: Mapped[str | None] = mapped_column(String(100), default="", nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    restaurant: Mapped[Restaurant] = relationship(back_populates="qr_codes")
    branch: Mapped[Branch] = relationship(back_populates="qr_codes")
    menu: Mapped[Menu] = relationship(back_populates="qr_codes")
