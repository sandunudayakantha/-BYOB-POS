from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.common import APIResponse, ResponseStatus
from app.schemas.user import Token, TokenRefresh, UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()

@router.post("/register", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    user = auth_service.register(db, data)
    return APIResponse(data=user, status=ResponseStatus.SUCCESS, message="User registered successfully")

@router.post("/login", response_model=APIResponse[Token])
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    token = auth_service.login(db, credentials.username, credentials.password)
    return APIResponse(data=token, status=ResponseStatus.SUCCESS, message="Login successful")

@router.post("/refresh", response_model=APIResponse[Token])
def refresh(body: TokenRefresh, db: Session = Depends(get_db)):
    return APIResponse(
        data=auth_service.refresh_token(db, body.refresh_token),
        message="Token refreshed successfully",
    )

@router.post("/logout", response_model=APIResponse[dict])
def logout():
    return APIResponse(data={"detail": "Logged out."}, message="Logout successful")

@router.get("/me", response_model=APIResponse[UserResponse])
def get_me(current_user: User = Depends(get_current_user)):
    return APIResponse(data=UserResponse.model_validate(current_user), message="Profile fetched")

@router.post("/token", response_model=Token)
def token_endpoint(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return auth_service.login(db, form_data.username, form_data.password)
