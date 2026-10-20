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

    def get_for_user(self, db: Session, item_id: int, user: User) -> Restaurant:
        restaurant = self.get(db, item_id)
        if user.role != "SUPER_ADMIN" and restaurant.owner_id != user.id and user.restaurant_id != restaurant.id:
            raise AuthorizationException("Not authorized to access this restaurant")
        return restaurant

    def update_for_user(self, db: Session, item_id: int, data: RestaurantUpdate, user: User) -> Restaurant:
        self.get_for_user(db, item_id, user)
        return self.update(db, item_id, data)

    def delete_for_user(self, db: Session, item_id: int, user: User) -> None:
        if user.role != "SUPER_ADMIN":
            restaurant = self.get_for_user(db, item_id, user)
            if restaurant.owner_id != user.id:
                raise AuthorizationException("Only the owner or super admin can delete this restaurant")
        self.delete(db, item_id)

    def list_for_user(self, db: Session, user: User, skip: int = 0, limit: int = 20) -> tuple[int, list[Restaurant]]:
        if user.role == "SUPER_ADMIN":
            return self.list(db, skip=skip, limit=limit)
        items = self.restaurant_repo.list_by_owner_id(db, user.id)
        return len(items), items[skip : skip + limit]
