from fastapi import APIRouter, Depends, Form, Query, Request, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.route_guards import require_branch_manage
from app.models.user import User
from app.schemas.branch import BranchCreate, BranchResponse, BranchUpdate
from app.schemas.common import APIResponse, PaginatedData
from app.services.branch_service import BranchService

router = APIRouter()
service = BranchService()

@router.get("", response_model=APIResponse[PaginatedData[BranchResponse]])
def list_branches(
    restaurant_id: int | None = Query(None, description="Filter by restaurant (Super Admin only)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_branch_manage),
):
    total, items = service.list_branches_for_user(
        db, current_user, restaurant_id=restaurant_id, skip=skip, limit=limit
    )
    return APIResponse(data=PaginatedData(items=items, total=total, skip=skip, limit=limit))

from pydantic import ValidationError
from fastapi.exceptions import RequestValidationError

@router.post("", response_model=APIResponse[BranchResponse], status_code=status.HTTP_201_CREATED)
async def create_branch(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_branch_manage),
):
    try:
        content_type = request.headers.get("content-type", "")
        if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
            form = await request.form()
            data_dict = dict(form)
            data = BranchCreate(**data_dict)
        else:
            body = await request.json()
            data = BranchCreate(**body)
    except ValidationError as err:
        raise RequestValidationError(err.errors())

    branch = service.create_branch(db, data, user=current_user)
    return APIResponse(data=branch, message="Branch created successfully")

@router.get("/{item_id}", response_model=APIResponse[BranchResponse])
def get_branch(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_branch_manage),
):
    return APIResponse(data=service.get(db, item_id))

@router.put("/{item_id}", response_model=APIResponse[BranchResponse])
async def update_branch(
    item_id: int,
    request: Request,
    db: Session = Depends(get_db),
    _: User = Depends(require_branch_manage),
):
    try:
        content_type = request.headers.get("content-type", "")
        if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
            form = await request.form()
            data_dict = dict(form)
            data = BranchUpdate(**data_dict)
        else:
            body = await request.json()
            data = BranchUpdate(**body)
    except ValidationError as err:
        raise RequestValidationError(err.errors())

    return APIResponse(data=service.update(db, item_id, data), message="Branch updated successfully")


@router.delete("/{item_id}", response_model=APIResponse[None])
def delete_branch(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_branch_manage),
):
    service.delete(db, item_id)
    return APIResponse(data=None, message="Branch deleted successfully")
