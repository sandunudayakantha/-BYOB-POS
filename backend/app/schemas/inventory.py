from datetime import date, datetime
from decimal import Decimal
from typing import Optional, Union
from pydantic import BaseModel, Field

# ----------------- UOM Schemas -----------------
class UnitOfMeasureCreate(BaseModel):
    name: str = Field(..., max_length=100)
    symbol: str = Field(..., max_length=20)
    uom_type: str = Field("WEIGHT", description="WEIGHT, VOLUME, or PIECE_COUNT")
    base_unit_id: Optional[int] = None
    conversion_factor: Decimal = Decimal("1.0000")

class UnitOfMeasureResponse(BaseModel):
    id: int
    name: str
    symbol: str
    uom_type: str
    base_unit_id: Optional[int] = None
    conversion_factor: Decimal

    class Config:
        from_attributes = True


# ----------------- Supplier Schemas -----------------
class SupplierCreate(BaseModel):
    name: str = Field(..., max_length=200)
    contact_person: Optional[str] = ""
    phone: str = Field(..., max_length=50)
    email: Optional[str] = ""
    address: Optional[str] = ""
    is_active: bool = True

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class SupplierResponse(BaseModel):
    id: int
    restaurant_id: int
    branch_id: int
    name: str
    contact_person: Optional[str] = ""
    phone: str
    email: Optional[str] = ""
    address: Optional[str] = ""
    is_active: bool

    class Config:
        from_attributes = True


# ----------------- Inventory Item Schemas -----------------
class InventoryItemCreate(BaseModel):
    name: str = Field(..., max_length=200)
    sku: Optional[str] = ""
    supplier_id: Optional[int] = None
    uom_id: int
    item_type: str = Field("RAW_MATERIAL", description="RAW_MATERIAL or PREPARED_ITEM")
    current_stock: Decimal = Decimal("0.000")
    reorder_threshold: Decimal = Decimal("0.000")
    unit_cost: Decimal = Decimal("0.00")
    is_active: bool = True

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    supplier_id: Optional[int] = None
    uom_id: Optional[int] = None
    item_type: Optional[str] = None
    current_stock: Optional[Decimal] = None
    reorder_threshold: Optional[Decimal] = None
    unit_cost: Optional[Decimal] = None
    is_active: Optional[bool] = None

class InventoryItemResponse(BaseModel):
    id: int
    restaurant_id: int
    branch_id: int
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    uom_id: int
    uom_symbol: Optional[str] = None
    uom_name: Optional[str] = None
    name: str
    sku: Optional[str] = ""
    item_type: str
    current_stock: Decimal
    reorder_threshold: Decimal
    unit_cost: Decimal
    is_active: bool

    class Config:
        from_attributes = True


# ----------------- Kitchen Prep Definition Schemas -----------------
class KitchenPrepDefinitionCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = ""
    base_raw_item_id: int
    output_item_id: Optional[int] = None
    uom_id: Optional[int] = None
    expected_yield_percent: Decimal = Decimal("100.00")
    portion_size_value: Optional[Decimal] = None
    portion_size_uom_id: Optional[int] = None
    requires_image_evidence: bool = False
    track_wastage: bool = False
    requires_wastage_image: bool = False

class KitchenPrepDefinitionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_raw_item_id: Optional[int] = None
    output_item_id: Optional[int] = None
    uom_id: Optional[int] = None
    expected_yield_percent: Optional[Decimal] = None
    portion_size_value: Optional[Decimal] = None
    portion_size_uom_id: Optional[int] = None
    requires_image_evidence: Optional[bool] = None
    track_wastage: Optional[bool] = None
    requires_wastage_image: Optional[bool] = None

class KitchenPrepDefinitionResponse(BaseModel):
    id: int
    restaurant_id: int
    branch_id: int
    name: str
    description: Optional[str] = ""
    base_raw_item_id: int
    base_raw_item_name: Optional[str] = None
    base_raw_item_uom_symbol: Optional[str] = None
    output_item_id: Optional[int] = None
    output_item_name: Optional[str] = None
    uom_id: Optional[int] = None
    uom_symbol: Optional[str] = None
    portion_size_value: Optional[Decimal] = None
    portion_size_uom_id: Optional[int] = None
    portion_size_uom_symbol: Optional[str] = None
    current_stock: Decimal = Decimal("0.000")
    unit_cost: Decimal = Decimal("0.00")
    expected_yield_percent: Decimal
    requires_image_evidence: bool
    track_wastage: bool
    requires_wastage_image: bool

    class Config:
        from_attributes = True


# ----------------- Kitchen Prep Batch Execution -----------------
class KitchenPrepBatchCreate(BaseModel):
    prep_definition_id: int
    raw_input_quantity: Decimal
    actual_yield_quantity: Decimal
    wastage_quantity: Optional[Decimal] = Decimal("0.000")
    wastage_reason: Optional[str] = ""
    prep_image_url: Optional[str] = ""
    wastage_image_url: Optional[str] = ""

class KitchenPrepBatchResponse(BaseModel):
    id: int
    prep_definition_id: int
    prep_definition_name: Optional[str] = None
    base_raw_item_id: Optional[int] = None
    base_raw_item_name: Optional[str] = None
    base_raw_item_uom_symbol: Optional[str] = None
    output_uom_symbol: Optional[str] = None
    branch_id: int
    prepared_by_user_id: int
    prepared_by_name: Optional[str] = None
    raw_input_quantity: Decimal
    actual_yield_quantity: Decimal
    wastage_quantity: Decimal
    wastage_reason: Optional[str] = ""
    prep_image_url: Optional[str] = ""
    wastage_image_url: Optional[str] = ""
    calculated_unit_cost: Decimal
    status: str
    created_at: Union[datetime, str]

    class Config:
        from_attributes = True


# ----------------- Product Recipe Item Schemas -----------------
class ProductRecipeItemCreate(BaseModel):
    inventory_item_id: int
    uom_id: int
    quantity: Decimal
    wastage_factor_percent: Optional[Decimal] = Decimal("0.00")

class ProductRecipeItemResponse(BaseModel):
    id: int
    product_id: int
    inventory_item_id: int
    inventory_item_name: Optional[str] = None
    inventory_item_type: Optional[str] = None
    uom_id: int
    uom_symbol: Optional[str] = None
    quantity: Decimal
    wastage_factor_percent: Decimal
    unit_cost_at_time: Decimal
    calculated_ingredient_cost: Decimal

    class Config:
        from_attributes = True

class ProductRecipeSaveRequest(BaseModel):
    ingredients: list[ProductRecipeItemCreate]


# ----------------- Raw Inventory Batch Schemas -----------------
class RawInventoryBatchCreate(BaseModel):
    quantity: Decimal = Field(..., gt=0, description="Quantity received/inwarded")
    unit_cost: Decimal = Field(..., ge=0, description="Purchase cost per unit")
    received_date: Optional[str] = Field(None, description="YYYY-MM-DD, defaults to today")
    expiry_date: Optional[str] = Field(None, description="YYYY-MM-DD of batch expiry")
    supplier_id: Optional[int] = None
    batch_number: Optional[str] = ""
    notes: Optional[str] = ""

class RawInventoryBatchResponse(BaseModel):
    id: int
    inventory_item_id: int
    branch_id: int
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    batch_number: str
    quantity_received: Decimal
    quantity_remaining: Decimal
    unit_cost: Decimal
    received_date: Union[date, str]
    expiry_date: Optional[Union[date, str]] = None
    status: str
    notes: Optional[str] = ""
    created_at: Union[datetime, str]

    class Config:
        from_attributes = True
