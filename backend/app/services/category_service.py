import logging
from sqlalchemy.orm import Session
from app.core.exceptions import BadRequestException
from app.models.category import Category
from app.models.user import User
from app.repositories.category_repo import CategoryRepository
from app.schemas.category import CategoryCreate
from app.services.base import BaseCRUDService
from app.services.tenant_resolver import resolve_tenant_restaurant_id

logger = logging.getLogger(__name__)

class CategoryService(BaseCRUDService[Category]):
    def __init__(self) -> None:
        super().__init__(CategoryRepository(), entity_name="Category", resource_name="category")

    def list_categories_for_user(
        self,
        db: Session,
        user: User,
        branch_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[int, list[Category]]:
        query = db.query(Category).filter(Category.is_deleted.is_(False))
        if branch_id:
            query = query.filter(Category.branch_id == branch_id)
        else:
            restaurant_id = resolve_tenant_restaurant_id(db, user)
            if restaurant_id:
                query = query.filter(Category.restaurant_id == restaurant_id)

        query = query.order_by(Category.sort_order.asc(), Category.created_at.desc())
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return total, items

    def create_category(self, db: Session, data: CategoryCreate, user: User) -> Category:
        restaurant_id = data.restaurant_id or resolve_tenant_restaurant_id(
            db, user, branch_id=data.branch_id
        )
        if not restaurant_id:
            raise BadRequestException("Could not resolve restaurant_id for this category")
        return self.create(db, data, restaurant_id=restaurant_id)
