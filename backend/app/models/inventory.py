from __future__ import annotations
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import BatchStatus, InventoryItemType, InventoryTransactionType, PrepBatchStatus, UOMType
from app.models.mixins import IntegerPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.branch import Branch
    from app.models.product import Product
    from app.models.restaurant import Restaurant
    from app.models.user import User

class Supplier(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "suppliers"

    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(150), default="", nullable=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str | None] = mapped_column(String(150), default="", nullable=True)
    address: Mapped[str | None] = mapped_column(String(300), default="", nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    restaurant: Mapped[Restaurant] = relationship()
    branch: Mapped[Branch] = relationship()
    inventory_items: Mapped[list[InventoryItem]] = relationship(back_populates="supplier")


class UnitOfMeasure(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "units_of_measure"

    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    uom_type: Mapped[str] = mapped_column(String(50), default=UOMType.WEIGHT.value, nullable=False)
    base_unit_id: Mapped[int | None] = mapped_column(ForeignKey("units_of_measure.id", ondelete="SET NULL"), nullable=True)
    conversion_factor: Mapped[Decimal] = mapped_column(Numeric(12, 4), default=Decimal("1.0000"), nullable=False)

    restaurant: Mapped[Restaurant] = relationship()
    base_unit: Mapped[UnitOfMeasure | None] = relationship(remote_side="UnitOfMeasure.id")


class InventoryItem(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "inventory_items"

    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    uom_id: Mapped[int] = mapped_column(ForeignKey("units_of_measure.id", ondelete="RESTRICT"), nullable=False)

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str | None] = mapped_column(String(100), default="", nullable=True)
    item_type: Mapped[str] = mapped_column(String(50), default=InventoryItemType.RAW_MATERIAL.value, nullable=False)
    current_stock: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=Decimal("0.000"), nullable=False)
    reorder_threshold: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=Decimal("0.000"), nullable=False)
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    restaurant: Mapped[Restaurant] = relationship()
    branch: Mapped[Branch] = relationship()
    supplier: Mapped[Supplier | None] = relationship(back_populates="inventory_items")
    uom: Mapped[UnitOfMeasure] = relationship()
    batches: Mapped[list[RawInventoryBatch]] = relationship(back_populates="inventory_item", cascade="all, delete-orphan")


class KitchenPrepDefinition(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "kitchen_prep_definitions"

    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, default="", nullable=True)
    base_raw_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_items.id", ondelete="RESTRICT"), nullable=False, index=True)
    output_item_id: Mapped[int | None] = mapped_column(ForeignKey("inventory_items.id", ondelete="SET NULL"), nullable=True)
    uom_id: Mapped[int | None] = mapped_column(ForeignKey("units_of_measure.id", ondelete="RESTRICT"), nullable=True)

    current_stock: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=Decimal("0.000"), nullable=False)
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    expected_yield_percent: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("100.00"), nullable=False)
    portion_size_value: Mapped[Decimal | None] = mapped_column(Numeric(12, 3), nullable=True)
    portion_size_uom_id: Mapped[int | None] = mapped_column(ForeignKey("units_of_measure.id", ondelete="SET NULL"), nullable=True)
    requires_image_evidence: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    track_wastage: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    requires_wastage_image: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    restaurant: Mapped[Restaurant] = relationship()
    branch: Mapped[Branch] = relationship()
    base_raw_item: Mapped[InventoryItem] = relationship(foreign_keys=[base_raw_item_id])
    output_item: Mapped[InventoryItem | None] = relationship(foreign_keys=[output_item_id])
    uom: Mapped[UnitOfMeasure | None] = relationship(foreign_keys=[uom_id])
    portion_size_uom: Mapped[UnitOfMeasure | None] = relationship(foreign_keys=[portion_size_uom_id])
    batches: Mapped[list[KitchenPrepBatch]] = relationship(back_populates="prep_definition", cascade="all, delete-orphan")

    @property
    def portion_size_uom_symbol(self) -> str | None:
        return self.portion_size_uom.symbol if self.portion_size_uom else None

    @property
    def base_raw_item_name(self) -> str | None:
        return self.base_raw_item.name if self.base_raw_item else None

    @property
    def base_raw_item_uom_symbol(self) -> str | None:
        return self.base_raw_item.uom.symbol if (self.base_raw_item and self.base_raw_item.uom) else None

    @property
    def uom_symbol(self) -> str | None:
        return self.uom.symbol if self.uom else (self.base_raw_item.uom.symbol if (self.base_raw_item and self.base_raw_item.uom) else None)



class KitchenPrepBatch(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "kitchen_prep_batches"

    prep_definition_id: Mapped[int] = mapped_column(ForeignKey("kitchen_prep_definitions.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)
    prepared_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    raw_input_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    actual_yield_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    wastage_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=Decimal("0.000"), nullable=False)
    wastage_reason: Mapped[str | None] = mapped_column(String(300), default="", nullable=True)

    prep_image_url: Mapped[str | None] = mapped_column(String(500), default="", nullable=True)
    wastage_image_url: Mapped[str | None] = mapped_column(String(500), default="", nullable=True)
    calculated_unit_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=PrepBatchStatus.COMPLETED.value, nullable=False)

    prep_definition: Mapped[KitchenPrepDefinition] = relationship(back_populates="batches")
    branch: Mapped[Branch] = relationship()
    prepared_by: Mapped[User] = relationship()


class ProductRecipeItem(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "product_recipe_items"

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    inventory_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_items.id", ondelete="RESTRICT"), nullable=False, index=True)
    uom_id: Mapped[int] = mapped_column(ForeignKey("units_of_measure.id", ondelete="RESTRICT"), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    wastage_factor_percent: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("0.00"), nullable=False)

    product: Mapped[Product] = relationship(back_populates="recipe_items")
    inventory_item: Mapped[InventoryItem] = relationship()
    uom: Mapped[UnitOfMeasure] = relationship()


class InventoryTransaction(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "inventory_transactions"

    inventory_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_items.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_type: Mapped[str] = mapped_column(String(50), nullable=False)
    quantity_delta: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    unit_cost_at_time: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    reference_id: Mapped[str | None] = mapped_column(String(100), default="", nullable=True)
    notes: Mapped[str | None] = mapped_column(String(300), default="", nullable=True)

    inventory_item: Mapped[InventoryItem] = relationship()
    branch: Mapped[Branch] = relationship()


class RawInventoryBatch(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "raw_inventory_batches"

    inventory_item_id: Mapped[int] = mapped_column(ForeignKey("inventory_items.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)

    batch_number: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    quantity_received: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    quantity_remaining: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    received_date: Mapped[date] = mapped_column(Date, nullable=False)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default=BatchStatus.ACTIVE.value, nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(String(300), default="", nullable=True)

    inventory_item: Mapped[InventoryItem] = relationship(back_populates="batches")
    branch: Mapped[Branch] = relationship()
    supplier: Mapped[Supplier | None] = relationship()
