from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator
from app.models.enums import UserRole, UserStatus
from app.utils.validators import validate_password_strength

class UserBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole = UserRole.RESTAURANT_OWNER
    restaurant_id: int | None = Field(default=None, gt=0)

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password_strength(v)

class UserUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=2, max_length=150)
    email: EmailStr | None = None
    role: UserRole | None = None
    status: UserStatus | None = None
    restaurant_id: int | None = Field(default=None, gt=0)

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    status: str
    restaurant_id: int | None = None

class UserLogin(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    username: str | None = Field(default=None, min_length=3, max_length=255)
    email: EmailStr | str | None = None
    password: str = Field(..., min_length=1, max_length=128)

    @model_validator(mode="before")
    @classmethod
    def populate_username_from_email(cls, data: any) -> any:
        if isinstance(data, dict):
            if not data.get("username") and data.get("email"):
                data["username"] = data["email"]
        return data

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str | None) -> str:
        if not v:
            raise ValueError("Username or email is required")
        return v

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefresh(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    refresh_token: str | None = Field(default=None, max_length=1000)
