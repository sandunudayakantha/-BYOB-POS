from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import GeneralStatus

class RestaurantBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=2, max_length=200)
    logo: str | None = Field(default="", max_length=500)
    cover_image: str | None = Field(default="", max_length=500)
    status: GeneralStatus = GeneralStatus.ACTIVE
    max_branches: int = Field(default=3, ge=1, le=100)

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=2, max_length=200)
    logo: str | None = Field(default=None, max_length=500)
    cover_image: str | None = Field(default=None, max_length=500)
    status: GeneralStatus | None = None
    max_branches: int | None = Field(default=None, ge=1, le=100)

class RestaurantResponse(RestaurantBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    created_at: datetime
