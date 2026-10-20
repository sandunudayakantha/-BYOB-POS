from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from app.schemas.category import CategoryResponse
from app.utils.validators import validate_safe_url

class ProductBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default="", max_length=2000)
    image: str | None = Field(default="", max_length=500)
    prep_time: str | None = Field(default="15-20 mins", max_length=50)
    available: bool = True
    featured_image: str | None = Field(default="", max_length=500)

    @field_validator("image", "featured_image")
    @classmethod
    def check_safe_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)

    @model_validator(mode="before")
    @classmethod
    def map_incoming_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "prepTime" in data and "prep_time" not in data:
                data["prep_time"] = data["prepTime"]
            if "featuredImage" in data and "featured_image" not in data:
                data["featured_image"] = data["featuredImage"]
            if "categoryId" in data and "category_id" not in data:
                data["category_id"] = data["categoryId"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "restaurantId" in data and "restaurant_id" not in data:
                data["restaurant_id"] = data["restaurantId"]
            if isinstance(data.get("available"), str):
                data["available"] = data["available"].lower() in ("true", "1", "yes")
        return data

class ProductCreate(ProductBase):
    restaurant_id: int | None = Field(default=None, gt=0)
    branch_id: int = Field(..., gt=0)
    category_id: int = Field(..., gt=0)

    @model_validator(mode="before")
    @classmethod
    def map_create_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "categoryId" in data and "category_id" not in data:
                data["category_id"] = data["categoryId"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "restaurantId" in data and "restaurant_id" not in data:
                data["restaurant_id"] = data["restaurantId"]
            if "prepTime" in data and "prep_time" not in data:
                data["prep_time"] = data["prepTime"]
            if "featuredImage" in data and "featured_image" not in data:
                data["featured_image"] = data["featuredImage"]
            if isinstance(data.get("available"), str):
                data["available"] = data["available"].lower() in ("true", "1", "yes")
        return data

class ProductUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    image: str | None = Field(default=None, max_length=500)
    prep_time: str | None = Field(default=None, max_length=50)
    available: bool | None = None
    featured_image: str | None = Field(default=None, max_length=500)
    category_id: int | None = Field(default=None, gt=0)

    @field_validator("image", "featured_image")
    @classmethod
    def check_safe_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)

    @model_validator(mode="before")
    @classmethod
    def map_update_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            if "categoryId" in data and "category_id" not in data:
                data["category_id"] = data["categoryId"]
            if "prepTime" in data and "prep_time" not in data:
                data["prep_time"] = data["prepTime"]
            if "featuredImage" in data and "featured_image" not in data:
                data["featured_image"] = data["featuredImage"]
            if isinstance(data.get("available"), str):
                data["available"] = data["available"].lower() in ("true", "1", "yes")
        return data

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    _id: int | None = None
    restaurant_id: int
    restaurantId: int | None = None
    branch_id: int
    branchId: int | None = None
    category_id: int
    categoryId: int | None = None
    name: str
    description: str | None = ""
    image: str | None = ""
    prep_time: str | None = "15-20 mins"
    prepTime: str | None = None
    available: bool = True
    featured_image: str | None = ""
    featuredImage: str | None = None
    category: CategoryResponse | None = None
    category_name: str | None = None
    categoryName: str | None = None

    @model_validator(mode="after")
    def sync_aliases(self) -> "ProductResponse":
        self._id = self.id
        self.restaurantId = self.restaurant_id
        self.branchId = self.branch_id
        self.categoryId = self.category_id
        self.prepTime = self.prep_time
        self.featuredImage = self.featured_image
        if self.category:
            self.category_name = self.category.name
            self.categoryName = self.category.name
        return self
