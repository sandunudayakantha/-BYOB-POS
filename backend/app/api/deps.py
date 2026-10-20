from collections.abc import Generator
from typing import Annotated
from uuid import uuid4
from fastapi import Depends, Header, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.exceptions import AuthenticationException, AuthorizationException
from app.core.security import decode_token
from app.db.session import SessionLocal
from app.models.enums import UserRole, UserStatus
from app.models.user import User
from app.repositories.user_repo import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)
user_repo = UserRepository()

from app.db.session import SessionLocal, get_db

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    token: str | None = Depends(oauth2_scheme),
    auth_header: str | None = Header(default=None, alias="Authorization"),
) -> User:
    raw_token = token
    if not raw_token and auth_header and auth_header.startswith("Bearer "):
        raw_token = auth_header.split(" ")[1]

    if not raw_token:
        raise AuthenticationException("Not authenticated")

    payload = decode_token(raw_token)
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise AuthenticationException("Invalid authentication credentials")

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise AuthenticationException("Invalid user ID in token")

    user = user_repo.get(db, user_id)
    if not user:
        raise AuthenticationException("User not found")

    if user.status != UserStatus.ACTIVE.value:
        raise AuthorizationException("User account is suspended or inactive")

    # Invalidate session if audit info requested
    db.info["actor"] = {
        "user_id": user.id,
        "email": user.email,
        "request_id": str(uuid4()),
        "method": request.method,
        "path": request.url.path,
    }
    return user

def require_super_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.SUPER_ADMIN.value:
        raise AuthorizationException("Super Admin privileges required")
    return current_user

def require_restaurant_owner(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.RESTAURANT_OWNER.value]:
        raise AuthorizationException("Restaurant Owner privileges required")
    return current_user

def _check_user_permission(db: Session, user: User, permission_area: str) -> bool:
    if user.role == UserRole.SUPER_ADMIN.value:
        return True
    if user.role == UserRole.RESTAURANT_OWNER.value:
        # Restaurant owners have full access to tenant operations except system-level platform settings
        return permission_area != "system.settings"

    # For BRANCH_MANAGER and STAFF, check assigned permissions in DB
    from app.models.rbac import Permission, Role, RolePermission

    role_id = user.role_id
    if not role_id and user.role:
        role = db.query(Role).filter(Role.name == user.role, Role.is_deleted.is_(False)).first()
        if role:
            role_id = role.id

    if not role_id:
        return False

    perm_exists = (
        db.query(RolePermission)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .filter(
            RolePermission.role_id == role_id,
            Permission.area == permission_area,
            RolePermission.is_deleted.is_(False),
            Permission.is_deleted.is_(False),
        )
        .first()
    )
    return perm_exists is not None


def require_exact_permission(permission_area: str):
    def dependency(
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
    ) -> User:
        if not _check_user_permission(db, user, permission_area):
            raise AuthorizationException(f"Missing required permission: {permission_area}")
        return user
    return dependency


def require_any_permission(*permission_areas: str):
    def dependency(
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
    ) -> User:
        if not any(_check_user_permission(db, user, area) for area in permission_areas):
            raise AuthorizationException("Missing required permissions")
        return user
    return dependency
