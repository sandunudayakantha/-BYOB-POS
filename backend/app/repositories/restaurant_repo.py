from __future__ import annotations
from app.models.restaurant import Restaurant
from app.repositories.base import BaseRepository

class RestaurantRepository(BaseRepository[Restaurant]):
    def __init__(self) -> None:
        super().__init__(Restaurant)

    def get_by_owner_id(self, db, owner_id: int) -> Restaurant | None:
        return self._active_query(db).filter(Restaurant.owner_id == owner_id).first()

    def list_by_owner_id(self, db, owner_id: int) -> list[Restaurant]:
        return self._active_query(db).filter(Restaurant.owner_id == owner_id).all()
