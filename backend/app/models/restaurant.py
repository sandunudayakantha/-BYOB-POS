from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import GeneralStatus
from app.models.mixins import IntegerPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.branch import Branch
    from app.models.category import Category
    from app.models.featured import FeaturedSection
    from app.models.menu import Menu
    from app.models.product import Product
    from app.models.qr import QRCode
    from app.models.user import User

class Restaurant(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "restaurants"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    logo: Mapped[str | None] = mapped_column(String(500), default="", nullable=True)
    cover_image: Mapped[str | None] = mapped_column(String(500), default="", nullable=True)
    status: Mapped[str] = mapped_column(String(50), default=GeneralStatus.ACTIVE.value, nullable=False)
    max_branches: Mapped[int] = mapped_column(Integer, default=3, nullable=False)

    owner: Mapped[User] = relationship(
        "User",
        foreign_keys=[owner_id],
        back_populates="owned_restaurants"
    )
    staff_members: Mapped[list[User]] = relationship(
        "User",
        foreign_keys="User.restaurant_id",
        back_populates="restaurant"
    )
    branches: Mapped[list[Branch]] = relationship(
        "Branch", back_populates="restaurant", cascade="all, delete-orphan"
    )
    categories: Mapped[list[Category]] = relationship(
        "Category", back_populates="restaurant", cascade="all, delete-orphan"
    )
    products: Mapped[list[Product]] = relationship(
        "Product", back_populates="restaurant", cascade="all, delete-orphan"
    )
    menus: Mapped[list[Menu]] = relationship(
        "Menu", back_populates="restaurant", cascade="all, delete-orphan"
    )
    qr_codes: Mapped[list[QRCode]] = relationship(
        "QRCode", back_populates="restaurant", cascade="all, delete-orphan"
    )
    featured_sections: Mapped[list[FeaturedSection]] = relationship(
        "FeaturedSection", back_populates="restaurant", cascade="all, delete-orphan"
    )
