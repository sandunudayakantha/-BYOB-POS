from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.models.enums import GeneralStatus
from app.schemas.product import ProductResponse

class MenuBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=2, max_length=150)
    description: str | None = Field(default="", max_length=1000)
    status: GeneralStatus = GeneralStatus.ACTIVE
    is_base_menu: bool = False

    @model_validator(mode="before")
    @classmethod
    def map_incoming_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "isBaseMenu" in data and "is_base_menu" not in data:
                data["is_base_menu"] = data["isBaseMenu"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "restaurantId" in data and "restaurant_id" not in data:
                data["restaurant_id"] = data["restaurantId"]
            if isinstance(data.get("is_base_menu"), str):
                data["is_base_menu"] = data["is_base_menu"].lower() in ("true", "1", "yes")
        return data

class MenuCreate(MenuBase):
    restaurant_id: int | None = Field(default=None, gt=0)
    branch_id: int = Field(..., gt=0)

    @model_validator(mode="before")
    @classmethod
    def map_create_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "isBaseMenu" in data and "is_base_menu" not in data:
                data["is_base_menu"] = data["isBaseMenu"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "restaurantId" in data and "restaurant_id" not in data:
                data["restaurant_id"] = data["restaurantId"]
            if isinstance(data.get("is_base_menu"), str):
                data["is_base_menu"] = data["is_base_menu"].lower() in ("true", "1", "yes")
        return data

class MenuUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    status: GeneralStatus | None = None
    is_base_menu: bool | None = None

    @model_validator(mode="before")
    @classmethod
    def map_update_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "isBaseMenu" in data and "is_base_menu" not in data:
                data["is_base_menu"] = data["isBaseMenu"]
            if isinstance(data.get("is_base_menu"), str):
                data["is_base_menu"] = data["is_base_menu"].lower() in ("true", "1", "yes")
        return data

class MenuItemBase(BaseModel):
    price: Decimal = Field(..., ge=Decimal("0.0"), le=Decimal("1000000.0"), decimal_places=2)
    available: bool = True
    sort_order: int = Field(default=0, ge=0, le=10000)

    @model_validator(mode="before")
    @classmethod
    def map_item_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
            if "productId" in data and "product_id" not in data:
                data["product_id"] = data["productId"]
            if "menuId" in data and "menu_id" not in data:
                data["menu_id"] = data["menuId"]
        return data

class MenuItemCreate(MenuItemBase):
    menu_id: int = Field(..., gt=0)
    product_id: int = Field(..., gt=0)

    @model_validator(mode="before")
    @classmethod
    def map_create_item_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "productId" in data and "product_id" not in data:
                data["product_id"] = data["productId"]
            if "menuId" in data and "menu_id" not in data:
                data["menu_id"] = data["menuId"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
        return data

class MenuItemUpdate(BaseModel):
    price: Decimal | None = Field(default=None, ge=Decimal("0.0"), le=Decimal("1000000.0"), decimal_places=2)
    available: bool | None = None
    sort_order: int | None = Field(default=None, ge=0, le=10000)

    @model_validator(mode="before")
    @classmethod
    def map_update_item_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
        return data

class MenuItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    _id: int | None = None
    menu_id: int
    menuId: int | None = None
    product_id: int
    productId: int | None = None
    price: Decimal
    available: bool = True
    sort_order: int = 0
    sortOrder: int | None = None
    product: ProductResponse | None = None

    @model_validator(mode="after")
    def sync_aliases(self) -> "MenuItemResponse":
        self._id = self.id
        self.menuId = self.menu_id
        self.productId = self.product_id
        self.sortOrder = self.sort_order
        return self

class MenuResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    _id: int | None = None
    restaurant_id: int
    restaurantId: int | None = None
    branch_id: int
    branchId: int | None = None
    name: str
    description: str | None = ""
    status: str
    is_base_menu: bool = False
    isBaseMenu: bool | None = None
    items: list[MenuItemResponse] = []
    item_count: int = 0
    itemCount: int | None = None

    @model_validator(mode="after")
    def sync_aliases(self) -> "MenuResponse":
        self._id = self.id
        self.restaurantId = self.restaurant_id
        self.branchId = self.branch_id
        self.isBaseMenu = self.is_base_menu
        self.itemCount = len(self.items) if self.items else self.item_count
        return self


class PriceMatrixCell(BaseModel):
    menuItemId: int
    price: float
    available: bool = True

class PriceMatrixResponse(BaseModel):
    menus: list[MenuResponse]
    products: list[ProductResponse]
    categories: list[dict]
    matrix: dict[str, dict[str, dict]]

class AdjustPricesRequest(BaseModel):
    percentage: float = 0.0
    sourceMode: str = Field(default="BASE_MENU", alias="source_mode")

    @model_validator(mode="before")
    @classmethod
    def map_adjust_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "sourceMode" in data and "source_mode" not in data:
                data["source_mode"] = data["sourceMode"]
        return data

class FillMissingRequest(BaseModel):
    percentage: float = 0.0
    overwriteExisting: bool = Field(default=False, alias="overwrite_existing")

    @model_validator(mode="before")
    @classmethod
    def map_fill_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "overwriteExisting" in data and "overwrite_existing" not in data:
                data["overwrite_existing"] = data["overwriteExisting"]
        return data

