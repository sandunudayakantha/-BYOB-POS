from app.models.inventory import InventoryItem
from app.repositories.base import BaseRepository

class InventoryItemRepository(BaseRepository[InventoryItem]):
    def __init__(self) -> None:
        super().__init__(InventoryItem)
