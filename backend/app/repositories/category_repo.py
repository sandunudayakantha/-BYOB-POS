from __future__ import annotations
from app.models.category import Category
from app.repositories.base import BaseRepository

class CategoryRepository(BaseRepository[Category]):
    def __init__(self) -> None:
        super().__init__(Category)

    def list_by_branch(self, db, branch_id: int) -> list[Category]:
        return (
            self._active_query(db)
            .filter(Category.branch_id == branch_id)
            .order_by(Category.sort_order.asc(), Category.name.asc())
            .all()
        )
