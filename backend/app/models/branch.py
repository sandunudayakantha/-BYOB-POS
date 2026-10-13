from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import GeneralStatus
from app.models.mixins import IntegerPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.featured import FeaturedSection
    from app.models.menu import Menu
    from app.models.product import Product
    from app.models.qr import QRCode
    from app.models.restaurant import Restaurant

class Branch(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "branches"

    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    logo: Mapped[str | None] = mapped_column(String(500), default="", nullable=True)
    cover_image: Mapped[str | None] = mapped_column(String(500), default="", nullable=True)
    is_main: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=GeneralStatus.ACTIVE.value, nullable=False)

    restaurant: Mapped[Restaurant] = relationship(back_populates="branches")
    categories: Mapped[list[Category]] = relationship(back_populates="branch", cascade="all, delete-orphan")
    products: Mapped[list[Product]] = relationship(back_populates="branch", cascade="all, delete-orphan")
    menus: Mapped[list[Menu]] = relationship(back_populates="branch", cascade="all, delete-orphan")
    qr_codes: Mapped[list[QRCode]] = relationship(back_populates="branch", cascade="all, delete-orphan")
    featured_sections: Mapped[list[FeaturedSection]] = relationship(back_populates="branch", cascade="all, delete-orphan")
