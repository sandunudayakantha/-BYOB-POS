from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.route_guards import require_product_manage
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter()
service = ProductService()

@router.get("", response_model=APIResponse[PaginatedData[ProductResponse]])
def list_products(
    branch_id: int | None = Query(None, alias="branchId"),
    category_id: int | None = Query(None, alias="categoryId"),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_product_manage),
):
    skip = (page - 1) * limit
    total, items = service.list_products_for_user(
        db,
        current_user,
        branch_id=branch_id,
        category_id=category_id,
        search=search,
        skip=skip,
        limit=limit,
    )
    return APIResponse(data=PaginatedData(items=items, total=total, skip=skip, limit=limit))

@router.post("", response_model=APIResponse[ProductResponse], status_code=status.HTTP_201_CREATED)
async def create_product(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_product_manage),
):
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        data = ProductCreate(**dict(form))
    else:
        body = await request.json()
        data = ProductCreate(**body)

    created = service.create_product(db, data, user=current_user)
    return APIResponse(data=created, message="Product created successfully")

@router.get("/{item_id}", response_model=APIResponse[ProductResponse])
def get_product(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_product_manage),
):
    return APIResponse(data=service.get(db, item_id))

@router.put("/{item_id}", response_model=APIResponse[ProductResponse])
async def update_product(
    item_id: int,
    request: Request,
    db: Session = Depends(get_db),
    _: User = Depends(require_product_manage),
):
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        data = ProductUpdate(**dict(form))
    else:
        body = await request.json()
        data = ProductUpdate(**body)

    return APIResponse(data=service.update(db, item_id, data), message="Product updated successfully")

@router.delete("/{item_id}", response_model=APIResponse[None])
def delete_product(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_product_manage),
):
    service.delete(db, item_id)
    return APIResponse(data=None, message="Product deleted successfully")
