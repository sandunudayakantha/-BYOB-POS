from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import IntegerPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.branch import Branch
    from app.models.category import Category
    from app.models.featured import FeaturedSectionProduct
    from app.models.inventory import ProductRecipeItem
    from app.models.menu import MenuItem
    from app.models.restaurant import Restaurant

class Product(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "products"

    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default="", nullable=True)
    image: Mapped[str | None] = mapped_column(String(500), default="", nullable=True)
    prep_time: Mapped[str | None] = mapped_column(String(50), default="15-20 mins", nullable=True)
    available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    featured_image: Mapped[str | None] = mapped_column(String(500), default="", nullable=True)

    restaurant: Mapped[Restaurant] = relationship(back_populates="products")
    branch: Mapped[Branch] = relationship(back_populates="products")
    category: Mapped[Category] = relationship(back_populates="products")
    menu_items: Mapped[list[MenuItem]] = relationship(back_populates="product", cascade="all, delete-orphan")
    featured_associations: Mapped[list[FeaturedSectionProduct]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )
    recipe_items: Mapped[list[ProductRecipeItem]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )

