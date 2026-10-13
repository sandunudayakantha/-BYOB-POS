# FastAPI ERP — Architecture Blueprint

> **Agent Reference Document** — Use this file to scaffold a new project with the exact same architecture.

---

## Stack

| Layer | Technology |
|---|---|
| Language | Python 3.13 |
| Framework | FastAPI 0.115.0 |
| ORM | SQLAlchemy 2.0.36 (sync, session-per-request) |
| Migrations | Alembic 1.13.3 |
| Database | PostgreSQL (psycopg2-binary driver) — SQLite in-memory for tests |
| Validation | Pydantic v2 + pydantic-settings |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| File Storage | OVH S3-compatible (boto3) |
| PDF | reportlab |
| HTTP Client | httpx |
| Dev Server | uvicorn |
| Prod Server | gunicorn + uvicorn workers |
| Testing | pytest + pytest-asyncio + SQLite in-memory |
| Quality | black, isort, ruff, mypy, autoflake, pre-commit |

---

## Dependencies

### requirements/base.txt
```
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.2
pydantic-settings==2.6.0
email-validator==2.1.0
python-multipart==0.0.12
boto3==1.35.71
httpx==0.28.1
reportlab==4.5.1
sqlalchemy==2.0.36
alembic==1.13.3
psycopg2-binary==2.9.10
cryptography==43.0.3
python-jose[cryptography]==3.5.0
passlib[bcrypt]==1.7.4
bcrypt==3.2.2
```

### requirements/development.txt
```
-r base.txt
pytest==8.3.3
pytest-asyncio==0.24.0
httpx==0.28.1
autoflake==2.3.1
black==24.10.0
isort==5.13.2
flake8==7.1.1
mypy==1.13.0
ruff==0.8.6
pre-commit==4.2.0
```

### requirements/production.txt
```
-r base.txt
gunicorn==23.0.0
```

---

## pyproject.toml

```toml
[tool.black]
line-length = 100
target-version = ["py313"]

[tool.isort]
profile = "black"
line_length = 100

[tool.mypy]
python_version = "3.13"
strict = false
ignore_missing_imports = true
explicit_package_bases = true
mypy_path = "."

[tool.ruff]
line-length = 100
target-version = "py313"

[tool.ruff.lint]
select = ["E", "F", "W", "UP"]
ignore = ["E203"]
exclude = ["alembic/versions/*"]

[tool.ruff.lint.per-file-ignores]
"app/scripts/*.py" = ["E402"]

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
asyncio_default_fixture_loop_scope = "function"
filterwarnings = [
    "ignore::DeprecationWarning:passlib.*:",
    "ignore::DeprecationWarning:pydantic.*:",
]
```

---

## Directory Structure

```
your-api/
├── .dockerignore
├── .env.example
├── .gitignore
├── .pre-commit-config.yaml
├── .python-version                   # 3.13
├── Dockerfile
├── alembic.ini
├── docker-compose.yml
├── docker-compose.prod.yml
├── pyproject.toml
│
├── alembic/
│   ├── env.py                        # uses settings.DATABASE_URL dynamically
│   ├── script.py.mako
│   └── versions/
│
├── app/
│   ├── __init__.py
│   ├── main.py                       # create_app() factory
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                   # get_db, get_current_user, require_* deps
│   │   ├── permissions.py            # permission area string constants + frozenset
│   │   ├── permission_utils.py
│   │   ├── route_guards.py           # pre-bound Depends for each permission
│   │   ├── router.py                 # api_router including v1_router
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py             # v1_router: include all routes
│   │       └── routes/
│   │           ├── __init__.py
│   │           ├── auth.py
│   │           ├── health.py
│   │           ├── users.py
│   │           └── <entity>.py       # one file per entity
│   ├── audit/
│   │   ├── __init__.py
│   │   ├── lifecycle.py              # asynccontextmanager + background thread
│   │   ├── recorder.py               # SQLAlchemy session event listeners
│   │   └── writer.py                 # rotating JSONL export
│   ├── core/
│   │   ├── exceptions.py             # AppException hierarchy
│   │   ├── logging.py                # setup_logging()
│   │   ├── security.py               # JWT + bcrypt
│   │   ├── settings.py               # Settings + singleton
│   │   └── versioning.py             # APIVersioning.register_versioned_router()
│   ├── data/
│   │   ├── lookups_seed.json
│   │   └── rbac_seed.json
│   ├── db/
│   │   ├── base.py                   # DeclarativeBase
│   │   └── session.py                # engine, SessionLocal, get_db()
│   ├── integrations/
│   │   └── <provider>/               # e.g. whatsapp/client.py
│   ├── middleware/
│   │   ├── exception_handler.py      # 4 handlers -> APIResponse JSON
│   │   └── logging.py                # RequestLoggingMiddleware
│   ├── models/
│   │   ├── __init__.py               # import ALL + register_invoice_audit() LAST
│   │   ├── enums.py
│   │   ├── mixins.py                 # IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin
│   │   └── <domain>.py               # one file per domain group
│   ├── repositories/
│   │   ├── base.py                   # BaseRepository[ModelType]
│   │   └── <entity>_repo.py
│   ├── schemas/
│   │   ├── common.py                 # APIResponse, PaginatedData, ErrorCode, ResponseStatus
│   │   └── <entity>.py
│   ├── services/
│   │   ├── base.py                   # BaseCRUDService[ModelType]
│   │   ├── auth_service.py
│   │   ├── rbac_seed_service.py
│   │   ├── lookups_seed_service.py
│   │   └── <entity>_service.py
│   └── utils/
│       ├── constants.py              # APP_NAME, API_VERSION_*, pagination defaults
│       ├── file_upload.py            # OVH S3 upload/delete/presign
│       ├── formatters.py
│       ├── response_utils.py
│       ├── roles.py
│       └── validators.py
│
├── scripts/
│   ├── entrypoint.sh
│   ├── migrate.sh
│   ├── generate_crud.py              # scaffolds full CRUD for a new entity
│   └── checks/                       # pre-commit architecture guard scripts
│       ├── dry_crud_required.py
│       ├── no_db_commit_in_services.py
│       ├── no_pydantic_v1_config.py
│       ├── no_raise_in_routes.py
│       ├── no_raw_db_query_in_services.py
│       ├── pagination_bounded.py
│       ├── service_logger_required.py
│       ├── service_sqlalchemy_guard.py
│       └── test_coverage_required.py
│
└── tests/
    ├── conftest.py                   # SQLite in-memory fixtures
    ├── api/
    ├── repositories/
    ├── services/
    └── utils/
```

---

## Architecture Rules (Non-Negotiable)

9 automated pre-commit guards enforce these rules. Violations block commits.

| # | Rule | Guard Script |
|---|---|---|
| 1 | Routes **never** use `raise` — exceptions come from services | `no_raise_in_routes.py` |
| 2 | Services **never** call `db.query()` — only repos do | `no_raw_db_query_in_services.py` |
| 3 | Services **never** call `db.commit()` — use `repo.commit(db)` | `no_db_commit_in_services.py` |
| 4 | Every service module has `logger = logging.getLogger(__name__)` | `service_logger_required.py` |
| 5 | Every service DB method catches `SQLAlchemyError` + calls `db.rollback()` | `service_sqlalchemy_guard.py` |
| 6 | Always re-raise `AppException` **before** `except SQLAlchemyError` | Pattern |
| 7 | All `limit` Query params have `le=` upper bound | `pagination_bounded.py` |
| 8 | No Pydantic v1 `class Config` — use `model_config = ConfigDict(...)` | `no_pydantic_v1_config.py` |
| 9 | CRUD uses `BaseCRUDService`/`BaseRepository` — never reimplemented | `dry_crud_required.py` |
| 10 | Every module has a corresponding test file | `test_coverage_required.py` |
| 11 | Delete is soft-delete by default (`is_deleted = True`) | BaseRepository |
| 12 | `_active_query()` always filters `is_deleted=False` | BaseRepository |
| 13 | Every model uses 3 mixins + `Base` | Pattern |
| 14 | `models/__init__.py` imports ALL models (Alembic detection) | Alembic |
| 15 | `register_invoice_audit()` called last in `models/__init__.py` | Pattern |
| 16 | Store S3 object keys in DB — never full URLs | File upload pattern |
| 17 | Swagger/Docs disabled in production (`APP_DEBUG=False`) | settings.py |
| 18 | `response_model=APIResponse[...]` on every route | Pattern |
| 19 | Service is a module-level singleton in route files | Pattern |
| 20 | `from __future__ import annotations` at top of every model file | Pattern |

