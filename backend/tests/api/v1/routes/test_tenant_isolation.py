import pytest
from app.core.security import get_password_hash
from app.models.branch import Branch
from app.models.inventory import InventoryItem, Supplier, UnitOfMeasure
from app.models.restaurant import Restaurant
from app.models.user import User


@pytest.fixture()
def restaurant_setup(db):
    # Restaurant A + Owner A
    owner_a = User(
        name="Owner A",
        email="owner_a@test.com",
        password_hash=get_password_hash("Password123!"),
        role="RESTAURANT_OWNER",
        status="ACTIVE",
    )
    db.add(owner_a)
    db.commit()
    db.refresh(owner_a)

    rest_a = Restaurant(
        name="Restaurant A",
        owner_id=owner_a.id,
    )
    db.add(rest_a)
    db.commit()
    db.refresh(rest_a)
    owner_a.restaurant_id = rest_a.id
    db.commit()

    branch_a = Branch(
        restaurant_id=rest_a.id,
        name="Branch A",
        address="123 Street A",
        phone="0771234567",
    )
    db.add(branch_a)

    uom_a = UnitOfMeasure(
        restaurant_id=rest_a.id,
        name="Kilogram A",
        symbol="kg",
        uom_type="WEIGHT",
    )
    db.add(uom_a)
    db.commit()
    db.refresh(branch_a)
    db.refresh(uom_a)

    # Restaurant B + Owner B
    owner_b = User(
        name="Owner B",
        email="owner_b@test.com",
        password_hash=get_password_hash("Password123!"),
        role="RESTAURANT_OWNER",
        status="ACTIVE",
    )
    db.add(owner_b)
    db.commit()
    db.refresh(owner_b)

    rest_b = Restaurant(
        name="Restaurant B",
        owner_id=owner_b.id,
    )
    db.add(rest_b)
    db.commit()
    db.refresh(rest_b)
    owner_b.restaurant_id = rest_b.id
    db.commit()

    branch_b = Branch(
        restaurant_id=rest_b.id,
        name="Branch B",
        address="456 Street B",
        phone="0779876543",
    )
    db.add(branch_b)
    db.commit()
    db.refresh(branch_b)

    supplier_b = Supplier(
        restaurant_id=rest_b.id,
        branch_id=branch_b.id,
        name="Supplier B",
        phone="0770000000",
        is_active=True,
    )
    db.add(supplier_b)
    db.commit()
    db.refresh(supplier_b)

    return {
        "owner_a": owner_a,
        "rest_a": rest_a,
        "branch_a": branch_a,
        "owner_b": owner_b,
        "rest_b": rest_b,
        "branch_b": branch_b,
        "supplier_b": supplier_b,
    }


def test_cannot_read_other_restaurant(client, restaurant_setup):
    # Owner A logs in
    login_a = client.post(
        "/api/v1/auth/login",
        json={"username": restaurant_setup["owner_a"].email, "password": "Password123!"},
    )
    token_a = login_a.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Owner A tries to read Restaurant B details -> must be 403 Forbidden
    res = client.get(f"/api/v1/restaurants/{restaurant_setup['rest_b'].id}", headers=headers_a)
    assert res.status_code == 403


def test_cannot_access_other_branch_inventory(client, restaurant_setup):
    login_a = client.post(
        "/api/v1/auth/login",
        json={"username": restaurant_setup["owner_a"].email, "password": "Password123!"},
    )
    token_a = login_a.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Owner A queries suppliers for Branch B -> must be 403 Forbidden
    res = client.get(f"/api/v1/inventory/suppliers?branchId={restaurant_setup['branch_b'].id}", headers=headers_a)
    assert res.status_code == 403


def test_cannot_modify_other_restaurant_supplier(client, restaurant_setup):
    login_a = client.post(
        "/api/v1/auth/login",
        json={"username": restaurant_setup["owner_a"].email, "password": "Password123!"},
    )
    token_a = login_a.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Owner A tries to update Supplier B -> must be 403 Forbidden
    res = client.put(
        f"/api/v1/inventory/suppliers/{restaurant_setup['supplier_b'].id}",
        json={"name": "Hacked Supplier Name"},
        headers=headers_a,
    )
    assert res.status_code == 403
