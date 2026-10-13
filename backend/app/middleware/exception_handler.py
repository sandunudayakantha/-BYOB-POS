import logging
from typing import Any
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.exceptions import (
    AppException,
    AuthenticationException,
    AuthorizationException,
    ConflictException,
    DatabaseException,
    NotFoundException,
    ValidationException,
)
from app.schemas.common import APIResponse, ErrorCode, ResponseStatus

logger = logging.getLogger(__name__)

STATUS_CODE_MAP = {
    ErrorCode.NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.VALIDATION_ERROR: status.HTTP_422_UNPROCESSABLE_ENTITY,
    ErrorCode.UNAUTHORIZED: status.HTTP_401_UNAUTHORIZED,
    ErrorCode.FORBIDDEN: status.HTTP_403_FORBIDDEN,
    ErrorCode.CONFLICT: status.HTTP_409_CONFLICT,
    ErrorCode.BAD_REQUEST: status.HTTP_400_BAD_REQUEST,
    ErrorCode.INTERNAL_ERROR: status.HTTP_500_INTERNAL_SERVER_ERROR,
}

async def exception_handler(request: Request, exc: AppException) -> JSONResponse:
    http_status = STATUS_CODE_MAP.get(exc.error_code, status.HTTP_400_BAD_REQUEST)
    return JSONResponse(
        status_code=http_status,
        content=APIResponse(
            data=exc.details or None,
            status=ResponseStatus.ERROR,
            message=exc.message,
            error_code=exc.error_code,
        ).model_dump(mode="json"),
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=APIResponse(
            data=None,
            status=ResponseStatus.ERROR,
            message=str(exc.detail),
            error_code=ErrorCode.BAD_REQUEST,
        ).model_dump(mode="json"),
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = []
    for err in exc.errors():
        item = {
            "type": err.get("type"),
            "loc": err.get("loc"),
            "msg": str(err.get("msg", "")),
        }
        errors.append(item)

    logger.warning(f"request_validation_failed: url={request.url} errors={errors}")


    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=APIResponse(
            data={"errors": errors},
            status=ResponseStatus.ERROR,
            message="Input validation failed",
            error_code=ErrorCode.VALIDATION_ERROR,
        ).model_dump(mode="json"),
    )

async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_server_exception", exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIResponse(
            data=None,
            status=ResponseStatus.ERROR,
            message="Internal server error",
            error_code=ErrorCode.INTERNAL_ERROR,
        ).model_dump(mode="json"),
    )
