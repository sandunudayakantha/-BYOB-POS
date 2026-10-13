from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.api.route_guards import require_dashboard_view
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.dashboard import OwnerDashboardStats
from app.services.dashboard_service import DashboardService

router = APIRouter()
dashboard_service = DashboardService()

@router.get("/dashboard-stats", response_model=APIResponse[OwnerDashboardStats])
def get_owner_dashboard_stats(
    branch_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: User = Depends(require_dashboard_view),
):
    stats = dashboard_service.get_owner_stats(db, current_user, branch_id=branch_id)
    return APIResponse(data=stats, message="Owner dashboard stats fetched")
