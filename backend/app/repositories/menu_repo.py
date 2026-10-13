from __future__ import annotations
from app.models.menu import Menu, MenuItem
from app.repositories.base import BaseRepository

class MenuRepository(BaseRepository[Menu]):
    def __init__(self) -> None:
        super().__init__(Menu)

    def list_by_branch(self, db, branch_id: int) -> list[Menu]:
        return self._active_query(db).filter(Menu.branch_id == branch_id).all()

    def get_base_menu(self, db, branch_id: int) -> Menu | None:
        return self._active_query(db).filter(
            Menu.branch_id == branch_id, Menu.is_base_menu.is_(True)
        ).first()

class MenuItemRepository(BaseRepository[MenuItem]):
    def __init__(self) -> None:
        super().__init__(MenuItem)

    def list_by_menu(self, db, menu_id: int) -> list[MenuItem]:
        return (
            self._active_query(db)
            .filter(MenuItem.menu_id == menu_id)
            .order_by(MenuItem.sort_order.asc())
            .all()
        )

    def get_by_menu_and_product(self, db, menu_id: int, product_id: int) -> MenuItem | None:
        return (
            self._active_query(db)
            .filter(MenuItem.menu_id == menu_id, MenuItem.product_id == product_id)
            .first()
        )
