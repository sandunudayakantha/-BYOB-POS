import logging
from sqlalchemy.orm import Session
from app.core.exceptions import BadRequestException
from app.models.featured import FeaturedSection, FeaturedSectionProduct
from app.models.user import User
from app.repositories.featured_repo import FeaturedSectionProductRepository, FeaturedSectionRepository
from app.schemas.featured import FeaturedSectionCreate, FeaturedSectionUpdate
from app.services.base import BaseCRUDService
from app.services.tenant_resolver import resolve_tenant_restaurant_id

logger = logging.getLogger(__name__)

class FeaturedService(BaseCRUDService[FeaturedSection]):
    def __init__(self) -> None:
        super().__init__(FeaturedSectionRepository(), entity_name="FeaturedSection", resource_name="featured_section")
        self.assoc_repo = FeaturedSectionProductRepository()

    def list_featured_for_user(
        self,
        db: Session,
        user: User,
        branch_id: int | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[int, list[FeaturedSection]]:
        query = db.query(FeaturedSection).filter(FeaturedSection.is_deleted.is_(False))
        if branch_id:
            query = query.filter(FeaturedSection.branch_id == branch_id)
        else:
            restaurant_id = resolve_tenant_restaurant_id(db, user)
            if restaurant_id:
                query = query.filter(FeaturedSection.restaurant_id == restaurant_id)

        query = query.order_by(FeaturedSection.created_at.desc())
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return total, items

    def create_section(self, db: Session, data: FeaturedSectionCreate, user: User | None = None) -> FeaturedSection:
        restaurant_id = data.restaurant_id
        if not restaurant_id and user:
            restaurant_id = resolve_tenant_restaurant_id(db, user, branch_id=data.branch_id)
        if not restaurant_id:
            raise BadRequestException("Could not resolve restaurant_id for this featured section")

        product_ids = data.product_ids
        dump = data.model_dump(exclude={"product_ids"})
        dump["restaurant_id"] = restaurant_id
        section = self.repo.create(db, dump)
        unique_pids = list(dict.fromkeys(product_ids))
        for pid in unique_pids:
            self.assoc_repo.create(
                db,
                {"featured_section_id": section.id, "product_id": pid}
            )
        db.refresh(section)
        return section

    def update_section(self, db: Session, section_id: int, data: FeaturedSectionUpdate) -> FeaturedSection:
        section = self.get(db, section_id)
        update_dump = data.model_dump(exclude={"product_ids"}, exclude_unset=True)
        if update_dump:
            section = self.repo.update(db, section, update_dump)

        if data.product_ids is not None:
            # Delete existing association records for this section
            db.query(FeaturedSectionProduct).filter(
                FeaturedSectionProduct.featured_section_id == section.id
            ).delete(synchronize_session=False)

            # Insert deduplicated new associations
            unique_pids = list(dict.fromkeys(data.product_ids))
            for pid in unique_pids:
                assoc = FeaturedSectionProduct(featured_section_id=section.id, product_id=pid)
                db.add(assoc)
            db.commit()

        db.refresh(section)
        return section


