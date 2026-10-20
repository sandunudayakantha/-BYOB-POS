from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.route_guards import require_menu_manage
from app.models.menu import MenuItem
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.menu import (
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate,
)
from app.schemas.menu_item import MenuItemReorderRequest
from app.services.menu_service import MenuItemService

router = APIRouter()
service = MenuItemService()

@router.get("", response_model=APIResponse[list[MenuItemResponse]])
def get_menu_items(
    menu_id: int = Query(..., alias="menuId"),
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    items = (
        db.query(MenuItem)
        .filter(MenuItem.menu_id == menu_id, MenuItem.is_deleted.is_(False))
        .order_by(MenuItem.sort_order.asc(), MenuItem.created_at.asc())
        .all()
    )
    return APIResponse(data=items, message="Menu items fetched successfully")

@router.post("", response_model=APIResponse[MenuItemResponse], status_code=status.HTTP_201_CREATED)
def add_menu_item(
    data: MenuItemCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    item = service.create_or_restore(db, data)
    return APIResponse(data=item, message="Product added to menu successfully")

@router.put("/reorder", response_model=APIResponse[None])
def reorder_menu_items(
    data: MenuItemReorderRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    for item in data.items:
        db.query(MenuItem).filter(MenuItem.id == item.id).update(
            {"sort_order": item.sort_order}
        )
    db.commit()
    return APIResponse(data=None, message="Menu items reordered successfully")

@router.put("/{item_id}", response_model=APIResponse[MenuItemResponse])
def update_menu_item(
    item_id: int,
    data: MenuItemUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    return APIResponse(data=service.update(db, item_id, data), message="Menu item updated successfully")

@router.delete("/{item_id}", response_model=APIResponse[None])
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_menu_manage),
):
    service.delete(db, item_id)
    return APIResponse(data=None, message="Product removed from menu successfully")
