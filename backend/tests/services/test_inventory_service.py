import pytest
from decimal import Decimal
from datetime import date
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.models.restaurant import Restaurant
from app.models.branch import Branch
from app.models.enums import (
    UOMType,
    InventoryItemType,
    PrepBatchStatus,
    BatchStatus,
)
from app.models.inventory import (
    UnitOfMeasure,
    Supplier,
    InventoryItem,
    KitchenPrepDefinition,
    KitchenPrepBatch,
    RawInventoryBatch,
    InventoryTransaction,
)
from app.schemas.inventory import (
    BarDispenseRuleCreate,
    InventoryItemCreate,
    InventoryItemUpdate,
    KitchenPrepBatchCreate,
    KitchenPrepDefinitionCreate,
    KitchenPrepDefinitionUpdate,
    KitchenPrepBatchCreate,
    RawInventoryBatchCreate,
)
from app.services.inventory_service import InventoryService


@pytest.fixture
def test_restaurant_and_branch(db: Session, test_user) -> tuple[Restaurant, Branch]:
    rest = Restaurant(
        name="Test Inventory Eatery",
        owner_id=test_user.id,
        status="ACTIVE",
        max_branches=3,
    )
    db.add(rest)
    db.commit()
    db.refresh(rest)

    branch = Branch(
        restaurant_id=rest.id,
        name="Main Colombo Branch",
        address="123 Galle Road, Colombo",
        phone="+94112345678",
        status="ACTIVE",
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)

    return rest, branch


@pytest.fixture
def uoms(db: Session, test_restaurant_and_branch) -> dict[str, UnitOfMeasure]:
    rest, branch = test_restaurant_and_branch
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
    return {"kg": kg, "g": g, "portion": portion}


