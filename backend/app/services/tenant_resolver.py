from sqlalchemy.orm import Session
from app.core.exceptions import AuthorizationException, NotFoundException
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
    1. Super Admin with explicit param -> use that param; if branch_id provided -> use branch's restaurant_id.
    2. Non-super admin -> resolves strictly from user.restaurant_id or owned restaurant.
       If branch_id is also provided, verifies the branch belongs to the user's restaurant.
    """
    if user.role == UserRole.SUPER_ADMIN.value:
        if explicit_restaurant_id:
            return explicit_restaurant_id
        if branch_id:
            branch = db.query(Branch).filter(Branch.id == branch_id, Branch.is_deleted.is_(False)).first()
            if branch:
                return branch.restaurant_id
        return None

    # Resolve tenant for non-super-admin
    rest_id = user.restaurant_id
    if not rest_id:
        owned_rest = (
            db.query(Restaurant)
            .filter(Restaurant.owner_id == user.id, Restaurant.is_deleted.is_(False))
            .first()
        )
        if owned_rest:
            rest_id = owned_rest.id

    if branch_id and rest_id:
        branch = db.query(Branch).filter(Branch.id == branch_id, Branch.is_deleted.is_(False)).first()
        if not branch or branch.restaurant_id != rest_id:
            raise AuthorizationException("Branch does not belong to your restaurant")

    return rest_id


def verify_branch_access(db: Session, user: User, branch_id: int) -> Branch:
    """
    Verifies that the current user has authorization to access the specified branch.
    Super Admins can access any branch.
    Other users can only access branches belonging to their restaurant.
    """
    branch = db.query(Branch).filter(Branch.id == branch_id, Branch.is_deleted.is_(False)).first()
    if not branch:
        raise NotFoundException("Branch not found")

    if user.role == UserRole.SUPER_ADMIN.value:
        return branch

    user_rest_id = resolve_tenant_restaurant_id(db, user)
    if not user_rest_id or branch.restaurant_id != user_rest_id:
        raise AuthorizationException("You do not have access to this branch")

    return branch
