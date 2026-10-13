import logging
from sqlalchemy.orm import Session
from app.core.exceptions import BadRequestException
from app.models.branch import Branch
from app.models.enums import UserRole
from app.models.restaurant import Restaurant
from app.models.user import User
from app.repositories.branch_repo import BranchRepository
from app.repositories.restaurant_repo import RestaurantRepository
from app.schemas.branch import BranchCreate
from app.services.base import BaseCRUDService

logger = logging.getLogger(__name__)

class BranchService(BaseCRUDService[Branch]):
    def __init__(self) -> None:
        super().__init__(BranchRepository(), entity_name="Branch", resource_name="branch")
        self.branch_repo = self.repo
        self.restaurant_repo = RestaurantRepository()

    def get_restaurant_id_for_user(self, db: Session, user: User, explicit_restaurant_id: int | None = None) -> int | None:
        if user.role == UserRole.SUPER_ADMIN.value:
            return explicit_restaurant_id

        # If user has restaurant_id set directly (e.g. staff or owner linked to tenant)
        if user.restaurant_id:
            return user.restaurant_id

        # Or query restaurant where user is the owner
        owned_rest = (
            db.query(Restaurant)
            .filter(Restaurant.owner_id == user.id, Restaurant.is_deleted.is_(False))
            .first()
        )
        if owned_rest:
            return owned_rest.id

        return None

    def list_branches_for_user(
        self,
        db: Session,
        user: User,
        restaurant_id: int | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, list[Branch]]:
        if user.role == UserRole.SUPER_ADMIN.value and not restaurant_id:
            # Super admin without specific restaurant filter sees all branches
            return self.list(db, skip=skip, limit=limit)

        target_restaurant_id = self.get_restaurant_id_for_user(db, user, restaurant_id)
        if not target_restaurant_id:
            # User doesn't belong to or own any restaurant -> return empty list
            return 0, []

        query = (
            db.query(Branch)
            .filter(Branch.restaurant_id == target_restaurant_id, Branch.is_deleted.is_(False))
            .order_by(Branch.created_at.desc())
        )
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return total, items

    def create_branch(self, db: Session, data: BranchCreate, user: User | None = None) -> Branch:
        restaurant_id = data.restaurant_id
        if user and user.role != UserRole.SUPER_ADMIN.value:
            user_rest_id = self.get_restaurant_id_for_user(db, user)
            if user_rest_id:
                restaurant_id = user_rest_id

        rest = self.restaurant_repo.get(db, restaurant_id)
        if not rest:
            raise BadRequestException("Invalid restaurant_id")

        current_branches = self.branch_repo.count_by_restaurant(db, restaurant_id)
        if current_branches >= rest.max_branches:
            raise BadRequestException(f"Branch limit of {rest.max_branches} reached for this restaurant")

        return self.create(db, data, restaurant_id=restaurant_id)
