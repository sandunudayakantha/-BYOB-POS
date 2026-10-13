from __future__ import annotations
from app.models.product import Product
from app.repositories.base import BaseRepository

class ProductRepository(BaseRepository[Product]):
    def __init__(self) -> None:
        super().__init__(Product)

    def list_by_branch(self, db, branch_id: int, category_id: int | None = None) -> list[Product]:
        q = self._active_query(db).filter(Product.branch_id == branch_id)
        if category_id is not None:
            q = q.filter(Product.category_id == category_id)
        return q.all()
