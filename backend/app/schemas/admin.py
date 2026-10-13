from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator
from app.models.enums import GeneralStatus

class AdminRestaurantCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=2, max_length=200)
    owner_name: str = Field(..., min_length=2, max_length=150)
    owner_email: EmailStr
    owner_password: str = Field(..., min_length=6, max_length=128)
    max_branches: int = Field(default=3, ge=1, le=100)

    @model_validator(mode="before")
    @classmethod
    def map_camel_case(cls, data: any) -> any:
        if isinstance(data, dict):
            if "ownerName" in data and "owner_name" not in data:
                data["owner_name"] = data["ownerName"]
            if "ownerEmail" in data and "owner_email" not in data:
                data["owner_email"] = data["ownerEmail"]
            if "ownerPassword" in data and "owner_password" not in data:
                data["owner_password"] = data["ownerPassword"]
            if "maxBranches" in data and "max_branches" not in data:
                data["max_branches"] = data["maxBranches"]
        return data

class AdminRestaurantOwner(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    status: str

class AdminRestaurantItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    _id: int | None = None
    name: str
    owner_id: int
    logo: str | None = ""
    cover_image: str | None = ""
    status: str
    max_branches: int
    maxBranches: int | None = None
    created_at: datetime
    branch_count: int = 0
    branchCount: int | None = None
    owner: AdminRestaurantOwner | None = None

    @model_validator(mode="after")
    def sync_aliases(self) -> "AdminRestaurantItem":
        self._id = self.id
        self.maxBranches = self.max_branches
        self.branchCount = self.branch_count
        return self

class AdminRestaurantStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(ACTIVE|SUSPENDED)$")

class AdminRestaurantBranchLimitUpdate(BaseModel):
    max_branches: int = Field(..., ge=1, le=100)

    @model_validator(mode="before")
    @classmethod
    def map_camel_case(cls, data: any) -> any:
        if isinstance(data, dict):
            if "maxBranches" in data and "max_branches" not in data:
                data["max_branches"] = data["maxBranches"]
        return data

class AdminRestaurantResetPassword(BaseModel):
    new_password: str = Field(..., min_length=6, max_length=128)

    @model_validator(mode="before")
    @classmethod
    def map_camel_case(cls, data: any) -> any:
        if isinstance(data, dict):
            if "newPassword" in data and "new_password" not in data:
                data["new_password"] = data["newPassword"]
        return data
