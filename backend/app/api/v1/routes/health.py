from fastapi import APIRouter
from app.schemas.common import APIResponse

router = APIRouter()

@router.get("", response_model=APIResponse[dict])
def health_check():
    return APIResponse(
        data={"status": "healthy"},
        message="BYOB POS API is operational"
    )