---

## Request/Response Flow

```
Client HTTP request
  -> RequestLoggingMiddleware (logs method + path + status + ms)
  -> FastAPI Router (/api/v1/...)
  -> Route handler  [dep-injects: db, current_user (JWT), permission check]
                    [NEVER raises — just calls service]
  -> Service method [business logic, try/except SQLAlchemyError, re-raises AppException]
  -> Repository     [_active_query() + db ops via repo.commit(db)]
  -> SQLAlchemy / PostgreSQL
  -> APIResponse[T] returned by route
  -> Exception handlers convert AppException/HTTPException -> APIResponse JSON
```

---

## API Response Envelope

Every endpoint returns `APIResponse[T]`:

**Success:**
```json
{ "data": { ... }, "status": "success", "message": "...", "error_code": null }
```

**Paginated list:**
```json
{ "data": { "items": [...], "total": 100, "skip": 0, "limit": 20 }, "status": "success", "message": "...", "error_code": null }
```

**Error:**
```json
{ "data": null, "status": "error", "message": "Category not found", "error_code": "NOT_FOUND" }
```

---

## Layer Templates

### Layer 1 — DB

**app/db/base.py**
```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)
```

**app/db/session.py**
```python
from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from app.core.settings import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_recycle=3600, echo=settings.APP_DEBUG)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### Layer 2 — Models

**app/models/mixins.py**
```python
from datetime import UTC, datetime
from sqlalchemy import Boolean, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column

class IntegerPrimaryKeyMixin:
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False)

class SoftDeleteMixin:
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
```

**Model pattern:**
```python
# app/models/domain.py
from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.mixins import IntegerPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.rbac import Role  # type hints only — avoids circular imports

class User(IntegerPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "users"
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    role: Mapped[Role] = relationship(back_populates="users")
```

**app/models/__init__.py:**
```python
from app.models.user import User
from app.models.rbac import Role, Permission, RolePermission
# ... all models ...
__all__ = ["User", "Role", ...]

from app.audit.recorder import register_invoice_audit  # noqa: E402
register_invoice_audit()  # MUST be last
```

---

### Layer 3 — Repositories

**app/repositories/base.py**
```python
from __future__ import annotations
import builtins
from typing import Any, Generic, TypeVar
from sqlalchemy.orm import Session
from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType]) -> None:
        self.model = model

    def _active_query(self, db: Session):
        query = db.query(self.model)
        col = getattr(self.model, "is_deleted", None)
        if col is not None:
            query = query.filter(col.is_(False))
        return query

    def get(self, db, id: int) -> ModelType | None:
        return self._active_query(db).filter(self.model.id == id).first()

    def exists(self, db, id: int) -> bool:
        q = db.query(self.model.id).filter(self.model.id == id)
        col = getattr(self.model, "is_deleted", None)
        if col is not None:
            q = q.filter(col.is_(False))
        return q.first() is not None

    def list(self, db, skip: int = 0, limit: int = 100) -> builtins.list[ModelType]:
        return self._active_query(db).offset(skip).limit(limit).all()

    def list_paginated(self, db, skip: int = 0, limit: int = 100) -> tuple[int, builtins.list[ModelType]]:
        q = self._active_query(db).order_by(self.model.id.asc())
        return q.count(), q.offset(skip).limit(limit).all()

    def count(self, db) -> int:
        return self._active_query(db).count()

    def add(self, db, obj): db.add(obj)
    def add_all(self, db, objects): db.add_all(objects)
    def flush(self, db): db.flush()
    def commit(self, db): db.commit()  # Services call this — never db.commit() directly
    def refresh(self, db, obj): db.refresh(obj); return obj

    def create(self, db, data: dict[str, Any]) -> ModelType:
        obj = self.model(**data)
        self.add(db, obj); self.commit(db); self.refresh(db, obj)
        return obj

    def update(self, db, obj: ModelType, data: dict[str, Any]) -> ModelType:
        for k, v in data.items(): setattr(obj, k, v)
        self.commit(db); self.refresh(db, obj)
        return obj

    def delete(self, db, obj: ModelType) -> None:
        if hasattr(obj, "is_deleted"):
            obj.is_deleted = True; self.commit(db)
        else:
            db.delete(obj); self.commit(db)
