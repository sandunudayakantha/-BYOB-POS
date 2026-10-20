import logging
from sqlalchemy.orm import Session
from app.api.permissions import (
    ALL_PERMISSION_AREAS,
    BRANCH_MANAGE,
    CATEGORY_MANAGE,
    DASHBOARD_VIEW,
    FEATURED_MANAGE,
    INVENTORY_MANAGE,
    MENU_MANAGE,
    PRODUCT_MANAGE,
    QR_MANAGE,
    RESTAURANT_MANAGE,
    SYSTEM_SETTINGS,
    USERS_MANAGE,
)
from app.models.rbac import Permission, Role, RolePermission
from app.repositories.base import BaseRepository

logger = logging.getLogger(__name__)

DEFAULT_ROLE_PERMISSIONS: dict[str, list[str]] = {
    "SUPER_ADMIN": list(ALL_PERMISSION_AREAS),
    "RESTAURANT_OWNER": [
        DASHBOARD_VIEW,
        INVENTORY_MANAGE,
        RESTAURANT_MANAGE,
        BRANCH_MANAGE,
        MENU_MANAGE,
        PRODUCT_MANAGE,
        CATEGORY_MANAGE,
        QR_MANAGE,
        FEATURED_MANAGE,
        USERS_MANAGE,
    ],
    "BRANCH_MANAGER": [
        DASHBOARD_VIEW,
        INVENTORY_MANAGE,
        BRANCH_MANAGE,
        MENU_MANAGE,
        PRODUCT_MANAGE,
        CATEGORY_MANAGE,
        QR_MANAGE,
        FEATURED_MANAGE,
    ],
    "STAFF": [
        DASHBOARD_VIEW,
        INVENTORY_MANAGE,
    ],
}


def sync_rbac_seed(db: Session) -> None:
    role_repo = BaseRepository(Role)
    perm_repo = BaseRepository(Permission)
    try:
        # 1. Seed all permissions
        perm_map: dict[str, Permission] = {}
        for area in sorted(ALL_PERMISSION_AREAS):
            perm = db.query(Permission).filter(Permission.area == area).first()
            if not perm:
                human_name = area.replace(".", " ").title()
                perm = perm_repo.create(
                    db,
                    {
                        "area": area,
                        "name": human_name,
                        "description": f"Permission for {human_name}",
                    },
                )
            perm_map[area] = perm

        # 2. Seed roles and role_permissions
        for r_name, perm_areas in DEFAULT_ROLE_PERMISSIONS.items():
            role = db.query(Role).filter(Role.name == r_name).first()
            if not role:
                role = role_repo.create(db, {"name": r_name, "description": f"{r_name} role"})

            # Assign default role permissions if not yet present
            for area in perm_areas:
                target_perm = perm_map.get(area)
                if not target_perm:
                    continue
                existing_link = (
                    db.query(RolePermission)
                    .filter(
                        RolePermission.role_id == role.id,
                        RolePermission.permission_id == target_perm.id,
                        RolePermission.is_deleted.is_(False),
                    )
                    .first()
                )
                if not existing_link:
                    link = RolePermission(
                        role_id=role.id,
                        permission_id=target_perm.id,
                    )
                    db.add(link)

        db.commit()
        logger.info("rbac_seed_completed")
    except Exception as e:
        db.rollback()
        logger.warning(f"rbac_seed_skipped_or_failed: {e}")
