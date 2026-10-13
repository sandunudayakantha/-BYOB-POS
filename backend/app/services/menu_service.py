from decimal import Decimal
import logging
from sqlalchemy.orm import Session
from app.core.exceptions import BadRequestException
from app.models.menu import Menu, MenuItem
from app.models.user import User
from app.repositories.menu_repo import MenuItemRepository, MenuRepository
from app.schemas.menu import MenuCreate
from app.services.base import BaseCRUDService
from app.services.tenant_resolver import resolve_tenant_restaurant_id

logger = logging.getLogger(__name__)

class MenuService(BaseCRUDService[Menu]):
    def __init__(self) -> None:
        super().__init__(MenuRepository(), entity_name="Menu", resource_name="menu")

    def list_menus_for_user(
        self,
        db: Session,
        user: User,
        branch_id: int | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[int, list[Menu]]:
        query = db.query(Menu).filter(Menu.is_deleted.is_(False))
        if branch_id:
            query = query.filter(Menu.branch_id == branch_id)
        else:
            restaurant_id = resolve_tenant_restaurant_id(db, user)
            if restaurant_id:
                query = query.filter(Menu.restaurant_id == restaurant_id)

        query = query.order_by(Menu.created_at.asc(), Menu.id.asc())
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return total, items

    def create_menu(self, db: Session, data: MenuCreate, user: User) -> Menu:
        restaurant_id = data.restaurant_id or resolve_tenant_restaurant_id(
            db, user, branch_id=data.branch_id
        )
        if not restaurant_id:
            raise BadRequestException("Could not resolve restaurant_id for this menu")
        
        # When creating a new menu, it can ONLY be marked as base menu if it is the very first menu in the branch
        existing_count = db.query(Menu).filter(
            Menu.restaurant_id == restaurant_id,
            Menu.branch_id == data.branch_id,
            Menu.is_deleted.is_(False)
        ).count()
        
        if existing_count == 0:
            data.is_base_menu = True
        else:
            # Cannot mark new menu as base menu if menus already exist
            data.is_base_menu = False

        return self.create(db, data, restaurant_id=restaurant_id)

    def set_base_menu(self, db: Session, menu_id: int, user: User) -> Menu:
        menu = self.get(db, menu_id)
        # Unset base for ALL other menus in the same branch
        db.query(Menu).filter(
            Menu.restaurant_id == menu.restaurant_id,
            Menu.branch_id == menu.branch_id,
            Menu.id != menu.id,
            Menu.is_deleted.is_(False)
        ).update({"is_base_menu": False}, synchronize_session="fetch")

        menu.is_base_menu = True
        db.commit()
        db.refresh(menu)
        return menu


    def adjust_menu_prices(
        self,
        db: Session,
        menu_id: int,
        percentage: float,
        source_mode: str,
        user: User,
    ) -> dict:
        target_menu = self.get(db, menu_id)
        percent_num = float(percentage)

        base_menu_map: dict[int, Decimal] = {}
        if source_mode == "BASE_MENU":
            base_menu = (
                db.query(Menu)
                .filter(
                    Menu.restaurant_id == target_menu.restaurant_id,
                    Menu.branch_id == target_menu.branch_id,
                    Menu.is_base_menu.is_(True),
                    Menu.is_deleted.is_(False),
                )
                .first()
            )
            if base_menu:
                base_items = (
                    db.query(MenuItem)
                    .filter(MenuItem.menu_id == base_menu.id, MenuItem.is_deleted.is_(False))
                    .all()
                )
                for item in base_items:
                    base_menu_map[item.product_id] = item.price

        target_items = (
            db.query(MenuItem)
            .filter(MenuItem.menu_id == target_menu.id, MenuItem.is_deleted.is_(False))
            .all()
        )
        updated_count = 0

        for item in target_items:
            base_price = item.price
            if source_mode == "BASE_MENU" and item.product_id in base_menu_map:
                base_price = base_menu_map[item.product_id]

            new_price = round(float(base_price) * (1 + percent_num / 100), 2)
            item.price = Decimal(str(max(0.0, new_price)))
            updated_count += 1

        db.commit()
        return {
            "menuId": target_menu.id,
            "menuName": target_menu.name,
            "updatedCount": updated_count,
            "percentage": percent_num,
            "sourceMode": source_mode,
        }

    def fill_missing_menu_items(
        self,
        db: Session,
        menu_id: int,
        percentage: float,
        overwrite_existing: bool,
        user: User,
    ) -> dict:
        from app.models.product import Product

        target_menu = self.get(db, menu_id)
        percent_num = float(percentage)

        base_menu = (
            db.query(Menu)
            .filter(
                Menu.restaurant_id == target_menu.restaurant_id,
                Menu.branch_id == target_menu.branch_id,
                Menu.is_base_menu.is_(True),
                Menu.is_deleted.is_(False),
            )
            .first()
        )

        source_products: list[tuple[int, float]] = []
        if base_menu and base_menu.id != target_menu.id:
            base_items = (
                db.query(MenuItem)
                .filter(MenuItem.menu_id == base_menu.id, MenuItem.is_deleted.is_(False))
                .all()
            )
            source_products = [(item.product_id, float(item.price)) for item in base_items]
        else:
            catalog_prods = (
                db.query(Product)
                .filter(
                    Product.restaurant_id == target_menu.restaurant_id,
                    Product.branch_id == target_menu.branch_id,
                    Product.is_deleted.is_(False),
                )
                .all()
            )
            source_products = [(p.id, 0.0) for p in catalog_prods]

        existing_items = (
            db.query(MenuItem)
            .filter(MenuItem.menu_id == target_menu.id, MenuItem.is_deleted.is_(False))
            .all()
        )
        existing_map = {item.product_id: item for item in existing_items}

        added_count = 0
        updated_count = 0

        for prod_id, base_price in source_products:
            new_price = round(base_price * (1 + percent_num / 100), 2)
            decimal_price = Decimal(str(max(0.0, new_price)))

            if prod_id in existing_map:
                if overwrite_existing:
                    existing_map[prod_id].price = decimal_price
                    updated_count += 1
            else:
                new_item = MenuItem(
                    menu_id=target_menu.id,
                    product_id=prod_id,
                    price=decimal_price,
                    available=True,
                )
                db.add(new_item)
                added_count += 1

        db.commit()
        return {
            "menuId": target_menu.id,
            "menuName": target_menu.name,
            "addedCount": added_count,
            "updatedCount": updated_count,
            "percentage": percent_num,
        }

    def get_price_matrix(
        self,
        db: Session,
        user: User,
        branch_id: int,
        page: int = 1,
        limit: int = 10,
        search: str | None = None,
        category_id: str | None = None,
    ) -> dict:
        from app.models.category import Category
        from app.models.product import Product
        from app.schemas.category import CategoryResponse
        from app.schemas.menu import MenuResponse
        from app.schemas.product import ProductResponse

        restaurant_id = resolve_tenant_restaurant_id(db, user, branch_id=branch_id)
        if not restaurant_id:
            raise BadRequestException("Could not resolve restaurant for branch")

        # 1. Menus for this branch
        menus_query = (
            db.query(Menu)
            .filter(
                Menu.branch_id == branch_id,
                Menu.restaurant_id == restaurant_id,
                Menu.is_deleted.is_(False),
            )
            .order_by(Menu.created_at.asc(), Menu.id.asc())
        )
        menus = menus_query.all()

        # 2. Categories for this branch
        categories_query = (
            db.query(Category)
            .filter(
                Category.branch_id == branch_id,
                Category.restaurant_id == restaurant_id,
                Category.is_deleted.is_(False),
            )
            .order_by(Category.sort_order.asc(), Category.name.asc())
        )
        categories = categories_query.all()

        # 3. Products query for this branch
        prod_query = db.query(Product).filter(
            Product.branch_id == branch_id,
            Product.restaurant_id == restaurant_id,
            Product.is_deleted.is_(False),
        )

        if category_id and category_id not in ("ALL", "", "null", "undefined"):
            try:
                cat_id_int = int(category_id)
                prod_query = prod_query.filter(Product.category_id == cat_id_int)
            except ValueError:
                pass

        if search and search.strip():
            prod_query = prod_query.filter(Product.name.ilike(f"%{search.strip()}%"))

        total_products = prod_query.count()
        page_num = max(1, page)
        limit_num = max(1, min(100, limit))
        skip_num = (page_num - 1) * limit_num

        products = (
            prod_query.order_by(Product.name.asc())
            .offset(skip_num)
            .limit(limit_num)
            .all()
        )

        menu_ids = [m.id for m in menus]
        product_ids = [p.id for p in products]

        # 4. Menu Items for the current page products
        matrix: dict[str, dict[str, dict]] = {}
        if menu_ids and product_ids:
            items = (
                db.query(MenuItem)
                .filter(
                    MenuItem.menu_id.in_(menu_ids),
                    MenuItem.product_id.in_(product_ids),
                    MenuItem.is_deleted.is_(False),
                )
                .all()
            )
            for item in items:
                p_id_str = str(item.product_id)
                m_id_str = str(item.menu_id)
                if p_id_str not in matrix:
                    matrix[p_id_str] = {}
                matrix[p_id_str][m_id_str] = {
                    "menuItemId": item.id,
                    "price": float(item.price),
                    "available": item.available,
                }

        menus_data = [MenuResponse.model_validate(m).model_dump() for m in menus]
        products_data = [ProductResponse.model_validate(p).model_dump() for p in products]
        categories_data = [CategoryResponse.model_validate(c).model_dump() for c in categories]

        total_pages = (total_products + limit_num - 1) // limit_num if total_products > 0 else 1

        return {
            "data": {
                "menus": menus_data,
                "products": products_data,
                "categories": categories_data,
                "matrix": matrix,
            },
            "meta": {
                "total": total_products,
                "page": page_num,
                "limit": limit_num,
                "totalPages": total_pages,
            },
        }


class MenuItemService(BaseCRUDService[MenuItem]):
    def __init__(self) -> None:
        super().__init__(MenuItemRepository(), entity_name="MenuItem", resource_name="menu_item")
