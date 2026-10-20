from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api.router import api_router
from app.audit.lifecycle import invoice_audit_lifespan
from app.core.exceptions import AppException
from app.core.logging import setup_logging
from app.core.rate_limit import limiter
from app.core.settings import settings
from app.core.versioning import APIVersioning
from app.db.session import SessionLocal
from app.middleware.exception_handler import (
    exception_handler,
    general_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.services.lookups_seed_service import sync_lookups_seed
from app.services.rbac_seed_service import sync_rbac_seed
from app.utils.constants import API_VERSION_CURRENT, APP_DESCRIPTION, APP_NAME

def create_app() -> FastAPI:
    setup_logging()

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        if settings.RBAC_SEED_ON_STARTUP or settings.LOOKUPS_SEED_ON_STARTUP:
            db = SessionLocal()
            try:
                if settings.RBAC_SEED_ON_STARTUP:
                    sync_rbac_seed(db)
                if settings.LOOKUPS_SEED_ON_STARTUP:
                    sync_lookups_seed(db)
            finally:
                db.close()
        async with invoice_audit_lifespan():
            yield

    application = FastAPI(
        title=f"{APP_NAME} API",
        version=API_VERSION_CURRENT,
        description=APP_DESCRIPTION,
        lifespan=lifespan,
        docs_url="/api/v1/docs" if settings.APP_DEBUG else None,
        redoc_url="/api/v1/redoc" if settings.APP_DEBUG else None,
        openapi_url="/api/v1/openapi.json" if settings.APP_DEBUG else None,
    )

    # Attach rate limiter
    application.state.limiter = limiter

    # Security headers middleware (CRIT-04)
    application.add_middleware(SecurityHeadersMiddleware)

    # CORS configuration with controlled methods and headers (CRIT-03)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "X-Access-Denied",
        ],
        expose_headers=["X-Access-Denied"],
    )
    application.add_middleware(RequestLoggingMiddleware)

    # Exception handlers
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    application.add_exception_handler(AppException, exception_handler)
    application.add_exception_handler(HTTPException, http_exception_handler)
    application.add_exception_handler(RequestValidationError, validation_exception_handler)
    application.add_exception_handler(Exception, general_exception_handler)

    APIVersioning.register_versioned_router(application, api_router, version="v1")
    return application

app = create_app()
