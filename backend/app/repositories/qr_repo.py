from __future__ import annotations
from app.models.qr import QRCode
from app.repositories.base import BaseRepository

class QRCodeRepository(BaseRepository[QRCode]):
    def __init__(self) -> None:
        super().__init__(QRCode)

    def get_by_token(self, db, token: str) -> QRCode | None:
        return self._active_query(db).filter(QRCode.token == token).first()

    def list_by_branch(self, db, branch_id: int) -> list[QRCode]:
        return self._active_query(db).filter(QRCode.branch_id == branch_id).all()
