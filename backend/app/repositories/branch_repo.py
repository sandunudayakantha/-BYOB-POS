from __future__ import annotations
from app.models.branch import Branch
from app.repositories.base import BaseRepository

class BranchRepository(BaseRepository[Branch]):
    def __init__(self) -> None:
        super().__init__(Branch)

    def list_by_restaurant(self, db, restaurant_id: int) -> list[Branch]:
        return self._active_query(db).filter(Branch.restaurant_id == restaurant_id).all()

    def count_by_restaurant(self, db, restaurant_id: int) -> int:
        return self._active_query(db).filter(Branch.restaurant_id == restaurant_id).count()

    def get_main_branch(self, db, restaurant_id: int) -> Branch | None:
        return self._active_query(db).filter(
            Branch.restaurant_id == restaurant_id, Branch.is_main.is_(True)
        ).first()
