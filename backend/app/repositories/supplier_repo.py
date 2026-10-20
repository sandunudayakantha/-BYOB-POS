from app.models.inventory import Supplier
from app.repositories.base import BaseRepository

class SupplierRepository(BaseRepository[Supplier]):
    def __init__(self) -> None:
        super().__init__(Supplier)
