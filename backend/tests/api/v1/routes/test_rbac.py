import pytest
from app.core.security import get_password_hash
from app.models.branch import Branch
from app.models.restaurant import Restaurant
from app.models.user import User
from app.services.rbac_seed_service import sync_rbac_seed


@pytest.fixture()
def rbac_setup(db):
    # Ensure RBAC seed is run
    sync_rbac_seed(db)

    # Create Owner and Restaurant
    owner = User(
        name="Owner User",
        email="owner_rbac@test.com",
        password_hash=get_password_hash("Password123!"),
        role="RESTAURANT_OWNER",
        status="ACTIVE",
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)

    rest = Restaurant(
        name="RBAC Restaurant",
        owner_id=owner.id,
    )
    db.add(rest)
    db.commit()
    db.refresh(rest)
    owner.restaurant_id = rest.id

    # Create Branch Manager
    manager = User(
        name="Manager User",
        email="manager@test.com",
        password_hash=get_password_hash("Password123!"),
        role="BRANCH_MANAGER",
        restaurant_id=rest.id,
        status="ACTIVE",
    )
    db.add(manager)

    # Create Staff
    staff = User(
        name="Staff User",
        email="staff@test.com",
        password_hash=get_password_hash("Password123!"),
        role="STAFF",
        restaurant_id=rest.id,
        status="ACTIVE",
    )
    db.add(staff)
    db.commit()
    db.refresh(manager)
    db.refresh(staff)

    return {
        "rest": rest,
        "owner": owner,
        "manager": manager,
        "staff": staff,
    }


def test_branch_manager_can_manage_branches(client, rbac_setup):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": rbac_setup["manager"].email, "password": "Password123!"},
    )
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Branch manager has branch.manage permission -> can list branches
    res = client.get("/api/v1/branches", headers=headers)
    assert res.status_code == 200


def test_staff_cannot_manage_branches(client, rbac_setup):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": rbac_setup["staff"].email, "password": "Password123!"},
    )
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Staff does NOT have branch.manage permission -> must be 403 Forbidden
    res = client.get("/api/v1/branches", headers=headers)
    assert res.status_code == 403
