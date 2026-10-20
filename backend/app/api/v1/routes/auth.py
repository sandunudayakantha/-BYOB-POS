from fastapi import APIRouter, Body, Depends, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db, require_super_admin
from app.core.exceptions import AuthenticationException
from app.core.rate_limit import limiter
from app.core.settings import settings
from app.models.user import User
from app.schemas.common import APIResponse, ResponseStatus
from app.schemas.user import Token, TokenRefresh, UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()

REFRESH_COOKIE_NAME = "refresh_token"
COOKIE_PATH = "/api/v1/auth"


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=(settings.APP_ENV != "development"),
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path=COOKIE_PATH,
    )


@router.post("/register", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(
    request: Request,
    data: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    user = auth_service.register(db, data)
    return APIResponse(data=user, status=ResponseStatus.SUCCESS, message="User registered successfully")


@router.post("/login", response_model=APIResponse[Token])
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    credentials: UserLogin,
    db: Session = Depends(get_db),
):
    token = auth_service.login(db, credentials.username, credentials.password)
    _set_refresh_cookie(response, token.refresh_token)
    return APIResponse(data=token, status=ResponseStatus.SUCCESS, message="Login successful")


@router.post("/refresh", response_model=APIResponse[Token])
@limiter.limit("15/minute")
def refresh(
    request: Request,
    response: Response,
    body: TokenRefresh | None = Body(default=None),
    db: Session = Depends(get_db),
):
    token_str = (body.refresh_token if body and body.refresh_token else None) or request.cookies.get(REFRESH_COOKIE_NAME)
    if not token_str:
        raise AuthenticationException("Refresh token missing")

    token = auth_service.refresh_token(db, token_str)
    _set_refresh_cookie(response, token.refresh_token)
    return APIResponse(
        data=token,
        message="Token refreshed successfully",
    )


@router.post("/logout", response_model=APIResponse[dict])
def logout(
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    auth_service.logout_user(db, current_user.id)
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path=COOKIE_PATH)
    return APIResponse(data={"detail": "Logged out."}, message="Logout successful")


@router.get("/me", response_model=APIResponse[UserResponse])
def get_me(current_user: User = Depends(get_current_user)):
    return APIResponse(data=UserResponse.model_validate(current_user), message="Profile fetched")


@router.post("/token", response_model=Token)
@limiter.limit("5/minute")
def token_endpoint(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return auth_service.login(db, form_data.username, form_data.password)
