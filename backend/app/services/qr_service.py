import logging
from secrets import token_urlsafe
from sqlalchemy.orm import Session, joinedload
from app.core.exceptions import BadRequestException
from app.models.qr import QRCode
from app.models.user import User
from app.repositories.qr_repo import QRCodeRepository
from app.schemas.qr import QRCodeCreate
from app.services.base import BaseCRUDService
from app.services.tenant_resolver import resolve_tenant_restaurant_id

logger = logging.getLogger(__name__)

class QRCodeService(BaseCRUDService[QRCode]):
    def __init__(self) -> None:
        super().__init__(QRCodeRepository(), entity_name="QRCode", resource_name="qr_code")

    def list_qrs_for_user(
        self,
        db: Session,
        user: User,
        branch_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[int, list[QRCode]]:
        query = db.query(QRCode).options(joinedload(QRCode.menu)).filter(QRCode.is_deleted.is_(False))
        if branch_id:
            query = query.filter(QRCode.branch_id == branch_id)
        else:
            restaurant_id = resolve_tenant_restaurant_id(db, user)
            if restaurant_id:
                query = query.filter(QRCode.restaurant_id == restaurant_id)

        query = query.order_by(QRCode.created_at.desc())
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return total, items

    def create_qr(self, db: Session, data: QRCodeCreate, user: User | None = None) -> QRCode:
        restaurant_id = data.restaurant_id
        if not restaurant_id and user:
            restaurant_id = resolve_tenant_restaurant_id(db, user, branch_id=data.branch_id)
        if not restaurant_id:
            raise BadRequestException("Could not resolve restaurant_id for this QR code")

        random_token = token_urlsafe(16)
        return self.create(db, data, token=random_token, restaurant_id=restaurant_id)
