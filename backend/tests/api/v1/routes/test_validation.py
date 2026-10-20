from datetime import datetime, timedelta, timezone

def test_password_strength_validation(client, admin_headers):
    # Weak password - missing uppercase and digits
    payload = {
        "name": "Invalid User",
        "email": "invalid@test.com",
        "password": "weak",
    }
    r = client.post("/api/v1/auth/register", json=payload, headers=admin_headers)
    assert r.status_code == 422
    assert r.json()["error_code"] == "VALIDATION_ERROR"

    # Weak password - missing digits
    payload["password"] = "ShortPassword"
    r = client.post("/api/v1/auth/register", json=payload, headers=admin_headers)
    assert r.status_code == 422

    # Invalid email
    payload["password"] = "ValidPassword123!"
    payload["email"] = "not-an-email"
    r = client.post("/api/v1/auth/register", json=payload, headers=admin_headers)
    assert r.status_code == 422

def test_branch_phone_validation(client, auth_headers):
    # 1. First ensure a restaurant exists
    res = client.post("/api/v1/restaurants", json={"name": "Test Place"}, headers=auth_headers)
    rest_id = res.json()["data"]["id"]

    # Invalid phone format
    invalid_branch = {
        "restaurant_id": rest_id,
        "name": "Main Branch",
        "address": "123 Valid Road",
        "phone": "invalid-letters-phone",
    }
    r = client.post("/api/v1/branches", json=invalid_branch, headers=auth_headers)
    assert r.status_code == 422
    assert r.json()["error_code"] == "VALIDATION_ERROR"

    # Valid phone format
    valid_branch = {
        "restaurant_id": rest_id,
        "name": "Main Branch",
        "address": "123 Valid Road",
        "phone": "+1 555-019-2834",
    }
    r = client.post("/api/v1/branches", json=valid_branch, headers=auth_headers)
    assert r.status_code == 201

def test_menu_item_price_validation(client, auth_headers):
    # 1. Setup restaurant and branch
    res = client.post("/api/v1/restaurants", json={"name": "Pricing Bistro"}, headers=auth_headers)
    rest_id = res.json()["data"]["id"]

    branch = client.post("/api/v1/branches", json={
        "restaurant_id": rest_id,
        "name": "Branch One",
        "address": "456 City Center",
        "phone": "+1234567890",
    }, headers=auth_headers).json()["data"]

    cat = client.post("/api/v1/categories", json={
        "restaurant_id": rest_id,
        "branch_id": branch["id"],
        "name": "Main Dishes",
    }, headers=auth_headers).json()["data"]

    prod = client.post("/api/v1/products", json={
        "restaurant_id": rest_id,
        "branch_id": branch["id"],
        "category_id": cat["id"],
        "name": "Steak",
    }, headers=auth_headers).json()["data"]

    menu = client.post("/api/v1/menus", json={
        "restaurant_id": rest_id,
        "branch_id": branch["id"],
        "name": "Lunch",
    }, headers=auth_headers).json()["data"]

    # Negative price rejected
    r = client.post("/api/v1/menus/items", json={
        "menu_id": menu["id"],
        "product_id": prod["id"],
        "price": -5.00,
    }, headers=auth_headers)
    assert r.status_code == 422
    assert r.json()["error_code"] == "VALIDATION_ERROR"

    # Non-negative price accepted
    r = client.post("/api/v1/menus/items", json={
        "menu_id": menu["id"],
        "product_id": prod["id"],
        "price": 24.99,
    }, headers=auth_headers)
    assert r.status_code == 201

def test_featured_date_validation(client, auth_headers):
    res = client.post("/api/v1/restaurants", json={"name": "Date Bistro"}, headers=auth_headers).json()["data"]
    branch = client.post("/api/v1/branches", json={
        "restaurant_id": res["id"],
        "name": "Date Branch",
        "address": "789 High Street",
        "phone": "+1234567890",
    }, headers=auth_headers).json()["data"]

    now = datetime.now(timezone.utc)
    # end_date earlier than start_date rejected
    r = client.post("/api/v1/featured", json={
        "restaurant_id": res["id"],
        "branch_id": branch["id"],
        "title": "Winter Specials",
        "start_date": now.isoformat(),
        "end_date": (now - timedelta(days=2)).isoformat(),
    }, headers=auth_headers)
    assert r.status_code == 422
    assert r.json()["error_code"] == "VALIDATION_ERROR"


def test_safe_url_validation(client, auth_headers):
    res = client.post("/api/v1/restaurants", json={"name": "URL Bistro"}, headers=auth_headers).json()["data"]

    # javascript: pseudo-protocol in branch logo rejected
    bad_branch = {
        "restaurant_id": res["id"],
        "name": "XSS Branch",
        "address": "123 Valid Road",
        "phone": "+1 555-019-2834",
        "logo": "javascript:alert(document.cookie)",
    }
    r = client.post("/api/v1/branches", json=bad_branch, headers=auth_headers)
    assert r.status_code == 422
    assert r.json()["error_code"] == "VALIDATION_ERROR"

    # data: pseudo-protocol rejected
    bad_branch["logo"] = "data:text/html;base64,PHNjcmlwdD4="
    r = client.post("/api/v1/branches", json=bad_branch, headers=auth_headers)
    assert r.status_code == 422

    # Safe HTTP/HTTPS and relative URL accepted
    good_branch = {
        "restaurant_id": res["id"],
        "name": "Safe Branch",
        "address": "123 Valid Road",
        "phone": "+1 555-019-2834",
        "logo": "https://cdn.example.com/logo.png",
        "cover_image": "/assets/cover.jpg",
    }
    r = client.post("/api/v1/branches", json=good_branch, headers=auth_headers)
    assert r.status_code == 201


def test_inventory_validation_bounds(client, auth_headers):
    res = client.post("/api/v1/restaurants", json={"name": "Inv Bistro"}, headers=auth_headers).json()["data"]
    branch = client.post("/api/v1/branches", json={
        "restaurant_id": res["id"],
        "name": "Inv Branch",
        "address": "123 Valid Road",
        "phone": "+1 555-019-2834",
    }, headers=auth_headers).json()["data"]

    # Invalid supplier email format rejected
    bad_supplier = {
        "name": "Acme Veggies",
        "phone": "+1 555-123-4567",
        "email": "not-a-valid-email",
    }
    r = client.post(f"/api/v1/inventory/suppliers?branchId={branch['id']}", json=bad_supplier, headers=auth_headers)
    assert r.status_code == 422
    assert r.json()["error_code"] == "VALIDATION_ERROR"

    # Valid supplier email accepted
    good_supplier = {
        "name": "Acme Veggies",
        "phone": "+1 555-123-4567",
        "email": "orders@acme.com",
    }
    r = client.post(f"/api/v1/inventory/suppliers?branchId={branch['id']}", json=good_supplier, headers=auth_headers)
    assert r.status_code == 201

    # Raw batch with negative quantity rejected
    uom = client.post("/api/v1/inventory/uoms", json={
        "name": "Kilogram",
        "symbol": "kg",
        "uom_type": "WEIGHT",
    }, headers=auth_headers).json()["data"]

    item = client.post(f"/api/v1/inventory/items?branchId={branch['id']}", json={
        "name": "Potatoes",
        "uom_id": uom["id"],
        "unit_cost": 2.50,
    }, headers=auth_headers).json()["data"]

    bad_batch = {
        "quantity": -10,
        "unit_cost": 2.50,
    }
    r = client.post(f"/api/v1/inventory/items/{item['id']}/batches?branchId={branch['id']}", json=bad_batch, headers=auth_headers)
    assert r.status_code == 422
