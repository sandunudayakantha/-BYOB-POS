from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, require_super_admin
from app.models.user import User
from app.schemas.admin import (
    AdminRestaurantBranchLimitUpdate,
    AdminRestaurantCreate,
    AdminRestaurantItem,
    AdminRestaurantResetPassword,
    AdminRestaurantStatusUpdate,
)
from app.schemas.common import APIResponse
from app.schemas.dashboard import AdminDashboardStats
from app.services.admin_restaurant_service import AdminRestaurantService
from app.services.dashboard_service import DashboardService

router = APIRouter()
dashboard_service = DashboardService()
admin_restaurant_service = AdminRestaurantService()

@router.get("/dashboard-stats", response_model=APIResponse[AdminDashboardStats])
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    stats = dashboard_service.get_admin_stats(db)
    return APIResponse(data=stats, message="Super admin dashboard stats fetched")

# ---------------------------------------------------------
# Admin Restaurant Management Endpoints
# ---------------------------------------------------------

@router.get("/restaurants", response_model=APIResponse[list[AdminRestaurantItem]])
def list_restaurants(
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    items = admin_restaurant_service.list_restaurants(db)
    return APIResponse(data=items, message="Restaurants fetched successfully")

@router.post(
    "/restaurants",
    response_model=APIResponse[AdminRestaurantItem],
    status_code=status.HTTP_201_CREATED,
)
def create_restaurant(
    data: AdminRestaurantCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    created = admin_restaurant_service.create_restaurant_with_owner(db, data)
    return APIResponse(
        data=created,
        message="Restaurant and Owner account created successfully",
    )

@router.patch("/restaurants/{restaurant_id}/status", response_model=APIResponse[AdminRestaurantItem])
def toggle_restaurant_status(
    restaurant_id: int,
    data: AdminRestaurantStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    updated = admin_restaurant_service.toggle_restaurant_status(
        db, restaurant_id, data.status
    )
    return APIResponse(
        data=updated,
        message=f"Restaurant {'activated' if data.status == 'ACTIVE' else 'suspended'} successfully",
    )

@router.patch(
    "/restaurants/{restaurant_id}/branch-limit",
    response_model=APIResponse[AdminRestaurantItem],
)
def update_branch_limit(
    restaurant_id: int,
    data: AdminRestaurantBranchLimitUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    updated = admin_restaurant_service.update_branch_limit(
        db, restaurant_id, data.max_branches
    )
    return APIResponse(data=updated, message="Branch limit updated successfully")

@router.post(
    "/restaurants/{restaurant_id}/reset-password",
    response_model=APIResponse[None],
)
def reset_restaurant_password(
    restaurant_id: int,
    data: AdminRestaurantResetPassword,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    msg = admin_restaurant_service.reset_owner_password(
        db, restaurant_id, data.new_password
    )
    return APIResponse(data=None, message=msg)

@router.delete("/restaurants/{restaurant_id}", response_model=APIResponse[None])
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    admin_restaurant_service.delete_restaurant(db, restaurant_id)
    return APIResponse(data=None, message="Restaurant deleted successfully")
