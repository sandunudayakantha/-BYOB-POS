from sqlalchemy.orm import Session
from app.models.branch import Branch
from app.models.enums import UserRole
from app.models.restaurant import Restaurant
from app.models.user import User

def resolve_tenant_restaurant_id(
    db: Session,
    user: User,
    explicit_restaurant_id: int | None = None,
    branch_id: int | None = None,
) -> int | None:
    """
    Universally resolves the tenant restaurant ID for any authenticated user.
    1. Super Admin with explicit param -> use that param.
    2. Branch ID provided -> resolve from the branch's restaurant_id.
    3. User has restaurant_id assigned -> use user.restaurant_id.
    4. User owns a restaurant -> use owned restaurant.id.
    """
    if user.role == UserRole.SUPER_ADMIN.value and explicit_restaurant_id:
        return explicit_restaurant_id

    if branch_id:
        branch = db.query(Branch).filter(Branch.id == branch_id, Branch.is_deleted.is_(False)).first()
        if branch:
            return branch.restaurant_id

    if user.restaurant_id:
        return user.restaurant_id

    owned_rest = (
        db.query(Restaurant)
        .filter(Restaurant.owner_id == user.id, Restaurant.is_deleted.is_(False))
        .first()
    )
    if owned_rest:
        return owned_rest.id

    return explicit_restaurant_id
