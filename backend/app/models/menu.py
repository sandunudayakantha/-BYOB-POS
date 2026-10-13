from __future__ import annotations
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import GeneralStatus
from app.models.mixins import IntegerPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.branch import Branch
    from app.models.product import Product
    from app.models.qr import QRCode
    from app.models.restaurant import Restaurant

class Menu(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "menus"

    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default="", nullable=True)
    status: Mapped[str] = mapped_column(String(50), default=GeneralStatus.ACTIVE.value, nullable=False)
    is_base_menu: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    restaurant: Mapped[Restaurant] = relationship(back_populates="menus")
    branch: Mapped[Branch] = relationship(back_populates="menus")
    items: Mapped[list[MenuItem]] = relationship(back_populates="menu", cascade="all, delete-orphan")
    qr_codes: Mapped[list[QRCode]] = relationship(back_populates="menu", cascade="all, delete-orphan")

class MenuItem(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "menu_items"
    __table_args__ = (
        UniqueConstraint("menu_id", "product_id", name="uq_menu_product"),
    )

    menu_id: Mapped[int] = mapped_column(ForeignKey("menus.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    menu: Mapped[Menu] = relationship(back_populates="items")
    product: Mapped[Product] = relationship(back_populates="menu_items")
