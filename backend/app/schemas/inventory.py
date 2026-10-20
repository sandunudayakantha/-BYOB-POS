from datetime import date, datetime
from decimal import Decimal
from typing import Optional, Union
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator
from app.utils.validators import validate_phone_number, validate_safe_url

# ----------------- UOM Schemas -----------------
class UnitOfMeasureCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=100)
    symbol: str = Field(..., min_length=1, max_length=20)
    uom_type: str = Field("WEIGHT", description="WEIGHT, VOLUME, or PIECE_COUNT")
    base_unit_id: Optional[int] = None
    conversion_factor: Decimal = Field(default=Decimal("1.0000"), gt=0)


class UnitOfMeasureResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    symbol: str
    uom_type: str
    base_unit_id: Optional[int] = None
    conversion_factor: Decimal


# ----------------- Supplier Schemas -----------------
class SupplierCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=200)
    contact_person: Optional[str] = Field(default="", max_length=150)
    phone: str = Field(..., min_length=7, max_length=25)
    email: Optional[EmailStr | str] = Field(default="", max_length=255)
    address: Optional[str] = Field(default="", max_length=500)
    is_active: bool = True

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        return validate_phone_number(v)

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str | None) -> str:
        if v and v.strip():
            # Basic email format check if non-empty
            if "@" not in v or "." not in v.split("@")[-1]:
                raise ValueError("Invalid email format")
            return v.strip().lower()
        return ""


class SupplierUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    contact_person: Optional[str] = Field(default=None, max_length=150)
    phone: Optional[str] = Field(default=None, min_length=7, max_length=25)
    email: Optional[EmailStr | str] = Field(default=None, max_length=255)
    address: Optional[str] = Field(default=None, max_length=500)
    is_active: Optional[bool] = None

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str | None) -> str | None:
        if v is not None and v.strip():
            return validate_phone_number(v)
        return v

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str | None) -> str | None:
        if v and v.strip():
            if "@" not in v or "." not in v.split("@")[-1]:
                raise ValueError("Invalid email format")
            return v.strip().lower()
        return v


class SupplierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    restaurant_id: int
    branch_id: int
    name: str
    contact_person: Optional[str] = ""
    phone: str
    email: Optional[str] = ""
    address: Optional[str] = ""
    is_active: bool


# ----------------- Inventory Item Schemas -----------------
class InventoryItemCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=200)
    sku: Optional[str] = Field(default="", max_length=100)
    supplier_id: Optional[int] = None
    uom_id: int = Field(..., gt=0)
    item_type: str = Field("RAW_MATERIAL", description="RAW_MATERIAL or PREPARED_ITEM")
    current_stock: Decimal = Field(default=Decimal("0.000"), ge=0)
    reorder_threshold: Decimal = Field(default=Decimal("0.000"), ge=0)
    unit_cost: Decimal = Field(default=Decimal("0.00"), ge=0)
    is_active: bool = True


class InventoryItemUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    sku: Optional[str] = Field(default=None, max_length=100)
    supplier_id: Optional[int] = None
    uom_id: Optional[int] = Field(default=None, gt=0)
    item_type: Optional[str] = None
    current_stock: Optional[Decimal] = Field(default=None, ge=0)
    reorder_threshold: Optional[Decimal] = Field(default=None, ge=0)
    unit_cost: Optional[Decimal] = Field(default=None, ge=0)
    is_active: Optional[bool] = None


class InventoryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


# ----------------- Kitchen Prep Definition Schemas -----------------
class KitchenPrepDefinitionCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(default="", max_length=2000)
    base_raw_item_id: int = Field(..., gt=0)
    output_item_id: Optional[int] = Field(default=None, gt=0)
    uom_id: Optional[int] = Field(default=None, gt=0)
    expected_yield_percent: Decimal = Field(default=Decimal("100.00"), ge=0, le=500)
    portion_size_value: Optional[Decimal] = Field(default=None, ge=0)
    portion_size_uom_id: Optional[int] = Field(default=None, gt=0)
    requires_image_evidence: bool = False
    track_wastage: bool = False
    requires_wastage_image: bool = False


class KitchenPrepDefinitionUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    base_raw_item_id: Optional[int] = Field(default=None, gt=0)
    output_item_id: Optional[int] = Field(default=None, gt=0)
    uom_id: Optional[int] = Field(default=None, gt=0)
    expected_yield_percent: Optional[Decimal] = Field(default=None, ge=0, le=500)
    portion_size_value: Optional[Decimal] = Field(default=None, ge=0)
    portion_size_uom_id: Optional[int] = Field(default=None, gt=0)
    requires_image_evidence: Optional[bool] = None
    track_wastage: Optional[bool] = None
    requires_wastage_image: Optional[bool] = None


class KitchenPrepDefinitionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


# ----------------- Kitchen Prep Batch Execution -----------------
class KitchenPrepBatchCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    prep_definition_id: int = Field(..., gt=0)
    raw_input_quantity: Decimal = Field(..., gt=0)
    actual_yield_quantity: Decimal = Field(..., ge=0)
    wastage_quantity: Optional[Decimal] = Field(default=Decimal("0.000"), ge=0)
    wastage_reason: Optional[str] = Field(default="", max_length=500)
    prep_image_url: Optional[str] = Field(default="", max_length=500)
    wastage_image_url: Optional[str] = Field(default="", max_length=500)

    @field_validator("prep_image_url", "wastage_image_url")
    @classmethod
    def check_safe_images(cls, v: str | None) -> str | None:
        return validate_safe_url(v)


class KitchenPrepBatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


# ----------------- Product Recipe Item Schemas -----------------
class ProductRecipeItemCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    inventory_item_id: int = Field(..., gt=0)
    uom_id: int = Field(..., gt=0)
    quantity: Decimal = Field(..., gt=0)
    wastage_factor_percent: Optional[Decimal] = Field(default=Decimal("0.00"), ge=0, le=100)


class ProductRecipeItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


class ProductRecipeSaveRequest(BaseModel):
    ingredients: list[ProductRecipeItemCreate]


# ----------------- Raw Inventory Batch Schemas -----------------
class RawInventoryBatchCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    quantity: Decimal = Field(..., gt=0, description="Quantity received/inwarded")
    unit_cost: Decimal = Field(..., ge=0, description="Purchase cost per unit")
    received_date: Optional[str] = Field(None, max_length=10, description="YYYY-MM-DD, defaults to today")
    expiry_date: Optional[str] = Field(None, max_length=10, description="YYYY-MM-DD of batch expiry")
    supplier_id: Optional[int] = Field(default=None, gt=0)
    batch_number: Optional[str] = Field(default="", max_length=100)
    notes: Optional[str] = Field(default="", max_length=1000)

    @model_validator(mode="before")
    @classmethod
    def map_incoming_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "quantity_received" in data and "quantity" not in data:
                data["quantity"] = data["quantity_received"]
            if "quantityReceived" in data and "quantity" not in data:
                data["quantity"] = data["quantityReceived"]
        return data


class RawInventoryBatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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
