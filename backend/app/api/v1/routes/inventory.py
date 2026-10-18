from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemResponse,
    InventoryItemUpdate,
    KitchenPrepBatchCreate,
    KitchenPrepBatchResponse,
    KitchenPrepDefinitionCreate,
    KitchenPrepDefinitionResponse,
    KitchenPrepDefinitionUpdate,
    ProductRecipeItemResponse,
    ProductRecipeSaveRequest,
    RawInventoryBatchCreate,
    RawInventoryBatchResponse,
    SupplierCreate,
    SupplierResponse,
    SupplierUpdate,
    UnitOfMeasureCreate,
    UnitOfMeasureResponse,
)
from app.services.inventory_service import InventoryService

router = APIRouter()
inventory_service = InventoryService()

# ----------------- Units of Measure (UOM) -----------------
@router.get("/uoms", response_model=APIResponse[list[UnitOfMeasureResponse]])
def get_uoms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant_id = current_user.restaurant_id
    uoms = inventory_service.list_uoms(db, restaurant_id)
    return APIResponse(data=uoms, message="Units of measure loaded")

@router.post("/uoms", response_model=APIResponse[UnitOfMeasureResponse], status_code=status.HTTP_201_CREATED)
def create_uom(
    payload: UnitOfMeasureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant_id = current_user.restaurant_id
    uom = inventory_service.create_uom(db, restaurant_id, payload)
    return APIResponse(data=uom, message="Unit of measure created successfully")


# ----------------- Suppliers -----------------
@router.get("/suppliers", response_model=APIResponse[list[SupplierResponse]])
def get_suppliers(
    branchId: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suppliers = inventory_service.list_suppliers(db, branchId)
    return APIResponse(data=suppliers, message="Suppliers loaded")

@router.post("/suppliers", response_model=APIResponse[SupplierResponse], status_code=status.HTTP_201_CREATED)
def create_supplier(
    payload: SupplierCreate,
    branchId: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant_id = current_user.restaurant_id
    supplier = inventory_service.create_supplier(db, restaurant_id, branchId, payload)
    return APIResponse(data=supplier, message="Supplier added successfully")

@router.put("/suppliers/{supplier_id}", response_model=APIResponse[SupplierResponse])
def update_supplier(
    supplier_id: int,
    payload: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    supplier = inventory_service.update_supplier(db, supplier_id, payload)
    return APIResponse(data=supplier, message="Supplier updated successfully")

@router.delete("/suppliers/{supplier_id}", response_model=APIResponse[None])
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inventory_service.delete_supplier(db, supplier_id)
    return APIResponse(data=None, message="Supplier deleted successfully")


# ----------------- Inventory Items -----------------
@router.get("/items", response_model=APIResponse[list[InventoryItemResponse]])
def get_inventory_items(
    branchId: int = Query(...),
    itemType: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = inventory_service.list_inventory_items(db, branchId, itemType)
    return APIResponse(data=items, message="Inventory items loaded")

@router.post("/items", response_model=APIResponse[InventoryItemResponse], status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    payload: InventoryItemCreate,
    branchId: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant_id = current_user.restaurant_id
    item = inventory_service.create_inventory_item(db, restaurant_id, branchId, payload)
    return APIResponse(data=item, message="Inventory item added successfully")

@router.put("/items/{item_id}", response_model=APIResponse[InventoryItemResponse])
def update_inventory_item(
    item_id: int,
    payload: InventoryItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = inventory_service.update_inventory_item(db, item_id, payload)
    return APIResponse(data=item, message="Inventory item updated successfully")

@router.delete("/items/{item_id}", response_model=APIResponse[None])
def delete_inventory_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inventory_service.delete_inventory_item(db, item_id)
    return APIResponse(data=None, message="Inventory item deleted successfully")


# ----------------- Raw Inventory Batches -----------------
@router.post("/items/{item_id}/batches", response_model=APIResponse[RawInventoryBatchResponse], status_code=status.HTTP_201_CREATED)
def add_item_stock_batch(
    item_id: int,
    payload: RawInventoryBatchCreate,
    branchId: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    batch = inventory_service.add_stock_batch(db, branchId, item_id, payload)
    return APIResponse(
        data={
            "id": batch.id,
            "inventory_item_id": batch.inventory_item_id,
            "branch_id": batch.branch_id,
            "supplier_id": batch.supplier_id,
            "supplier_name": batch.supplier.name if batch.supplier else None,
            "batch_number": batch.batch_number,
            "quantity_received": batch.quantity_received,
            "quantity_remaining": batch.quantity_remaining,
            "unit_cost": batch.unit_cost,
            "received_date": batch.received_date.isoformat() if batch.received_date else "",
            "expiry_date": batch.expiry_date.isoformat() if batch.expiry_date else None,
            "status": batch.status,
            "notes": batch.notes or "",
            "created_at": batch.created_at.isoformat() if batch.created_at else "",
        },
        message="Stock batch inwarded successfully"
    )

@router.get("/items/{item_id}/batches", response_model=APIResponse[list[RawInventoryBatchResponse]])
def get_item_batches(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    batches = inventory_service.list_item_batches(db, item_id)
    return APIResponse(data=batches, message="Batches loaded successfully")


# ----------------- Kitchen Prep Definitions -----------------
@router.get("/preps/definitions", response_model=APIResponse[list[KitchenPrepDefinitionResponse]])
def get_prep_definitions(
    branchId: int = Query(...),
    rawItemId: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preps = inventory_service.list_prep_definitions(db, branchId, rawItemId)
    return APIResponse(data=preps, message="Kitchen prep definitions loaded")

@router.post("/preps/definitions", response_model=APIResponse[KitchenPrepDefinitionResponse], status_code=status.HTTP_201_CREATED)
def create_prep_definition(
    payload: KitchenPrepDefinitionCreate,
    branchId: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant_id = current_user.restaurant_id
    prep = inventory_service.create_prep_definition(db, restaurant_id, branchId, payload)
    return APIResponse(data=prep, message="Kitchen prep definition created successfully")

@router.put("/preps/definitions/{prep_id}", response_model=APIResponse[KitchenPrepDefinitionResponse])
def update_prep_definition(
    prep_id: int,
    payload: KitchenPrepDefinitionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prep = inventory_service.update_prep_definition(db, prep_id, payload)
    return APIResponse(data=prep, message="Kitchen prep definition updated successfully")

@router.delete("/preps/definitions/{prep_id}", response_model=APIResponse[None])
def delete_prep_definition(
    prep_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inventory_service.delete_prep_definition(db, prep_id)
    return APIResponse(data=None, message="Kitchen prep definition deleted successfully")


# ----------------- Kitchen Prep Batches -----------------
@router.get("/preps/batches", response_model=APIResponse[list[KitchenPrepBatchResponse]])
def get_prep_batches(
    branchId: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    batches = inventory_service.list_prep_batches(db, branchId)
    return APIResponse(data=batches, message="Kitchen prep batches loaded")

@router.post("/preps/batches", response_model=APIResponse[KitchenPrepBatchResponse], status_code=status.HTTP_201_CREATED)
def log_prep_batch(
    payload: KitchenPrepBatchCreate,
    branchId: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    batch = inventory_service.log_prep_batch(db, branchId, current_user.id, payload)
    return APIResponse(
        data={
            "id": batch.id,
            "prep_definition_id": batch.prep_definition_id,
            "prep_definition_name": batch.prep_definition.name if batch.prep_definition else None,
            "branch_id": batch.branch_id,
            "prepared_by_user_id": batch.prepared_by_user_id,
            "prepared_by_name": batch.prepared_by.name if batch.prepared_by else "Staff",
            "raw_input_quantity": batch.raw_input_quantity,
            "actual_yield_quantity": batch.actual_yield_quantity,
            "wastage_quantity": batch.wastage_quantity,
            "wastage_reason": batch.wastage_reason or "",
            "prep_image_url": batch.prep_image_url or "",
            "wastage_image_url": batch.wastage_image_url or "",
            "calculated_unit_cost": batch.calculated_unit_cost,
            "status": batch.status,
            "created_at": batch.created_at.isoformat() if batch.created_at else "",
        },
        message="Kitchen prep batch logged and stock updated"
    )


# ----------------- Product Recipes & Costing -----------------
@router.get("/recipes/products/{product_id}", response_model=APIResponse[list[ProductRecipeItemResponse]])
def get_product_recipe(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = inventory_service.get_product_recipe(db, product_id)
    return APIResponse(data=recipe, message="Product recipe retrieved")

@router.post("/recipes/products/{product_id}", response_model=APIResponse[list[ProductRecipeItemResponse]])
def save_product_recipe(
    product_id: int,
    payload: ProductRecipeSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = inventory_service.save_product_recipe(db, product_id, payload)
    return APIResponse(data=recipe, message="Product recipe and food cost saved successfully")
