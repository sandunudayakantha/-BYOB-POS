from __future__ import annotations
from app.models.featured import FeaturedSection, FeaturedSectionProduct
from app.repositories.base import BaseRepository

class FeaturedSectionRepository(BaseRepository[FeaturedSection]):
    def __init__(self) -> None:
        super().__init__(FeaturedSection)

    def list_by_branch(self, db, branch_id: int) -> list[FeaturedSection]:
        return self._active_query(db).filter(FeaturedSection.branch_id == branch_id).all()

class FeaturedSectionProductRepository(BaseRepository[FeaturedSectionProduct]):
    def __init__(self) -> None:
        super().__init__(FeaturedSectionProduct)

    def list_by_section(self, db, section_id: int) -> list[FeaturedSectionProduct]:
        return self._active_query(db).filter(
            FeaturedSectionProduct.featured_section_id == section_id
        ).all()

    def delete_by_section(self, db, section_id: int) -> None:
        items = self.list_by_section(db, section_id)
        for item in items:
            self.delete(db, item)
