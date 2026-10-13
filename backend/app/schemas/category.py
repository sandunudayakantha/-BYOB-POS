from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.models.enums import GeneralStatus

class CategoryBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(default="", max_length=500)
    sort_order: int = Field(default=0, ge=0, le=10000)
    status: GeneralStatus = GeneralStatus.ACTIVE

    @model_validator(mode="before")
    @classmethod
    def map_incoming_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "restaurantId" in data and "restaurant_id" not in data:
                data["restaurant_id"] = data["restaurantId"]
        return data

class CategoryCreate(CategoryBase):
    restaurant_id: int | None = Field(default=None, gt=0)
    branch_id: int = Field(..., gt=0)

    @model_validator(mode="before")
    @classmethod
    def map_create_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
            if "restaurantId" in data and "restaurant_id" not in data:
                data["restaurant_id"] = data["restaurantId"]
        return data

class CategoryUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    sort_order: int | None = Field(default=None, ge=0, le=10000)
    status: GeneralStatus | None = None

    @model_validator(mode="before")
    @classmethod
    def map_update_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
        return data

class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    _id: int | None = None
    restaurant_id: int
    restaurantId: int | None = None
    branch_id: int
    branchId: int | None = None
    name: str
    description: str | None = ""
    sort_order: int = 0
    sortOrder: int | None = None
    status: str

    @model_validator(mode="after")
    def sync_aliases(self) -> "CategoryResponse":
        self._id = self.id
        self.restaurantId = self.restaurant_id
        self.branchId = self.branch_id
        self.sortOrder = self.sort_order
        return self
