from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.route_guards import require_qr_manage
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.qr import QRCodeCreate, QRCodeResponse, QRCodeUpdate
from app.services.qr_service import QRCodeService

router = APIRouter()
service = QRCodeService()

@router.get("", response_model=APIResponse[PaginatedData[QRCodeResponse]])
def list_qrs(
    branch_id: int | None = Query(None, alias="branchId"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_qr_manage),
):
    total, items = service.list_qrs_for_user(
        db, current_user, branch_id=branch_id, skip=skip, limit=limit
    )
    return APIResponse(data=PaginatedData(items=items, total=total, skip=skip, limit=limit))

@router.post("", response_model=APIResponse[QRCodeResponse], status_code=status.HTTP_201_CREATED)
def create_qr(
    data: QRCodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_qr_manage),
):
    created = service.create_qr(db, data, user=current_user)
    return APIResponse(data=created, message="QR code created successfully")

@router.get("/{item_id}", response_model=APIResponse[QRCodeResponse])
def get_qr(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_qr_manage),
):
    return APIResponse(data=service.get(db, item_id))

@router.put("/{item_id}", response_model=APIResponse[QRCodeResponse])
def update_qr(
    item_id: int,
    data: QRCodeUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_qr_manage),
):
    return APIResponse(data=service.update(db, item_id, data), message="QR code updated successfully")

@router.patch("/{item_id}/status", response_model=APIResponse[QRCodeResponse])
def update_qr_status(
    item_id: int,
    data: QRCodeUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_qr_manage),
):
    return APIResponse(data=service.update(db, item_id, data), message="QR code status updated")

@router.delete("/{item_id}", response_model=APIResponse[None])
def delete_qr(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_qr_manage),
):
    service.delete(db, item_id)
    return APIResponse(data=None, message="QR code deleted successfully")
