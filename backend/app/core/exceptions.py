from typing import Any
from app.schemas.common import ErrorCode

class AppException(Exception):
    def __init__(self, message: str, error_code: ErrorCode = ErrorCode.INTERNAL_ERROR, details: dict[str, Any] | None = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)

class NotFoundException(AppException):
    def __init__(self, message: str, details=None):
        super().__init__(message, ErrorCode.NOT_FOUND, details)

class ValidationException(AppException):
    def __init__(self, message: str, details=None):
        super().__init__(message, ErrorCode.VALIDATION_ERROR, details)

class ConflictException(AppException):
    def __init__(self, message: str, details=None):
        super().__init__(message, ErrorCode.CONFLICT, details)

class AuthenticationException(AppException):
    def __init__(self, message: str = "Authentication failed", details=None):
        super().__init__(message, ErrorCode.UNAUTHORIZED, details)

class AuthorizationException(AppException):
    def __init__(self, message: str = "Permission denied", details=None):
        super().__init__(message, ErrorCode.FORBIDDEN, details)

class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request", details=None):
        super().__init__(message, ErrorCode.BAD_REQUEST, details)

class DatabaseException(AppException):
    def __init__(self, message: str = "Database operation failed", details=None):
        super().__init__(message, ErrorCode.INTERNAL_ERROR, details)
