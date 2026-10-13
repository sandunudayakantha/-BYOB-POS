from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.route_guards import require_category_manage
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.common import APIResponse, PaginatedData
from app.services.category_service import CategoryService

router = APIRouter()
service = CategoryService()

@router.get("", response_model=APIResponse[PaginatedData[CategoryResponse]])
def list_categories(
    branch_id: int | None = Query(None, alias="branchId"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_category_manage),
):
    total, items = service.list_categories_for_user(
        db, current_user, branch_id=branch_id, skip=skip, limit=limit
    )
    return APIResponse(data=PaginatedData(items=items, total=total, skip=skip, limit=limit))

@router.post("", response_model=APIResponse[CategoryResponse], status_code=status.HTTP_201_CREATED)
async def create_category(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_category_manage),
):
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        data = CategoryCreate(**dict(form))
    else:
        body = await request.json()
        data = CategoryCreate(**body)

    created = service.create_category(db, data, user=current_user)
    return APIResponse(data=created, message="Category created successfully")

@router.get("/{item_id}", response_model=APIResponse[CategoryResponse])
def get_category(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_category_manage),
):
    return APIResponse(data=service.get(db, item_id))

@router.put("/{item_id}", response_model=APIResponse[CategoryResponse])
async def update_category(
    item_id: int,
    request: Request,
    db: Session = Depends(get_db),
    _: User = Depends(require_category_manage),
):
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        data = CategoryUpdate(**dict(form))
    else:
        body = await request.json()
        data = CategoryUpdate(**body)

    return APIResponse(data=service.update(db, item_id, data), message="Category updated successfully")

@router.delete("/{item_id}", response_model=APIResponse[None])
def delete_category(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_category_manage),
):
    service.delete(db, item_id)
    return APIResponse(data=None, message="Category deleted successfully")
