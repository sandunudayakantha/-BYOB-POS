from datetime import UTC, datetime, timedelta
import logging
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.core.exceptions import (
    AppException,
    AuthenticationException,
    BadRequestException,
    ConflictException,
    DatabaseException,
    NotFoundException,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.core.settings import settings
from app.models.enums import UserRole, UserStatus
from app.models.user import User
from app.repositories.user_repo import RefreshTokenRepository, UserRepository
from app.schemas.user import Token, UserCreate, UserResponse

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self) -> None:
        self.user_repo = UserRepository()
        self.refresh_token_repo = RefreshTokenRepository()

    def register(self, db: Session, data: UserCreate) -> UserResponse:
        try:
            existing = self.user_repo.get_by_email(db, data.email)
            if existing:
                raise ConflictException("A user with this email already exists")

            user_dict = {
                "name": data.name,
                "email": data.email.lower().strip(),
                "password_hash": get_password_hash(data.password),
                "role": data.role,
                "status": UserStatus.ACTIVE.value,
                "restaurant_id": data.restaurant_id,
            }
            user = self.user_repo.create(db, user_dict)
            return UserResponse.model_validate(user)
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error("auth_register_db_error", extra={"error": str(e)})
            raise DatabaseException("Registration failed due to database error")

    def login(self, db: Session, username: str, password: str) -> Token:
        try:
            user = self.user_repo.get_by_email(db, username)
            if not user:
                raise AuthenticationException("Invalid email or password")

            # Check lockout
            if user.lock_until and user.lock_until > datetime.now(UTC):
                raise AuthenticationException("Account is temporarily locked. Try again later.")

            if not verify_password(password, user.password_hash):
                user.login_attempts += 1
                if user.login_attempts >= 5:
                    user.lock_until = datetime.now(UTC) + timedelta(minutes=15)
                self.user_repo.commit(db)
                raise AuthenticationException("Invalid email or password")

            # Reset attempts on success
            user.login_attempts = 0
            user.lock_until = None

            access_token = create_access_token(user.id)
            refresh_token_val = create_refresh_token(user.id)

            # Store refresh token
            self.refresh_token_repo.create(
                db,
                {
                    "user_id": user.id,
                    "token": refresh_token_val,
                    "expires_at": datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
                },
            )

            return Token(
                access_token=access_token,
                refresh_token=refresh_token_val,
                token_type="bearer",
                user=UserResponse.model_validate(user),
            )
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"auth_login_db_error: {e}", exc_info=True)
            raise DatabaseException(f"Login failed due to database error: {e}")

    def refresh_token(self, db: Session, refresh_token_str: str) -> Token:
        try:
            payload = decode_token(refresh_token_str)
            if not payload or payload.get("type") != "refresh":
                raise AuthenticationException("Invalid refresh token")

            # Check if token exists in active tokens
            stored_token = self.refresh_token_repo.get_by_token(db, refresh_token_str)
            if not stored_token:
                # Check if it was recently rotated within a 60-second grace window (handles page refreshes / parallel calls)
                cutoff = datetime.now(UTC) - timedelta(seconds=60)
                recent_token = (
                    db.query(RefreshToken)
                    .filter(
                        RefreshToken.token == refresh_token_str,
                        RefreshToken.is_deleted.is_(True),
                        RefreshToken.updated_at >= cutoff,
                    )
                    .first()
                )
                if recent_token:
                    # Find active token for this user
                    active_token = (
                        db.query(RefreshToken)
                        .filter(RefreshToken.user_id == recent_token.user_id, RefreshToken.is_deleted.is_(False))
                        .order_by(RefreshToken.created_at.desc())
                        .first()
                    )
                    user = self.user_repo.get(db, recent_token.user_id)
                    if active_token and user and user.status == UserStatus.ACTIVE.value:
                        new_access_token = create_access_token(user.id)
                        return Token(
                            access_token=new_access_token,
                            refresh_token=active_token.token,
                            token_type="bearer",
                            user=UserResponse.model_validate(user),
                        )
                raise AuthenticationException("Refresh token revoked or expired")

            user = self.user_repo.get(db, stored_token.user_id)
            if not user or user.status != UserStatus.ACTIVE.value:
                raise AuthenticationException("User is no longer active")

            # Invalidate old token and issue new pair
            self.refresh_token_repo.delete(db, stored_token)
            new_access_token = create_access_token(user.id)
            new_refresh_token = create_refresh_token(user.id)

            self.refresh_token_repo.create(
                db,
                {
                    "user_id": user.id,
                    "token": new_refresh_token,
                    "expires_at": datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
                },
            )

            return Token(
                access_token=new_access_token,
                refresh_token=new_refresh_token,
                token_type="bearer",
                user=UserResponse.model_validate(user),
            )
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error("auth_refresh_db_error", extra={"error": str(e)})
            raise DatabaseException("Token refresh failed due to database error")
