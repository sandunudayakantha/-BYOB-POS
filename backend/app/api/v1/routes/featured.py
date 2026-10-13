from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.route_guards import require_featured_manage
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.featured import (
    FeaturedSectionCreate,
    FeaturedSectionResponse,
    FeaturedSectionUpdate,
)
from app.services.featured_service import FeaturedService

router = APIRouter()
service = FeaturedService()

@router.get("", response_model=APIResponse[PaginatedData[FeaturedSectionResponse]])
def list_featured(
    branch_id: int | None = Query(None, alias="branchId"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_featured_manage),
):
    total, items = service.list_featured_for_user(
        db, current_user, branch_id=branch_id, skip=skip, limit=limit
    )
    return APIResponse(data=PaginatedData(items=items, total=total, skip=skip, limit=limit))

@router.post("", response_model=APIResponse[FeaturedSectionResponse], status_code=status.HTTP_201_CREATED)
def create_featured(
    data: FeaturedSectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_featured_manage),
):
    created = service.create_section(db, data, user=current_user)
    return APIResponse(data=created, message="Featured section created successfully")

@router.get("/{item_id}", response_model=APIResponse[FeaturedSectionResponse])
def get_featured(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_featured_manage),
):
    return APIResponse(data=service.get(db, item_id))

@router.put("/{item_id}", response_model=APIResponse[FeaturedSectionResponse])
def update_featured(
    item_id: int,
    data: FeaturedSectionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_featured_manage),
):
    return APIResponse(data=service.update_section(db, item_id, data), message="Featured section updated successfully")


@router.delete("/{item_id}", response_model=APIResponse[None])
def delete_featured(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_featured_manage),
):
    service.delete(db, item_id)
    return APIResponse(data=None, message="Featured section deleted successfully")