```

**Entity repo pattern:**
```python
# app/repositories/category_repo.py
from app.models.lookups import Category
from app.repositories.base import BaseRepository

class CategoryRepository(BaseRepository[Category]):
    def __init__(self) -> None:
        super().__init__(Category)

    def get_by_name(self, db, name: str) -> Category | None:
        return self._active_query(db).filter(Category.name == name).first()
```

---

### Layer 4 — Services

**app/services/base.py**
```python
from __future__ import annotations
import logging
from typing import Generic, TypeVar
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.core.exceptions import AppException, DatabaseException, NotFoundException
from app.db.base import Base
from app.repositories.base import BaseRepository

logger = logging.getLogger(__name__)
ModelType = TypeVar("ModelType", bound=Base)

class BaseCRUDService(Generic[ModelType]):
    def __init__(self, repo: BaseRepository[ModelType], *, entity_name: str, resource_name: str) -> None:
        self.repo = repo
        self.entity_name = entity_name
        self.resource_name = resource_name

    def create(self, db: Session, data: BaseModel, **extra) -> ModelType:
        try:
            payload = data.model_dump(exclude_unset=True)
            payload.update(extra)
            return self.repo.create(db, payload)
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"create_{self.resource_name}_db_error", extra={"error": str(e)})
            raise DatabaseException(f"Failed to create {self.resource_name} due to database error")

    def get(self, db: Session, item_id: int) -> ModelType:
        try:
            obj = self.repo.get(db, item_id)
            if not obj:
                raise NotFoundException(f"{self.entity_name} not found")
            return obj
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"get_{self.resource_name}_db_error", extra={"error": str(e)})
            raise DatabaseException(f"Failed to get {self.resource_name} due to database error")

    def list(self, db: Session, skip: int = 0, limit: int = 100) -> tuple[int, list[ModelType]]:
        try:
            return self.repo.list_paginated(db, skip=skip, limit=limit)
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"list_{self.resource_name}_db_error", extra={"error": str(e)})
            raise DatabaseException(f"Failed to list {self.resource_name} due to database error")

    def update(self, db: Session, item_id: int, data: BaseModel) -> ModelType:
        try:
            obj = self.repo.get(db, item_id)
            if not obj:
                raise NotFoundException(f"{self.entity_name} not found")
            return self.repo.update(db, obj, data.model_dump(exclude_unset=True))
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"update_{self.resource_name}_db_error", extra={"error": str(e)})
            raise DatabaseException(f"Failed to update {self.resource_name} due to database error")

    def delete(self, db: Session, item_id: int) -> None:
        try:
            obj = self.repo.get(db, item_id)
            if not obj:
                raise NotFoundException(f"{self.entity_name} not found")
            self.repo.delete(db, obj)
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"delete_{self.resource_name}_db_error", extra={"error": str(e)})
            raise DatabaseException(f"Failed to delete {self.resource_name} due to database error")
```

**Entity service pattern:**
```python
# app/services/category_service.py
import logging
from app.models.lookups import Category
from app.repositories.category_repo import CategoryRepository
from app.services.base import BaseCRUDService

logger = logging.getLogger(__name__)  # REQUIRED by arch guard

class CategoryService(BaseCRUDService[Category]):
    def __init__(self) -> None:
        super().__init__(CategoryRepository(), entity_name="Category", resource_name="category")
```

---

### Layer 5 — Schemas

**app/schemas/common.py**
```python
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
```

**Entity schema pattern:**
```python
# app/schemas/category.py
from pydantic import BaseModel, ConfigDict

class CategoryBase(BaseModel):
    name: str
    description: str | None = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)  # NEVER class Config
    id: int
```

---

### Layer 6 — Routes

**Entity route pattern:**
```python
# app/api/v1/routes/category.py
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.route_guards import require_inventory_manage
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.common import APIResponse, PaginatedData
from app.services.category_service import CategoryService

router = APIRouter()
service = CategoryService()  # module-level singleton

