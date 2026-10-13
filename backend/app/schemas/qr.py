from pydantic import BaseModel, ConfigDict, Field, model_validator

class QRCodeBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    table_name: str | None = Field(default="", max_length=100)
    is_active: bool = True

    @model_validator(mode="before")
    @classmethod
    def map_incoming_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "tableName" in data and "table_name" not in data:
                data["table_name"] = data["tableName"]
            if "isActive" in data and "is_active" not in data:
                data["is_active"] = data["isActive"]
            if "menuId" in data and "menu_id" not in data:
                data["menu_id"] = data["menuId"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "restaurantId" in data and "restaurant_id" not in data:
                data["restaurant_id"] = data["restaurantId"]
        return data

class QRCodeCreate(QRCodeBase):
    restaurant_id: int | None = Field(default=None, gt=0)
    branch_id: int = Field(..., gt=0)
    menu_id: int = Field(..., gt=0)

    @model_validator(mode="before")
    @classmethod
    def map_create_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "menuId" in data and "menu_id" not in data:
                data["menu_id"] = data["menuId"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "restaurantId" in data and "restaurant_id" not in data:
                data["restaurant_id"] = data["restaurantId"]
            if "tableName" in data and "table_name" not in data:
                data["table_name"] = data["tableName"]
            if "isActive" in data and "is_active" not in data:
                data["is_active"] = data["isActive"]
        return data

class QRCodeUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    table_name: str | None = Field(default=None, max_length=100)
    is_active: bool | None = None
    menu_id: int | None = Field(default=None, gt=0)

    @model_validator(mode="before")
    @classmethod
    def map_update_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "tableName" in data and "table_name" not in data:
                data["table_name"] = data["tableName"]
            if "isActive" in data and "is_active" not in data:
                data["is_active"] = data["isActive"]
            if "menuId" in data and "menu_id" not in data:
                data["menu_id"] = data["menuId"]
        return data

class QRCodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    _id: int | None = None
    restaurant_id: int
    restaurantId: int | None = None
    branch_id: int
    branchId: int | None = None
    menu_id: int
    menuId: int | None = None
    token: str
    table_name: str | None = ""
    tableName: str | None = None
    is_active: bool = True
    isActive: bool | None = None

    @model_validator(mode="after")
    def sync_aliases(self) -> "QRCodeResponse":
        self._id = self.id
        self.restaurantId = self.restaurant_id
        self.branchId = self.branch_id
        self.menuId = self.menu_id
        self.tableName = self.table_name
        self.isActive = self.is_active
        return self
