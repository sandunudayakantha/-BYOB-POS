from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.enums import GeneralStatus
from app.utils.validators import validate_safe_url


class RestaurantBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=2, max_length=200)
    logo: str | None = Field(default="", max_length=500)
    cover_image: str | None = Field(default="", max_length=500)
    status: GeneralStatus = GeneralStatus.ACTIVE
    max_branches: int = Field(default=3, ge=1, le=100)

    @field_validator("logo", "cover_image")
    @classmethod
    def check_safe_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)


class RestaurantCreate(RestaurantBase):
    pass


class RestaurantUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=2, max_length=200)
    logo: str | None = Field(default=None, max_length=500)
    cover_image: str | None = Field(default=None, max_length=500)
    status: GeneralStatus | None = None
    max_branches: int | None = Field(default=None, ge=1, le=100)

    @field_validator("logo", "cover_image")
    @classmethod
    def check_safe_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)


class RestaurantResponse(RestaurantBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    created_at: datetime
