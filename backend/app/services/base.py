from __future__ import annotations
import logging
from typing import Generic, TypeVar
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.core.exceptions import AppException, DatabaseException, NotFoundException
from app.db.base import Base
from app.repositories.base import BaseRepository

logger = logging.getLogger(__name__)
ModelType = TypeVar("ModelType", bound=Base)

class BaseCRUDService(Generic[ModelType]):
    def __init__(self, repo: BaseRepository[ModelType], *, entity_name: str, resource_name: str) -> None:
        self.repo = repo
        self.entity_name = entity_name
        self.resource_name = resource_name

    def create(self, db: Session, data: BaseModel, **extra) -> ModelType:
        try:
            payload = data.model_dump(exclude_unset=True)
            payload.update(extra)
            return self.repo.create(db, payload)
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"create_{self.resource_name}_db_error", extra={"error": str(e)})
            raise DatabaseException(f"Failed to create {self.resource_name} due to database error")

    def get(self, db: Session, item_id: int) -> ModelType:
        try:
            obj = self.repo.get(db, item_id)
            if not obj:
                raise NotFoundException(f"{self.entity_name} not found")
            return obj
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"get_{self.resource_name}_db_error", extra={"error": str(e)})
            raise DatabaseException(f"Failed to get {self.resource_name} due to database error")

    def list(self, db: Session, skip: int = 0, limit: int = 100) -> tuple[int, list[ModelType]]:
        try:
            return self.repo.list_paginated(db, skip=skip, limit=limit)
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"list_{self.resource_name}_db_error", extra={"error": str(e)})
            raise DatabaseException(f"Failed to list {self.resource_name} due to database error")

    def update(self, db: Session, item_id: int, data: BaseModel) -> ModelType:
        try:
            obj = self.repo.get(db, item_id)
            if not obj:
                raise NotFoundException(f"{self.entity_name} not found")
            return self.repo.update(db, obj, data.model_dump(exclude_unset=True))
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"update_{self.resource_name}_db_error", extra={"error": str(e)})
            raise DatabaseException(f"Failed to update {self.resource_name} due to database error")

    def delete(self, db: Session, item_id: int) -> None:
        try:
            obj = self.repo.get(db, item_id)
            if not obj:
                raise NotFoundException(f"{self.entity_name} not found")
            self.repo.delete(db, obj)
        except AppException:
            raise
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"delete_{self.resource_name}_db_error", extra={"error": str(e)})
            raise DatabaseException(f"Failed to delete {self.resource_name} due to database error")