@pytest.fixture
def supplier(db: Session, test_restaurant_and_branch) -> Supplier:
    rest, branch = test_restaurant_and_branch
    s = Supplier(
        restaurant_id=rest.id,
        branch_id=branch.id,
        name="Fresh Farm Supplies",
        contact_person="Kamal Perera",
        phone="+94771234567",
        email="kamal@freshfarms.lk",
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


def test_create_and_manage_raw_item(db: Session, test_restaurant_and_branch, uoms, supplier):
    rest, branch = test_restaurant_and_branch
    service = InventoryService()

    # 1. Create Raw Material
    payload = InventoryItemCreate(
        name="Chicken Breast Raw",
        sku="CHK-BRST-001",
        item_type=InventoryItemType.RAW_MATERIAL,
        uom_id=uoms["kg"].id,
        supplier_id=supplier.id,
        reorder_threshold=Decimal("15.000"),
        notes="Grade A chilled chicken breast",
    )
    item = service.create_inventory_item(db, rest.id, branch.id, payload)
    assert item.id is not None
    assert item.name == "Chicken Breast Raw"
    assert item.current_stock == Decimal("0.000")
    assert item.reorder_threshold == Decimal("15.000")

    # 2. Update Raw Material (Threshold, Name, SKU)
    update_payload = InventoryItemUpdate(
        name="Fresh Whole Chicken Breast",
        reorder_threshold=Decimal("20.000"),
        sku="CHK-BRST-002",
    )
    updated = service.update_inventory_item(db, item.id, update_payload)
    assert updated.name == "Fresh Whole Chicken Breast"
    assert updated.reorder_threshold == Decimal("20.000")
    assert updated.sku == "CHK-BRST-002"


def test_inward_raw_batch_and_stock_costing(db: Session, test_restaurant_and_branch, uoms, supplier):
    rest, branch = test_restaurant_and_branch
    service = InventoryService()

    item = service.create_inventory_item(
        db,
        rest.id,
        branch.id,
        InventoryItemCreate(
            name="Raw Beef Ribs",
            uom_id=uoms["kg"].id,
            reorder_threshold=Decimal("10.000"),
        ),
    )

    # Inward Batch 1: 10 kg @ Rs. 1000/kg
    b1_payload = RawInventoryBatchCreate(
        batch_number="BATCH-001",
        quantity=Decimal("10.000"),
        unit_cost=Decimal("1000.00"),
        expiry_date="2026-12-31",
        supplier_id=supplier.id,
    )
    b1 = service.add_stock_batch(db, branch.id, item.id, b1_payload)
    assert b1.id is not None
    assert b1.quantity_remaining == Decimal("10.000")

    db.refresh(item)
    assert item.current_stock == Decimal("10.000")
    assert item.unit_cost == Decimal("1000.00")

    # Inward Batch 2: 10 kg @ Rs. 1200/kg (Weighted avg should be (10*1000 + 10*1200)/20 = Rs. 1100/kg)
    b2_payload = RawInventoryBatchCreate(
        batch_number="BATCH-002",
        quantity=Decimal("10.000"),
        unit_cost=Decimal("1200.00"),
        expiry_date="2026-11-30",  # earlier expiry for FEFO
    )
    service.add_stock_batch(db, branch.id, item.id, b2_payload)

    db.refresh(item)
    assert item.current_stock == Decimal("20.000")
    assert item.unit_cost == Decimal("1100.00")


def test_define_prep_with_portions_and_bulk_weight(db: Session, test_restaurant_and_branch, uoms):
    rest, branch = test_restaurant_and_branch
    service = InventoryService()

    raw_item = service.create_inventory_item(
        db,
        rest.id,
        branch.id,
        InventoryItemCreate(
            name="Raw Chicken Legs",
            uom_id=uoms["kg"].id,
            reorder_threshold=Decimal("10.000"),
        ),
    )

    # 1. Bulk Weight Prep (e.g. Diced Chicken in kg)
    bulk_prep_payload = KitchenPrepDefinitionCreate(
        name="Diced Chicken Bulk",
        base_raw_item_id=raw_item.id,
        uom_id=uoms["kg"].id,
        expected_yield_percent=Decimal("85.00"),
        requires_image_evidence=False,
        track_wastage=True,
    )
    bulk_prep = service.create_prep_definition(db, rest.id, branch.id, bulk_prep_payload)
    assert bulk_prep.id is not None
    assert bulk_prep.portion_size_value is None

    # 2. Portion-Based Prep (e.g. Fried Chicken Portion: 1 portion = 150 g)
    portion_prep_payload = KitchenPrepDefinitionCreate(
        name="Fried Chicken Portion",
        base_raw_item_id=raw_item.id,
        uom_id=uoms["portion"].id,
        portion_size_value=Decimal("150.000"),
        portion_size_uom_id=uoms["g"].id,
        expected_yield_percent=Decimal("80.00"),
        requires_image_evidence=False,
        track_wastage=True,
    )
    portion_prep = service.create_prep_definition(db, rest.id, branch.id, portion_prep_payload)
    assert portion_prep.id is not None
    assert portion_prep.portion_size_value == Decimal("150.000")
    assert portion_prep.portion_size_uom_id == uoms["g"].id

    # 3. Edit Prep Definition (Update Portion Size)
    edit_payload = KitchenPrepDefinitionUpdate(
        name="Fried Chicken Standard Portion",
        portion_size_value=Decimal("160.000"),
        expected_yield_percent=Decimal("82.00"),
    )
    updated_prep = service.update_prep_definition(db, portion_prep.id, edit_payload)
    assert updated_prep.name == "Fried Chicken Standard Portion"
    assert updated_prep.portion_size_value == Decimal("160.000")
    assert updated_prep.expected_yield_percent == Decimal("82.00")


def test_log_prep_batch_and_wastage_tracking(db: Session, test_restaurant_and_branch, uoms, test_user):
    rest, branch = test_restaurant_and_branch
    service = InventoryService()

    # Raw item with 20 kg stock
    raw_item = service.create_inventory_item(
        db,
        rest.id,
        branch.id,
        InventoryItemCreate(
            name="Pork Belly Raw",
            uom_id=uoms["kg"].id,
            reorder_threshold=Decimal("5.000"),
        ),
    )
    service.add_stock_batch(
        db,
        branch.id,
        raw_item.id,
        RawInventoryBatchCreate(
            inventory_item_id=raw_item.id,
            quantity=Decimal("20.000"),
            unit_cost=Decimal("1500.00"),
        ),
    )

    # Define Prep: Roast Pork (weight-based)
    prep_def = service.create_prep_definition(
        db,
        rest.id,
        branch.id,
        KitchenPrepDefinitionCreate(
            name="Marinated Roast Pork",
            base_raw_item_id=raw_item.id,
            uom_id=uoms["kg"].id,
            expected_yield_percent=Decimal("85.00"),
            track_wastage=True,
            requires_image_evidence=False,
        ),
    )

    # Chef Logs Batch: 10 kg taken, 8.2 kg yielded, 1.8 kg trimmings / wastage recorded
    batch_payload = KitchenPrepBatchCreate(
        prep_definition_id=prep_def.id,
        raw_input_quantity=Decimal("10.000"),
        actual_yield_quantity=Decimal("8.200"),
        wastage_quantity=Decimal("1.800"),
        wastage_reason="Fat trimmings & skin discarded",
        wastage_image_url="https://images.example.com/waste_1.jpg",
    )
    batch = service.log_prep_batch(db, branch.id, test_user.id, batch_payload)

    assert batch.id is not None
    assert batch.raw_input_quantity == Decimal("10.000")
    assert batch.actual_yield_quantity == Decimal("8.200")
    assert batch.wastage_quantity == Decimal("1.800")
    assert batch.wastage_reason == "Fat trimmings & skin discarded"
    assert batch.status == PrepBatchStatus.COMPLETED.value

    # Verify Raw Stock Depletion (20 - 10 = 10 kg)
    db.refresh(raw_item)
    assert raw_item.current_stock == Decimal("10.000")

    # Verify Prep Item Stock Created / Updated (8.2 kg ready)
    db.refresh(prep_def)
    assert prep_def.current_stock == Decimal("8.200")

    # Verify list_prep_batches returns base_raw_item_id and wastage details
    batches_list = service.list_prep_batches(db, branch.id)
    assert len(batches_list) >= 1
    logged = next(b for b in batches_list if b["id"] == batch.id)
    assert logged["base_raw_item_id"] == raw_item.id
    assert logged["base_raw_item_name"] == "Pork Belly Raw"
    assert logged["wastage_quantity"] == Decimal("1.800")
    assert logged["wastage_reason"] == "Fat trimmings & skin discarded"
    assert logged["wastage_image_url"] == "https://images.example.com/waste_1.jpg"


def test_direct_resale_and_dual_unit_bottle_dispense(db: Session, test_restaurant_and_branch, uoms):
    from app.models.category import Category
    from app.models.product import Product
    from app.models.inventory import ProductRecipeItem
    from app.schemas.inventory import RawInventoryBatchCreate

    rest, branch = test_restaurant_and_branch
    service = InventoryService()

    # Create ml and Bottle UOMs if needed
    bottle_uom = uoms.get("portion") or uoms["kg"]
    ml_uom = uoms.get("g") or uoms["kg"]

    # 1. Create a Bar Beverage: Coca-Cola 1L Bottle with pack_size=1000 ml
    coke_item = service.create_inventory_item(
        db,
        rest.id,
        branch.id,
        InventoryItemCreate(
            name="Coca-Cola 1L Bottle",
            item_type="BAR_BEVERAGE",
            uom_id=bottle_uom.id,
            pack_size=Decimal("1000.000"),
            dispense_uom_id=ml_uom.id,
            reorder_threshold=Decimal("2.000"),
            unit_cost=Decimal("200.00"),
            current_stock=Decimal("0.000"),
        ),
    )

    # Inward 10 full bottles
    service.add_stock_batch(
        db,
        branch.id,
        coke_item.id,
        RawInventoryBatchCreate(
            inventory_item_id=coke_item.id,
            quantity=Decimal("10.000"),
            unit_cost=Decimal("200.00"),
        ),
    )

    db.refresh(coke_item)
    assert coke_item.current_stock == Decimal("10.000")
    breakdown = coke_item.bottle_breakdown
    assert breakdown["sealed_units"] == 10
    assert breakdown["has_open_unit"] is False
    assert breakdown["open_unit_remaining"] == 0.0

    # 2. Create a Mocktail Product that uses 100 ml of Coca-Cola
    cat = Category(restaurant_id=rest.id, branch_id=branch.id, name="Beverages")
    db.add(cat)
    db.commit()

    mocktail = Product(
        restaurant_id=rest.id,
        branch_id=branch.id,
        category_id=cat.id,
        name="Virgin Cuba Libre",
        available=True,
    )
    db.add(mocktail)
    db.commit()

    recipe = ProductRecipeItem(
        product_id=mocktail.id,
        inventory_item_id=coke_item.id,
        uom_id=ml_uom.id,  # Measured in ml (dispense UOM)
        quantity=Decimal("100.000"),
        wastage_factor_percent=Decimal("0.00"),
    )
    db.add(recipe)
    db.commit()

    # 3. Customer orders 1 Mocktail (100 ml)
    deductions = service.deduct_inventory_for_order(
        db,
        branch.id,
        [{"product_id": mocktail.id, "quantity": 1}],
        order_ref="ORD-101",
    )
    assert len(deductions) == 1
    # 100 ml / 1000 = 0.100 bottle deducted
    assert deductions[0]["quantity_deducted"] == 0.1

    # 4. Verify Stock State: 10 - 0.100 = 9.900 bottles (9 Sealed + 1 Open with 900 ml)
    db.refresh(coke_item)
    assert coke_item.current_stock == Decimal("9.900")
    b_down = coke_item.bottle_breakdown
    assert b_down["sealed_units"] == 9
    assert b_down["has_open_unit"] is True
    assert b_down["open_unit_remaining"] == 900.0
    assert b_down["open_unit_percent"] == 90.0


def test_global_bar_dispense_rule_and_shot_wise_sales(db: Session, test_restaurant_and_branch, supplier):
    rest, branch = test_restaurant_and_branch
    service = InventoryService()

    bottle_uom = UnitOfMeasure(
        restaurant_id=rest.id,
        name="Bottle",
        symbol="btl",
        uom_type=UOMType.PIECE_COUNT.value,
        conversion_factor=Decimal("1.0000"),
    )
    ml_uom = UnitOfMeasure(
        restaurant_id=rest.id,
        name="Milliliter",
        symbol="ml",
        uom_type=UOMType.VOLUME.value,
        conversion_factor=Decimal("0.0010"),
    )
    db.add_all([bottle_uom, ml_uom])
    db.commit()

    # 1. Add Coca-Cola 1L bottle and 500ml bottle as regular retail inventory
    coke_1l = service.create_inventory_item(
        db,
        rest.id,
        branch.id,
        InventoryItemCreate(
            name="Coca-Cola 1L",
            sku="COKE-1L",
            uom_id=bottle_uom.id,
            item_type=InventoryItemType.DIRECT_RESALE,
            supplier_id=supplier.id,
            pack_size=Decimal("1000.000"),
            dispense_uom_id=ml_uom.id,
            unit_cost=Decimal("300.00"),
        ),
    )
    coke_500ml = service.create_inventory_item(
        db,
        rest.id,
        branch.id,
        InventoryItemCreate(
            name="Coca-Cola 500ml",
            sku="COKE-500ML",
            uom_id=bottle_uom.id,
            item_type=InventoryItemType.DIRECT_RESALE,
            supplier_id=supplier.id,
            pack_size=Decimal("500.000"),
            dispense_uom_id=ml_uom.id,
            unit_cost=Decimal("180.00"),
        ),
    )

    # Inward 5 of each
    service.add_stock_batch(
        db,
        branch.id,
        coke_1l.id,
        RawInventoryBatchCreate(quantity=Decimal("5.000"), unit_cost=Decimal("300.00")),
    )
    service.add_stock_batch(
        db,
        branch.id,
        coke_500ml.id,
        RawInventoryBatchCreate(quantity=Decimal("5.000"), unit_cost=Decimal("180.00")),
    )

    # 2. Configure Global Bar Dispense Rule: For "Coca-Cola", Primary = 1L, Fallback = 500ml
    rule = service.create_bar_dispense_rule(
        db,
        rest.id,
        branch.id,
        BarDispenseRuleCreate(
            beverage_name="Coca-Cola",
            brand_group="coca_cola",
            primary_inventory_item_id=coke_1l.id,
            fallback_inventory_item_id=coke_500ml.id,
            shot_single_ml=Decimal("25.00"),
            shot_double_ml=Decimal("50.00"),
            notes="Bar dispense rule for all mocktails and mixers",
        ),
    )
    assert rule["id"] is not None
    assert rule["primary_item_name"] == "Coca-Cola 1L"
    assert rule["fallback_item_name"] == "Coca-Cola 500ml"

    # 3. Create a Mocktail whose recipe refers to Coca-Cola (even if bartender selected 500ml or generic item)
    from app.models.category import Category
    from app.models.product import Product
    from app.models.inventory import ProductRecipeItem

    cat = Category(restaurant_id=rest.id, branch_id=branch.id, name="Mocktails")
    db.add(cat)
    db.commit()

    mocktail = Product(restaurant_id=rest.id, branch_id=branch.id, category_id=cat.id, name="Virgin Cuba Libre")
    db.add(mocktail)
    db.commit()

    recipe_item = ProductRecipeItem(
        product_id=mocktail.id,
        inventory_item_id=coke_500ml.id,  # Pointed to 500ml item initially in recipe
        uom_id=ml_uom.id,
        quantity=Decimal("100.000"),  # 100ml
    )
    db.add(recipe_item)
    db.commit()

    # 4. Bill the mocktail: System checks rule -> sees Coca-Cola rule -> prioritizes 1L bottle!
    deductions = service.deduct_inventory_for_order(
        db,
        branch.id,
        [{"product_id": mocktail.id, "quantity": 1}],
        order_ref="ORD-BAR-001",
    )
    assert len(deductions) == 1
    # Check that the 1L bottle was deducted, NOT the 500ml bottle!
    assert deductions[0]["inventory_item_id"] == coke_1l.id

    db.refresh(coke_1l)
    db.refresh(coke_500ml)
    # 1L bottle: 5.000 - 0.100 = 4.900 bottles (4 sealed + 1 open with 900ml)
    assert coke_1l.current_stock == Decimal("4.900")
    assert coke_1l.bottle_breakdown["sealed_units"] == 4
    assert coke_1l.bottle_breakdown["open_unit_remaining"] == 900.0

    # 500ml bottle remained completely untouched at 5.000 bottles!
    assert coke_500ml.current_stock == Decimal("5.000")
    assert coke_500ml.bottle_breakdown["sealed_units"] == 5
    assert coke_500ml.bottle_breakdown["has_open_unit"] is False