@router.get("", response_model=APIResponse[PaginatedData[CategoryResponse]])
def list_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),  # le= REQUIRED
    db: Session = Depends(get_db),
    _: User = Depends(require_inventory_manage),
):
    total, items = service.list(db, skip=skip, limit=limit)
    return APIResponse(data=PaginatedData(items=items, total=total, skip=skip, limit=limit))

@router.post("", response_model=APIResponse[CategoryResponse], status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), _: User = Depends(require_inventory_manage)):
    # NO raise here — exceptions propagate from service to exception handlers
    return APIResponse(data=service.create(db, data), message="Created successfully")

@router.get("/{item_id}", response_model=APIResponse[CategoryResponse])
def get_category(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_inventory_manage)):
    return APIResponse(data=service.get(db, item_id))

@router.put("/{item_id}", response_model=APIResponse[CategoryResponse])
def update_category(item_id: int, data: CategoryUpdate, db: Session = Depends(get_db), _: User = Depends(require_inventory_manage)):
    return APIResponse(data=service.update(db, item_id, data), message="Updated successfully")

@router.delete("/{item_id}", response_model=APIResponse[None])
def delete_category(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_inventory_manage)):
    service.delete(db, item_id)
    return APIResponse(data=None, message="Deleted successfully")
```

**Auth routes:**
```python
# app/api/v1/routes/auth.py
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.common import APIResponse, ResponseStatus
from app.schemas.user import Token, TokenRefresh, UserLogin
from app.services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()

@router.post("/login", response_model=APIResponse[Token])
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    token = auth_service.login(db, credentials.username, credentials.password)
    return APIResponse(data=token, status=ResponseStatus.SUCCESS, message="Login successful")

@router.post("/refresh", response_model=APIResponse[Token])
def refresh(body: TokenRefresh, db: Session = Depends(get_db)):
    return APIResponse(data=auth_service.refresh_token(db, body.refresh_token), message="Token refreshed successfully")

@router.post("/logout", response_model=APIResponse[dict])
def logout():
    return APIResponse(data={"detail": "Logged out."}, message="Logout successful")

@router.post("/token", response_model=Token)
def token_endpoint(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2-compatible — used by Swagger UI Authorize button
    return auth_service.login(db, form_data.username, form_data.password)
```

---

## Core Module Templates

### app/core/settings.py
```python
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    ALLOWED_ORIGINS_STR: str = "http://localhost:3000,http://localhost:8000"

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS_STR.split(",")]

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "your_db"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""

    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    OVH_S3_ENDPOINT_URL: str = ""
    OVH_S3_BASE_URL: str = ""
    OVH_S3_ACCESS_KEY: str = ""
    OVH_S3_SECRET_KEY: str = ""
    OVH_S3_BUCKET_NAME: str = ""
    OVH_S3_REGION: str = "gra"
    OVH_S3_KEY_PREFIX: str = ""

    RBAC_SEED_ON_STARTUP: bool = True
    LOOKUPS_SEED_ON_STARTUP: bool = True

    INVOICE_AUDIT_LOG_PATH: str = "logs/invoice-audit.jsonl"
    INVOICE_AUDIT_MAX_BYTES: int = Field(default=10 * 1024 * 1024, ge=1)
    INVOICE_AUDIT_BACKUPS: int = Field(default=30, ge=1)
    INVOICE_AUDIT_POLL_SECONDS: float = Field(default=5.0, gt=0)

    WHATSAPP_ENABLED: bool = False
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = ""
    TWILIO_WEBHOOK_URL: str = ""

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
```

### app/core/exceptions.py
```python
from typing import Any
from app.schemas.common import ErrorCode

class AppException(Exception):
    def __init__(self, message: str, error_code: ErrorCode = ErrorCode.INTERNAL_ERROR, details: dict[str, Any] | None = None):
        self.message = message; self.error_code = error_code; self.details = details or {}
        super().__init__(self.message)

class NotFoundException(AppException):
    def __init__(self, message: str, details=None): super().__init__(message, ErrorCode.NOT_FOUND, details)

class ValidationException(AppException):
    def __init__(self, message: str, details=None): super().__init__(message, ErrorCode.VALIDATION_ERROR, details)

