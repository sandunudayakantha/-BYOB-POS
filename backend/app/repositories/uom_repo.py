from app.models.inventory import UnitOfMeasure
from app.repositories.base import BaseRepository

class UnitOfMeasureRepository(BaseRepository[UnitOfMeasure]):
    def __init__(self) -> None:
        super().__init__(UnitOfMeasure)
