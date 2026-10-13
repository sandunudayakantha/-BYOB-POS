import logging
from sqlalchemy.orm import Session
from app.core.exceptions import BadRequestException
from app.models.product import Product
from app.models.user import User
from app.repositories.product_repo import ProductRepository
from app.schemas.product import ProductCreate
from app.services.base import BaseCRUDService
from app.services.tenant_resolver import resolve_tenant_restaurant_id

logger = logging.getLogger(__name__)

class ProductService(BaseCRUDService[Product]):
    def __init__(self) -> None:
        super().__init__(ProductRepository(), entity_name="Product", resource_name="product")

    def list_products_for_user(
        self,
        db: Session,
        user: User,
        branch_id: int | None = None,
        category_id: int | None = None,
        search: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, list[Product]]:
        query = db.query(Product).filter(Product.is_deleted.is_(False))
        if branch_id:
            query = query.filter(Product.branch_id == branch_id)
        else:
            restaurant_id = resolve_tenant_restaurant_id(db, user)
            if restaurant_id:
                query = query.filter(Product.restaurant_id == restaurant_id)

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if search:
            query = query.filter(Product.name.ilike(f"%{search.strip()}%"))

        query = query.order_by(Product.created_at.desc())
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return total, items

    def create_product(self, db: Session, data: ProductCreate, user: User) -> Product:
        restaurant_id = data.restaurant_id or resolve_tenant_restaurant_id(
            db, user, branch_id=data.branch_id
        )
        if not restaurant_id:
            raise BadRequestException("Could not resolve restaurant_id for this product")
        return self.create(db, data, restaurant_id=restaurant_id)
