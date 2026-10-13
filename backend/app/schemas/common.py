from enum import Enum
from typing import Generic, TypeVar
from pydantic import BaseModel, ConfigDict, Field

DataT = TypeVar("DataT")

class ResponseStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    PENDING = "pending"

class ErrorCode(str, Enum):
    NOT_FOUND = "NOT_FOUND"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    CONFLICT = "CONFLICT"
    BAD_REQUEST = "BAD_REQUEST"
    UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"

class APIResponse(BaseModel, Generic[DataT]):
    model_config = ConfigDict(use_enum_values=True)
    data: DataT | None = None
    status: ResponseStatus = ResponseStatus.SUCCESS
    message: str = Field(default="Operation completed successfully")
    error_code: ErrorCode | None = None

class PaginatedData(BaseModel, Generic[DataT]):
    items: list[DataT]
    total: int
    skip: int
    limit: int
