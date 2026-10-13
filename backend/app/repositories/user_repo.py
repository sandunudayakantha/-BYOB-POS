from __future__ import annotations
from app.models.user import RefreshToken, User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self) -> None:
        super().__init__(User)

    def get_by_email(self, db, email: str) -> User | None:
        return self._active_query(db).filter(User.email == email.lower().strip()).first()

class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self) -> None:
        super().__init__(RefreshToken)

    def get_by_token(self, db, token: str) -> RefreshToken | None:
        return self._active_query(db).filter(RefreshToken.token == token).first()

    def delete_by_user_id(self, db, user_id: int) -> None:
        tokens = self._active_query(db).filter(RefreshToken.user_id == user_id).all()
        for t in tokens:
            self.delete(db, t)
