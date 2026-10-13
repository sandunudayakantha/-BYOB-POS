from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.api.route_guards import require_restaurant_manage
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedData
from app.schemas.restaurant import RestaurantCreate, RestaurantResponse, RestaurantUpdate
from app.services.restaurant_service import RestaurantService

router = APIRouter()
service = RestaurantService()

@router.get("", response_model=APIResponse[PaginatedData[RestaurantResponse]])
def list_restaurants(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total, items = service.list_for_user(db, current_user, skip=skip, limit=limit)
    return APIResponse(data=PaginatedData(items=items, total=total, skip=skip, limit=limit))

@router.post("", response_model=APIResponse[RestaurantResponse], status_code=status.HTTP_201_CREATED)
def create_restaurant(
    data: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = service.create_for_owner(db, data, current_user)
    return APIResponse(data=restaurant, message="Restaurant created successfully")

@router.get("/{item_id}", response_model=APIResponse[RestaurantResponse])
def get_restaurant(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return APIResponse(data=service.get(db, item_id))

@router.put("/{item_id}", response_model=APIResponse[RestaurantResponse])
def update_restaurant(
    item_id: int,
    data: RestaurantUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_restaurant_manage),
):
    return APIResponse(data=service.update(db, item_id, data), message="Restaurant updated successfully")

@router.delete("/{item_id}", response_model=APIResponse[None])
def delete_restaurant(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_restaurant_manage),
):
    service.delete(db, item_id)
    return APIResponse(data=None, message="Restaurant deleted successfully")
