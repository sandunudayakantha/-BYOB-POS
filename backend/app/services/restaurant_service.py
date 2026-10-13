import logging
from sqlalchemy.orm import Session
from app.core.exceptions import AppException, AuthorizationException, NotFoundException
from app.models.restaurant import Restaurant
from app.models.user import User
from app.repositories.restaurant_repo import RestaurantRepository
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate
from app.services.base import BaseCRUDService

logger = logging.getLogger(__name__)

class RestaurantService(BaseCRUDService[Restaurant]):
    def __init__(self) -> None:
        super().__init__(RestaurantRepository(), entity_name="Restaurant", resource_name="restaurant")
        self.restaurant_repo = self.repo

    def create_for_owner(self, db: Session, data: RestaurantCreate, owner: User) -> Restaurant:
        return self.create(db, data, owner_id=owner.id)

    def list_for_user(self, db: Session, user: User, skip: int = 0, limit: int = 20) -> tuple[int, list[Restaurant]]:
        if user.role == "SUPER_ADMIN":
            return self.list(db, skip=skip, limit=limit)
        items = self.restaurant_repo.list_by_owner_id(db, user.id)
        return len(items), items[skip : skip + limit]
