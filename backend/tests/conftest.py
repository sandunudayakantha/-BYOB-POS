import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

import app.models  # noqa: F401
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.core.security import get_password_hash
from app.models.user import User

@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def db(db_engine) -> Session:
    connection = db_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(sess, trans):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture()
def client(db) -> TestClient:
    def _get_test_db():
        yield db

    app.dependency_overrides[get_db] = _get_test_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def test_user(db: Session) -> User:
    user = User(
        name="Test Owner",
        email="owner@test.com",
        password_hash=get_password_hash("Password123!"),
        role="RESTAURANT_OWNER",
        status="ACTIVE"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture()
def auth_headers(client, test_user) -> dict:
    r = client.post("/api/v1/auth/login", json={"username": test_user.email, "password": "Password123!"})
    token = r.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
