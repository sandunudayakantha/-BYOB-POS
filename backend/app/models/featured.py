from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import IntegerPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.branch import Branch
    from app.models.product import Product
    from app.models.restaurant import Restaurant

class FeaturedSection(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "featured_sections"

    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default="", nullable=True)
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    restaurant: Mapped[Restaurant] = relationship(back_populates="featured_sections")
    branch: Mapped[Branch] = relationship(back_populates="featured_sections")
    section_products: Mapped[list[FeaturedSectionProduct]] = relationship(
        back_populates="featured_section", cascade="all, delete-orphan"
    )

    @property
    def products(self) -> list[Product]:
        seen = set()
        unique_prods = []
        for sp in self.section_products:
            if sp.product and not sp.is_deleted and not sp.product.is_deleted and sp.product.id not in seen:
                seen.add(sp.product.id)
                unique_prods.append(sp.product)
        return unique_prods



class FeaturedSectionProduct(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "featured_section_products"

    featured_section_id: Mapped[int] = mapped_column(
        ForeignKey("featured_sections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )

    featured_section: Mapped[FeaturedSection] = relationship(back_populates="section_products")
    product: Mapped[Product] = relationship(back_populates="featured_associations")
