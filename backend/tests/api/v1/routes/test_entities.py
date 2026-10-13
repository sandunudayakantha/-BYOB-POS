def test_restaurant_crud(client, auth_headers):
    # 1. Create restaurant
    create_payload = {
        "name": "The Gourmet Kitchen",
        "logo": "https://example.com/logo.png",
        "cover_image": "https://example.com/cover.png",
        "status": "ACTIVE",
        "max_branches": 5,
    }
    r = client.post("/api/v1/restaurants", json=create_payload, headers=auth_headers)
    assert r.status_code == 201
    assert r.json()["status"] == "success"
    restaurant_id = r.json()["data"]["id"]
    assert restaurant_id is not None
    assert r.json()["data"]["name"] == "The Gourmet Kitchen"

    # 2. Get restaurant
    r = client.get(f"/api/v1/restaurants/{restaurant_id}", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["data"]["id"] == restaurant_id

    # 3. List restaurants
    r = client.get("/api/v1/restaurants", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["data"]["total"] >= 1
    assert any(item["id"] == restaurant_id for item in r.json()["data"]["items"])

    # 4. Create branch
    branch_payload = {
        "restaurant_id": restaurant_id,
        "name": "Downtown Branch",
        "address": "123 Main Street",
        "phone": "+1234567890",
        "is_main": True,
        "status": "ACTIVE",
    }
    r = client.post("/api/v1/branches", json=branch_payload, headers=auth_headers)
    assert r.status_code == 201
    branch_id = r.json()["data"]["id"]

    # 5. Create category
    cat_payload = {
        "restaurant_id": restaurant_id,
        "branch_id": branch_id,
        "name": "Appetizers",
        "sort_order": 1,
        "status": "ACTIVE",
    }
    r = client.post("/api/v1/categories", json=cat_payload, headers=auth_headers)
    assert r.status_code == 201
    category_id = r.json()["data"]["id"]

    # 6. Create product
    prod_payload = {
        "restaurant_id": restaurant_id,
        "branch_id": branch_id,
        "category_id": category_id,
        "name": "Garlic Bread",
        "description": "Toasted bread with garlic herb butter",
        "prep_time": "10 mins",
        "available": True,
    }
    r = client.post("/api/v1/products", json=prod_payload, headers=auth_headers)
    assert r.status_code == 201
    product_id = r.json()["data"]["id"]

    # 7. Create menu and add item
    menu_payload = {
        "restaurant_id": restaurant_id,
        "branch_id": branch_id,
        "name": "Dinner Menu",
        "status": "ACTIVE",
        "is_base_menu": True,
    }
    r = client.post("/api/v1/menus", json=menu_payload, headers=auth_headers)
    assert r.status_code == 201
    menu_id = r.json()["data"]["id"]

    item_payload = {
        "menu_id": menu_id,
        "product_id": product_id,
        "price": 8.50,
        "available": True,
        "sort_order": 1,
    }
    r = client.post("/api/v1/menus/items", json=item_payload, headers=auth_headers)
    assert r.status_code == 201

    # 8. Create QR Code
    qr_payload = {
        "restaurant_id": restaurant_id,
        "branch_id": branch_id,
        "menu_id": menu_id,
        "table_name": "Table 5",
        "is_active": True,
    }
    r = client.post("/api/v1/qr", json=qr_payload, headers=auth_headers)
    assert r.status_code == 201
    qr_token = r.json()["data"]["token"]

    # 9. Public menu view via QR token
    r = client.get(f"/api/v1/public/menu/{qr_token}")
    assert r.status_code == 200
    assert r.json()["status"] == "success"
    assert r.json()["data"]["table_name"] == "Table 5"
    assert len(r.json()["data"]["items"]) == 1
    assert r.json()["data"]["items"][0]["name"] == "Garlic Bread"
