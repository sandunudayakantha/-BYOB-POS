from __future__ import annotations
import builtins
from typing import Any, Generic, TypeVar
from sqlalchemy.orm import Session
from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType]) -> None:
        self.model = model

    def _active_query(self, db: Session):
        query = db.query(self.model)
        col = getattr(self.model, "is_deleted", None)
        if col is not None:
            query = query.filter(col.is_(False))
        return query

    def get(self, db: Session, id: int) -> ModelType | None:
        return self._active_query(db).filter(self.model.id == id).first()

    def exists(self, db: Session, id: int) -> bool:
        q = db.query(self.model.id).filter(self.model.id == id)
        col = getattr(self.model, "is_deleted", None)
        if col is not None:
            q = q.filter(col.is_(False))
        return q.first() is not None

    def list(self, db: Session, skip: int = 0, limit: int = 100) -> builtins.list[ModelType]:
        return self._active_query(db).offset(skip).limit(limit).all()

    def list_paginated(self, db: Session, skip: int = 0, limit: int = 100) -> tuple[int, builtins.list[ModelType]]:
        q = self._active_query(db).order_by(self.model.id.asc())
        return q.count(), q.offset(skip).limit(limit).all()

    def count(self, db: Session) -> int:
        return self._active_query(db).count()

    def add(self, db: Session, obj: ModelType) -> None:
        db.add(obj)

    def add_all(self, db: Session, objects: list[ModelType]) -> None:
        db.add_all(objects)

    def flush(self, db: Session) -> None:
        db.flush()

    def commit(self, db: Session) -> None:
        db.commit()

    def refresh(self, db: Session, obj: ModelType) -> ModelType:
        db.refresh(obj)
        return obj

    def create(self, db: Session, data: dict[str, Any]) -> ModelType:
        obj = self.model(**data)
        self.add(db, obj)
        self.commit(db)
        self.refresh(db, obj)
        return obj

    def update(self, db: Session, obj: ModelType, data: dict[str, Any]) -> ModelType:
        for k, v in data.items():
            setattr(obj, k, v)
        self.commit(db)
        self.refresh(db, obj)
        return obj

    def delete(self, db: Session, obj: ModelType) -> None:
        if hasattr(obj, "is_deleted"):
            obj.is_deleted = True
            self.commit(db)
        else:
            db.delete(obj)
            self.commit(db)
