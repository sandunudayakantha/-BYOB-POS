from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from app.models.enums import GeneralStatus
from app.utils.validators import validate_phone_number, validate_safe_url

class BranchBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    restaurant_id: int | None = Field(default=None, gt=0)
    name: str = Field(..., min_length=2, max_length=150)
    address: str = Field(..., min_length=5, max_length=500)
    phone: str = Field(..., min_length=7, max_length=25)
    logo: str | None = Field(default="", max_length=500)
    cover_image: str | None = Field(default="", max_length=500)
    is_main: bool = False
    status: GeneralStatus = GeneralStatus.ACTIVE

    @model_validator(mode="before")
    @classmethod
    def map_aliases_and_types(cls, data: any) -> any:
        if isinstance(data, dict):
            # Map coverImage -> cover_image
            if "coverImage" in data and "cover_image" not in data:
                data["cover_image"] = data["coverImage"]
            # Map isMain -> is_main
            if "isMain" in data and "is_main" not in data:
                data["is_main"] = data["isMain"]
            # Handle boolean strings from FormData
            if isinstance(data.get("is_main"), str):
                data["is_main"] = data["is_main"].lower() in ("true", "1", "yes")
        return data

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        return validate_phone_number(v)

    @field_validator("logo", "cover_image")
    @classmethod
    def check_safe_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=2, max_length=150)
    address: str | None = Field(default=None, min_length=5, max_length=500)
    phone: str | None = Field(default=None, min_length=7, max_length=25)
    logo: str | None = Field(default=None, max_length=500)
    cover_image: str | None = Field(default=None, max_length=500)
    is_main: bool | None = None
    status: GeneralStatus | None = None

    @model_validator(mode="before")
    @classmethod
    def map_aliases_and_types(cls, data: any) -> any:
        if isinstance(data, dict):
            if "coverImage" in data and "cover_image" not in data:
                data["cover_image"] = data["coverImage"]
            if "isMain" in data and "is_main" not in data:
                data["is_main"] = data["isMain"]
            if isinstance(data.get("is_main"), str):
                data["is_main"] = data["is_main"].lower() in ("true", "1", "yes")
        return data

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str | None) -> str | None:
        if v is not None:
            return validate_phone_number(v)
        return v

    @field_validator("logo", "cover_image")
    @classmethod
    def check_safe_urls(cls, v: str | None) -> str | None:
        return validate_safe_url(v)

class BranchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    _id: int | None = None
    restaurant_id: int
    name: str
    address: str
    phone: str
    logo: str | None = ""
    cover_image: str | None = ""
    coverImage: str | None = None
    is_main: bool = False
    isMain: bool | None = None
    status: str
    created_at: datetime

    @model_validator(mode="after")
    def populate_aliases(self) -> "BranchResponse":
        self._id = self.id
        self.coverImage = self.cover_image or ""
        self.isMain = self.is_main
        return self
