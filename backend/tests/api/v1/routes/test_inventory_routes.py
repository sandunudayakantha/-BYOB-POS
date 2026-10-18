import pytest
from decimal import Decimal
from fastapi.testclient import TestClient

from app.models.restaurant import Restaurant
from app.models.branch import Branch
from app.models.enums import UOMType
from app.models.inventory import UnitOfMeasure


@pytest.fixture
def prep_test_context(client: TestClient, db, test_user, auth_headers):
    # Setup test restaurant and branch
    rest = Restaurant(
        name="Colombo Bistro",
        owner_id=test_user.id,
        status="ACTIVE",
    )
    db.add(rest)
    db.commit()
    db.refresh(rest)

    test_user.restaurant_id = rest.id
    db.commit()
    db.refresh(test_user)

    branch = Branch(
        restaurant_id=rest.id,
        name="Main Branch",
        address="Galle Rd, Colombo",
        phone="+94112345678",
        status="ACTIVE",
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)

    # Setup units of measure
    kg = UnitOfMeasure(
        restaurant_id=rest.id,
        name="Kilogram",
        symbol="kg",
        uom_type=UOMType.WEIGHT.value,
        conversion_factor=Decimal("1.0000"),
    )
    g = UnitOfMeasure(
        restaurant_id=rest.id,
        name="Gram",
        symbol="g",
        uom_type=UOMType.WEIGHT.value,
        conversion_factor=Decimal("0.0010"),
    )
    portion = UnitOfMeasure(
        restaurant_id=rest.id,
        name="Portion",
        symbol="portion",
        uom_type=UOMType.PIECE_COUNT.value,
        conversion_factor=Decimal("1.0000"),
    )
    db.add_all([kg, g, portion])
    db.commit()
    for u in [kg, g, portion]:
        db.refresh(u)

    return {
        "restaurant": rest,
        "branch": branch,
        "uoms": {"kg": kg, "g": g, "portion": portion},
        "headers": auth_headers,
    }


def test_inventory_api_raw_item_crud_and_batches(client: TestClient, prep_test_context):
    ctx = prep_test_context
    headers = ctx["headers"]
    branch_id = ctx["branch"].id
    kg_id = ctx["uoms"]["kg"].id

    # 1. Create Raw Material Item
    create_res = client.post(
        f"/api/v1/inventory/items?branchId={branch_id}",
        headers=headers,
        json={
            "name": "Raw Whole Chicken",
            "sku": "RAW-CHK-01",
            "item_type": "RAW_MATERIAL",
            "uom_id": kg_id,
            "reorder_threshold": 25.0,
        },
    )
    assert create_res.status_code == 201
    item_data = create_res.json()["data"]
    item_id = item_data["id"]
    assert item_data["name"] == "Raw Whole Chicken"
    assert float(item_data["current_stock"]) == 0.0

    # 2. Update Raw Material Item (Manage function)
    update_res = client.put(
        f"/api/v1/inventory/items/{item_id}?branchId={branch_id}",
        headers=headers,
        json={
            "name": "Fresh Whole Broiler Chicken",
            "reorder_threshold": 30.0,
        },
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["name"] == "Fresh Whole Broiler Chicken"
    assert float(update_res.json()["data"]["reorder_threshold"]) == 30.0

    # 3. Add Stock Inward Batch
    batch_res = client.post(
        f"/api/v1/inventory/items/{item_id}/batches?branchId={branch_id}",
        headers=headers,
        json={
            "quantity": 50.0,
            "unit_cost": 850.0,
            "expiry_date": "2026-11-20",
            "batch_number": "INW-2026-001",
            "notes": "Direct poultry delivery",
        },
    )
    assert batch_res.status_code == 201
    batch_data = batch_res.json()["data"]
    assert float(batch_data["quantity_remaining"]) == 50.0
    assert batch_data["batch_number"] == "INW-2026-001"

    # Verify updated item stock
    item_check = client.get(
        f"/api/v1/inventory/items?branchId={branch_id}",
        headers=headers,
    )
    assert item_check.status_code == 200
    items = item_check.json()["data"]
    raw_item = next(i for i in items if i["id"] == item_id)
    assert float(raw_item["current_stock"]) == 50.0
    assert float(raw_item["unit_cost"]) == 850.0


def test_inventory_api_portion_prep_definition_and_batch_execution(client: TestClient, prep_test_context):
    ctx = prep_test_context
    headers = ctx["headers"]
    branch_id = ctx["branch"].id
    kg_id = ctx["uoms"]["kg"].id
    g_id = ctx["uoms"]["g"].id
    portion_id = ctx["uoms"]["portion"].id

    # 1. Create Raw Material
    raw_res = client.post(
        f"/api/v1/inventory/items?branchId={branch_id}",
        headers=headers,
        json={
            "name": "Boneless Chicken Breast",
            "item_type": "RAW_MATERIAL",
            "uom_id": kg_id,
            "reorder_threshold": 10.0,
        },
    )
    raw_id = raw_res.json()["data"]["id"]

    # Inward 20 kg
    client.post(
        f"/api/v1/inventory/items/{raw_id}/batches?branchId={branch_id}",
        headers=headers,
        json={"quantity": 20.0, "unit_cost": 1200.0},
    )

    # 2. Define Portion-Based Prep (1 portion = 120g)
    prep_res = client.post(
        f"/api/v1/inventory/preps/definitions?branchId={branch_id}",
        headers=headers,
        json={
            "name": "Chicken Rice Portion",
            "base_raw_item_id": raw_id,
            "uom_id": portion_id,
            "portion_size_value": 120.0,
            "portion_size_uom_id": g_id,
            "expected_yield_percent": 85.0,
            "track_wastage": True,
            "requires_image_evidence": False,
        },
    )
    assert prep_res.status_code == 201
    prep_data = prep_res.json()["data"]
    prep_id = prep_data["id"]
    assert float(prep_data["portion_size_value"]) == 120.0
    assert prep_data["portion_size_uom_symbol"] == "g"

    # 3. Log Batch Execution with Wastage / Trimmings
    log_res = client.post(
        f"/api/v1/inventory/preps/batches?branchId={branch_id}",
        headers=headers,
        json={
            "prep_definition_id": prep_id,
            "raw_input_quantity": 10.0,
            "actual_yield_quantity": 70.0,  # 70 portions @ 120g = 8.4 kg
            "wastage_quantity": 1.6,       # 10 - 8.4 = 1.6 kg scrap
            "wastage_reason": "Skin and excess fat removed",
            "wastage_image_url": "https://storage.example.com/waste_evidence.jpg",
        },
    )
    assert log_res.status_code == 201
    logged_batch = log_res.json()["data"]
    assert float(logged_batch["raw_input_quantity"]) == 10.0
    assert float(logged_batch["actual_yield_quantity"]) == 70.0
    assert float(logged_batch["wastage_quantity"]) == 1.6
    assert logged_batch["wastage_reason"] == "Skin and excess fat removed"

    # 4. Fetch Prep Batches History and verify Raw Details linkage
    batches_history_res = client.get(
        f"/api/v1/inventory/preps/batches?branchId={branch_id}",
        headers=headers,
    )
    assert batches_history_res.status_code == 200
    batch_list = batches_history_res.json()["data"]
    assert len(batch_list) >= 1
    found = next(b for b in batch_list if b["id"] == logged_batch["id"])
    assert found["base_raw_item_id"] == raw_id
    assert found["base_raw_item_name"] == "Boneless Chicken Breast"
    assert found["base_raw_item_uom_symbol"] == "kg"
    assert found["output_uom_symbol"] == "portion"
