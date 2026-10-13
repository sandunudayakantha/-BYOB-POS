import logging
from sqlalchemy.orm import Session
from app.models.rbac import Permission, Role, RolePermission
from app.repositories.base import BaseRepository

logger = logging.getLogger(__name__)

DEFAULT_ROLES = ["SUPER_ADMIN", "RESTAURANT_OWNER", "BRANCH_MANAGER", "STAFF"]

def sync_rbac_seed(db: Session) -> None:
    role_repo = BaseRepository(Role)
    perm_repo = BaseRepository(Permission)
    try:
        for r_name in DEFAULT_ROLES:
            existing = db.query(Role).filter(Role.name == r_name).first()
            if not existing:
                role_repo.create(db, {"name": r_name, "description": f"{r_name} role"})
        logger.info("rbac_seed_completed")
    except Exception as e:
        db.rollback()
        logger.warning(f"rbac_seed_skipped_or_failed: {e}")