class ConflictException(AppException):
    def __init__(self, message: str, details=None): super().__init__(message, ErrorCode.CONFLICT, details)

class AuthenticationException(AppException):
    def __init__(self, message: str = "Authentication failed", details=None): super().__init__(message, ErrorCode.UNAUTHORIZED, details)

class AuthorizationException(AppException):
    def __init__(self, message: str = "Permission denied", details=None): super().__init__(message, ErrorCode.FORBIDDEN, details)

class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request", details=None): super().__init__(message, ErrorCode.BAD_REQUEST, details)

class DatabaseException(AppException):
    def __init__(self, message: str = "Database operation failed", details=None): super().__init__(message, ErrorCode.INTERNAL_ERROR, details)
```

### app/core/security.py
```python
from datetime import UTC, datetime, timedelta
from typing import Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str: return pwd_context.hash(password)
def verify_password(plain: str, hashed: str) -> bool: return pwd_context.verify(plain, hashed)

def create_access_token(subject: Any) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(subject), "exp": expire, "type": "access"}, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(subject: Any) -> str:
    expire = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(subject), "exp": expire, "type": "refresh"}, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try: return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError: return {}
```

### app/core/logging.py
```python
import logging, sys

def setup_logging() -> None:
    logging.basicConfig(stream=sys.stdout, level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
```

---

## Application Factory — app/main.py

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.audit.lifecycle import invoice_audit_lifespan
from app.core.exceptions import AppException
from app.core.logging import setup_logging
from app.core.settings import settings
from app.core.versioning import APIVersioning
from app.db.session import SessionLocal
from app.middleware.exception_handler import (
    exception_handler, general_exception_handler,
    http_exception_handler, validation_exception_handler,
)
from app.middleware.logging import RequestLoggingMiddleware
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
                if settings.RBAC_SEED_ON_STARTUP: sync_rbac_seed(db)
                if settings.LOOKUPS_SEED_ON_STARTUP: sync_lookups_seed(db)
            finally:
                db.close()
        async with invoice_audit_lifespan():
            yield

    application = FastAPI(
        title=f"{APP_NAME} API", version=API_VERSION_CURRENT, description=APP_DESCRIPTION,
        lifespan=lifespan,
        docs_url="/api/v1/docs" if settings.APP_DEBUG else None,
        redoc_url="/api/v1/redoc" if settings.APP_DEBUG else None,
        openapi_url="/api/v1/openapi.json" if settings.APP_DEBUG else None,
    )

    application.add_middleware(CORSMiddleware, allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
        expose_headers=["X-Access-Denied"])
    application.add_middleware(RequestLoggingMiddleware)

    application.add_exception_handler(AppException, exception_handler)            # type: ignore
    application.add_exception_handler(HTTPException, http_exception_handler)       # type: ignore
    application.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore
    application.add_exception_handler(Exception, general_exception_handler)

    APIVersioning.register_versioned_router(application, api_router, version="v1")
    return application

app = create_app()
```

---

## RBAC System

**app/api/permissions.py** — string constants matching rbac_seed.json:
```python
DASHBOARD_VIEW = "dashboard.view"
INVENTORY_MANAGE = "inventory.manage"
SALES_VIEW = "sales.view"
SALES_CREATE_INVOICE = "sales.create_invoice"
CUSTOMERS_MANAGE = "customers.manage"
USERS_MANAGE = "users.manage"
SYSTEM_SETTINGS = "system.settings"
# ... all areas ...

ALL_PERMISSION_AREAS: frozenset[str] = frozenset({DASHBOARD_VIEW, INVENTORY_MANAGE, ...})
```

**app/api/route_guards.py** — pre-bound dependencies:
```python
from app.api.deps import require_any_permission, require_exact_permission
from app.api.permissions import DASHBOARD_VIEW, INVENTORY_MANAGE, ...

require_dashboard_view = require_exact_permission(DASHBOARD_VIEW)
require_inventory_manage = require_exact_permission(INVENTORY_MANAGE)
# Compound (any of these grants access):
require_sales_read = require_any_permission(SALES_VIEW, SALES_CREATE_INVOICE)
```

**app/api/deps.py** — `get_current_user` injects actor into db.info for audit trail:
```python
db.info["invoice_audit_actor"] = {
    "user_id": user.id, "username": user.username,
    "request_id": str(uuid4()), "method": request.method, "path": request.url.path,
}
```

**app/data/rbac_seed.json:**
```json
{
  "roles": [{"name": "super_admin"}, {"name": "admin"}, {"name": "manager"}, {"name": "cashier"}, {"name": "warehouse"}, {"name": "user"}],
  "permissions": [
    {"area": "dashboard.view", "name": "View Dashboard", "description": "Access dashboard"},
    {"area": "inventory.manage", "name": "Manage Inventory", "description": "Full inventory access"}
  ],
  "role_permissions": {
    "super_admin": ["dashboard.view", "inventory.manage"],
    "admin": ["dashboard.view", "inventory.manage"],
    "manager": ["dashboard.view"],
    "cashier": [],
    "warehouse": ["inventory.manage"],
    "user": []
  }
}
```

---

## Testing

**tests/conftest.py:**
```python
import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
import app.models  # noqa: F401
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.core.security import get_password_hash
from app.services.rbac_seed_service import sync_rbac_seed

@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool, echo=False)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def db(db_engine) -> Session:
    connection = db_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(sess, trans):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    yield session
    session.close(); transaction.rollback(); connection.close()

@pytest.fixture()
def client(db) -> TestClient:
    def _get_test_db(): yield db
    app.dependency_overrides[get_db] = _get_test_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def auth_headers(client, regular_user) -> dict:
    r = client.post("/api/v1/auth/login", json={"username": regular_user.username, "password": "Password1"})
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}
```

**Test pattern:**
```python
def test_list(client, auth_headers):
    r = client.get("/api/v1/categories", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "success"
    assert "items" in r.json()["data"]

def test_create(client, admin_headers):
    r = client.post("/api/v1/categories", json={"name": "Test"}, headers=admin_headers)
    assert r.status_code == 201
    assert r.json()["data"]["name"] == "Test"

def test_not_found(client, auth_headers):
    r = client.get("/api/v1/categories/99999", headers=auth_headers)
    assert r.status_code == 404
    assert r.json()["error_code"] == "NOT_FOUND"
```

---

## Alembic Setup

**alembic.ini:**
```ini
[alembic]
script_location = alembic
prepend_sys_path = .
version_path_separator = os
sqlalchemy.url = postgresql+psycopg2://%(DB_USER)s:%(DB_PASSWORD)s@%(DB_HOST)s:%(DB_PORT)s/%(DB_NAME)s
```

**alembic/env.py:**
```python
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import app.models  # noqa: F401
from alembic import context
from app.core.settings import settings
from app.db.base import Base

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)  # override from .env

target_metadata = Base.metadata
# ... standard offline/online functions ...
```

**Commands:**
```bash
alembic revision --autogenerate -m "add_categories_table"
alembic upgrade head
alembic downgrade -1
```

---

## Docker

**Dockerfile:**
```dockerfile
FROM --platform=linux/amd64 python:3.13-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libpq-dev build-essential && rm -rf /var/lib/apt/lists/*
COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/production.txt
COPY . .
EXPOSE 8000
RUN chmod +x /app/scripts/entrypoint.sh
CMD ["/app/scripts/entrypoint.sh"]
```

**scripts/entrypoint.sh:**
```bash
#!/bin/bash
set -e
bash /app/scripts/migrate.sh
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**scripts/migrate.sh:**
```bash
#!/bin/bash
set -e
python -c "
from alembic.config import Config; from alembic import command
from app.core.settings import settings
cfg = Config('alembic.ini')
cfg.set_main_option('sqlalchemy.url', settings.DATABASE_URL)
command.upgrade(cfg, 'head')
print('Migrations completed.')
"
```

**docker-compose.yml (dev):**
```yaml
name: your-app
services:
  app:
    build: { context: ., dockerfile: Dockerfile }
    platform: linux/amd64
    ports: ["8004:8000"]
    env_file: [.env]
    volumes: [".:/app", "./logs:/var/log/your-app"]
    command: >
      bash -c "bash /app/scripts/migrate.sh &&
               uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
    restart: unless-stopped
```

**docker-compose.prod.yml:**
```yaml
services:
  app:
    image: ghcr.io/${IMAGE_NAME}:${APP_ENV:-production}
    container_name: your_app_${APP_ENV:-production}
    ports: ["${APP_PORT:-8000}:8000"]
    env_file: [.env]
    volumes: ["./logs:/var/log/your-app"]
    restart: unless-stopped
    stop_grace_period: 30s
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

---

## .env.example

```env
COMPOSE_PROJECT_NAME=your-app
APP_ENV=development
APP_DEBUG=true
ALLOWED_ORIGINS_STR=http://localhost:3000,http://localhost:8000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db
DB_USER=postgres
DB_PASSWORD=secure_password

JWT_SECRET_KEY=change-me-use-python-secrets-token-urlsafe-64
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

OVH_S3_ENDPOINT_URL=
OVH_S3_BASE_URL=
OVH_S3_ACCESS_KEY=
OVH_S3_SECRET_KEY=
OVH_S3_BUCKET_NAME=
OVH_S3_REGION=gra
OVH_S3_KEY_PREFIX=

RBAC_SEED_ON_STARTUP=true
LOOKUPS_SEED_ON_STARTUP=true

INVOICE_AUDIT_LOG_PATH=logs/invoice-audit.jsonl
INVOICE_AUDIT_MAX_BYTES=10485760
INVOICE_AUDIT_BACKUPS=30
INVOICE_AUDIT_POLL_SECONDS=5.0

WHATSAPP_ENABLED=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
TWILIO_WEBHOOK_URL=
```

---

## Scaffold Order

```
1.  pyproject.toml, .python-version (3.13), .gitignore, .env.example
2.  requirements/base.txt + development.txt + production.txt
3.  app/db/base.py
4.  app/db/session.py
5.  app/schemas/common.py
6.  app/core/exceptions.py
7.  app/core/settings.py
8.  app/core/security.py
9.  app/core/logging.py
10. app/core/versioning.py
11. app/utils/constants.py
12. app/models/mixins.py
13. app/models/enums.py
14. app/models/<domain>.py        (all domain models)
15. app/models/__init__.py        (import all + register_invoice_audit() LAST)
16. app/audit/recorder.py
17. app/audit/writer.py
18. app/audit/lifecycle.py
19. app/repositories/base.py
20. app/repositories/<entity>_repo.py
21. app/services/base.py
22. app/services/auth_service.py
23. app/services/rbac_seed_service.py
24. app/services/lookups_seed_service.py
25. app/services/<entity>_service.py
26. app/api/permissions.py
27. app/api/route_guards.py
28. app/api/deps.py
29. app/middleware/exception_handler.py
30. app/middleware/logging.py
31. app/api/v1/routes/health.py
32. app/api/v1/routes/auth.py
33. app/api/v1/routes/<entity>.py
34. app/api/v1/router.py
35. app/api/router.py
36. app/main.py
37. alembic.ini + alembic/env.py
38. alembic revision --autogenerate -m "initial" && alembic upgrade head
39. scripts/checks/*.py           (architecture guards)
40. .pre-commit-config.yaml
41. pre-commit install
42. tests/conftest.py + all test files
43. Dockerfile + scripts/entrypoint.sh + scripts/migrate.sh
44. docker-compose.yml + docker-compose.prod.yml
```

---

## New Entity Checklist

For each new entity `<name>`:

- [ ] Model in `app/models/<domain>.py` using 3 mixins + Base
- [ ] Import model in `app/models/__init__.py`
- [ ] `app/repositories/<name>_repo.py` extending BaseRepository
- [ ] `app/services/<name>_service.py` extending BaseCRUDService + module-level logger
- [ ] `app/schemas/<name>.py` — Base / Create / Update / Response (ConfigDict from_attributes)
- [ ] `app/api/v1/routes/<name>.py` — CRUD, no raise, le= on limit
- [ ] Register in `app/api/v1/router.py` with prefix and tags
- [ ] Add permission to `app/api/permissions.py` if new area needed
- [ ] Add guard to `app/api/route_guards.py` if new area
- [ ] `tests/repositories/test_<name>_repo.py`
- [ ] `tests/services/test_<name>_service.py`
- [ ] `tests/api/v1/routes/test_<name>.py`
- [ ] `alembic revision --autogenerate -m "add_<name>_table"`
