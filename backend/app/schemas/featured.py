from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.product import ProductResponse

class FeaturedSectionBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default="", max_length=1000)
    start_date: datetime | None = None
    end_date: datetime | None = None
    is_active: bool = True

    @model_validator(mode="before")
    @classmethod
    def map_incoming_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "startDate" in data and "start_date" not in data:
                data["start_date"] = data["startDate"] or None
            if "endDate" in data and "end_date" not in data:
                data["end_date"] = data["endDate"] or None
            if "isActive" in data and "is_active" not in data:
                data["is_active"] = data["isActive"]
            if "productIds" in data and "product_ids" not in data:
                data["product_ids"] = data["productIds"]
            if "products" in data and "product_ids" not in data:
                data["product_ids"] = data["products"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "restaurantId" in data and "restaurant_id" not in data:
                data["restaurant_id"] = data["restaurantId"]
            if isinstance(data.get("is_active"), str):
                data["is_active"] = data["is_active"].lower() in ("true", "1", "yes")
        return data

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date cannot be earlier than start_date")
        return self

class FeaturedSectionCreate(FeaturedSectionBase):
    restaurant_id: int | None = Field(default=None, gt=0)
    branch_id: int = Field(..., gt=0)
    product_ids: list[int] = Field(default=[], max_length=50)

    @model_validator(mode="before")
    @classmethod
    def map_create_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "restaurantId" in data and "restaurant_id" not in data:
                data["restaurant_id"] = data["restaurantId"]
            if "productIds" in data and "product_ids" not in data:
                data["product_ids"] = data["productIds"]
            if "products" in data and "product_ids" not in data:
                data["product_ids"] = data["products"]
            if "product_ids" in data and isinstance(data["product_ids"], list):
                extracted = []
                for p in data["product_ids"]:
                    if isinstance(p, dict):
                        val = p.get("_id") if p.get("_id") is not None else p.get("id")
                    else:
                        val = p
                    if val is not None:
                        try:
                            extracted.append(int(val))
                        except (ValueError, TypeError):
                            pass
                data["product_ids"] = extracted
            if "startDate" in data and "start_date" not in data:
                data["start_date"] = data["startDate"] or None
            if "endDate" in data and "end_date" not in data:
                data["end_date"] = data["endDate"] or None
            if "isActive" in data and "is_active" not in data:
                data["is_active"] = data["isActive"]
            if isinstance(data.get("is_active"), str):
                data["is_active"] = data["is_active"].lower() in ("true", "1", "yes")
        return data

class FeaturedSectionUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    start_date: datetime | None = None
    end_date: datetime | None = None
    is_active: bool | None = None
    product_ids: list[int] | None = Field(default=None, max_length=50)

    @model_validator(mode="before")
    @classmethod
    def map_update_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "startDate" in data and "start_date" not in data:
                data["start_date"] = data["startDate"] or None
            if "endDate" in data and "end_date" not in data:
                data["end_date"] = data["endDate"] or None
            if "isActive" in data and "is_active" not in data:
                data["is_active"] = data["isActive"]
            if "productIds" in data and "product_ids" not in data:
                data["product_ids"] = data["productIds"]
            if "products" in data and "product_ids" not in data:
                data["product_ids"] = data["products"]
            if "product_ids" in data and isinstance(data["product_ids"], list):
                extracted = []
                for p in data["product_ids"]:
                    if isinstance(p, dict):
                        val = p.get("_id") if p.get("_id") is not None else p.get("id")
                    else:
                        val = p
                    if val is not None:
                        try:
                            extracted.append(int(val))
                        except (ValueError, TypeError):
                            pass
                data["product_ids"] = extracted
            if isinstance(data.get("is_active"), str):
                data["is_active"] = data["is_active"].lower() in ("true", "1", "yes")
        return data


    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date cannot be earlier than start_date")
        return self

class FeaturedSectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    _id: int | None = None
    restaurant_id: int
    restaurantId: int | None = None
    branch_id: int
    branchId: int | None = None
    title: str
    description: str | None = ""
    start_date: datetime | None = None
    startDate: datetime | None = None
    end_date: datetime | None = None
    endDate: datetime | None = None
    is_active: bool = True
    isActive: bool | None = None
    products: list[ProductResponse] = []

    @model_validator(mode="after")
    def sync_aliases(self) -> "FeaturedSectionResponse":
        self._id = self.id
        self.restaurantId = self.restaurant_id
        self.branchId = self.branch_id
        self.startDate = self.start_date
        self.endDate = self.end_date
        self.isActive = self.is_active
        return self

