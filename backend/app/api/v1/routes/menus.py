from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.route_guards import require_menu_manage
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.menu import (
    MenuCreate,
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate,
    MenuResponse,
    MenuUpdate,
)
from app.services.menu_service import MenuItemService, MenuService

router = APIRouter()
menu_service = MenuService()
menu_item_service = MenuItemService()

@router.get("", response_model=APIResponse[PaginatedData[MenuResponse]])
def list_menus(
    branch_id: int | None = Query(None, alias="branchId"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_menu_manage),
):
    total, items = menu_service.list_menus_for_user(
        db, current_user, branch_id=branch_id, skip=skip, limit=limit
    )
    return APIResponse(data=PaginatedData(items=items, total=total, skip=skip, limit=limit))

@router.post("", response_model=APIResponse[MenuResponse], status_code=status.HTTP_201_CREATED)
def create_menu(
    data: MenuCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_menu_manage),
):
    created = menu_service.create_menu(db, data, user=current_user)
    return APIResponse(data=created, message="Menu created successfully")

@router.get("/price-matrix")
def get_price_matrix(
    branch_id: int = Query(..., alias="branchId"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str | None = None,
    category_id: str | None = Query(None, alias="categoryId"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_menu_manage),
):
    result = menu_service.get_price_matrix(
        db,
        current_user,
        branch_id=branch_id,
        page=page,
        limit=limit,
        search=search,
        category_id=category_id,
    )
    return {
        "status": "success",
        "message": "Price matrix report loaded successfully",
        "data": result["data"],
        "meta": result["meta"],
    }

@router.patch("/{item_id}/base", response_model=APIResponse[MenuResponse])
def set_base_menu(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_menu_manage),
):
    menu = menu_service.set_base_menu(db, item_id, current_user)
    return APIResponse(data=menu, message=f'"{menu.name}" set as the Base Menu for this branch')

@router.post("/{item_id}/adjust-prices")
def adjust_menu_prices(
    item_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_menu_manage),
):
    percentage = data.get("percentage", 0)
    source_mode = data.get("sourceMode", "BASE_MENU")
    result = menu_service.adjust_menu_prices(
        db, item_id, percentage=percentage, source_mode=source_mode, user=current_user
    )
    return APIResponse(data=result, message="Menu prices adjusted successfully")

@router.post("/{item_id}/fill-missing")
def fill_missing_menu_items(
    item_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_menu_manage),
):
    percentage = data.get("percentage", 0)
    overwrite_existing = data.get("overwriteExisting", False)
    result = menu_service.fill_missing_menu_items(
        db, item_id, percentage=percentage, overwrite_existing=overwrite_existing, user=current_user
    )
    return APIResponse(data=result, message="Populated menu items successfully")

@router.get("/{item_id}", response_model=APIResponse[MenuResponse])
def get_menu(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    return APIResponse(data=menu_service.get(db, item_id))

@router.put("/{item_id}", response_model=APIResponse[MenuResponse])
def update_menu(
    item_id: int,
    data: MenuUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    return APIResponse(data=menu_service.update(db, item_id, data), message="Menu updated successfully")

@router.delete("/{item_id}", response_model=APIResponse[None])
def delete_menu(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    menu_service.delete(db, item_id)
    return APIResponse(data=None, message="Menu deleted successfully")

# Menu Items Subroutes
@router.post("/items", response_model=APIResponse[MenuItemResponse], status_code=status.HTTP_201_CREATED)
def add_menu_item(
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    return APIResponse(data=menu_item_service.create(db, data), message="Menu item added successfully")

@router.put("/items/{item_id}", response_model=APIResponse[MenuItemResponse])
def update_menu_item(
    item_id: int,
    data: MenuItemUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    return APIResponse(data=menu_item_service.update(db, item_id, data), message="Menu item updated successfully")

@router.delete("/items/{item_id}", response_model=APIResponse[None])
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    menu_item_service.delete(db, item_id)
    return APIResponse(data=None, message="Menu item deleted successfully")
