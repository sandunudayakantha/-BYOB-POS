from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session
from app.core.exceptions import AuthorizationException, BadRequestException, NotFoundException
from app.models.enums import BatchStatus, InventoryItemType, InventoryTransactionType, PrepBatchStatus
from app.models.inventory import (
    InventoryItem,
    InventoryTransaction,
    KitchenPrepBatch,
    KitchenPrepDefinition,
    ProductRecipeItem,
    RawInventoryBatch,
    Supplier,
    UnitOfMeasure,
)
from app.models.product import Product
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemUpdate,
    KitchenPrepBatchCreate,
    KitchenPrepDefinitionCreate,
    KitchenPrepDefinitionUpdate,
    ProductRecipeSaveRequest,
    RawInventoryBatchCreate,
    SupplierCreate,
    SupplierUpdate,
    UnitOfMeasureCreate,
)

import logging
from app.repositories.uom_repo import UnitOfMeasureRepository
from app.repositories.supplier_repo import SupplierRepository
from app.repositories.inventory_item_repo import InventoryItemRepository

logger = logging.getLogger(__name__)

class InventoryService:
    def __init__(self) -> None:
        self.uom_repo = UnitOfMeasureRepository()
        self.supplier_repo = SupplierRepository()
        self.item_repo = InventoryItemRepository()

    # ----------------- UOM Operations -----------------
    def list_uoms(self, db: Session, restaurant_id: int) -> list[UnitOfMeasure]:
        return self.uom_repo._active_query(db).filter(
            UnitOfMeasure.restaurant_id == restaurant_id
        ).order_by(UnitOfMeasure.name.asc()).all()

    def create_uom(self, db: Session, restaurant_id: int, payload: UnitOfMeasureCreate) -> UnitOfMeasure:
        data = {
            "restaurant_id": restaurant_id,
            "name": payload.name,
            "symbol": payload.symbol,
            "uom_type": payload.uom_type,
            "base_unit_id": payload.base_unit_id,
            "conversion_factor": payload.conversion_factor,
        }
        return self.uom_repo.create(db, data)

    # ----------------- Supplier Operations -----------------
    def list_suppliers(self, db: Session, branch_id: int) -> list[Supplier]:
        return self.supplier_repo._active_query(db).filter(
            Supplier.branch_id == branch_id
        ).order_by(Supplier.name.asc()).all()


    def create_supplier(self, db: Session, restaurant_id: int, branch_id: int, payload: SupplierCreate) -> Supplier:
        supplier = Supplier(
            restaurant_id=restaurant_id,
            branch_id=branch_id,
            name=payload.name,
            contact_person=payload.contact_person,
            phone=payload.phone,
            email=payload.email,
            address=payload.address,
            is_active=payload.is_active,
        )
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        return supplier

    def update_supplier(
        self,
        db: Session,
        supplier_id: int,
        payload: SupplierUpdate,
        restaurant_id: int | None = None,
        is_super_admin: bool = False,
    ) -> Supplier:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.is_deleted == False).first()
        if not supplier:
            raise NotFoundException("Supplier not found")
        if not is_super_admin and restaurant_id is not None and supplier.restaurant_id != restaurant_id:
            raise AuthorizationException("Not authorized to modify this supplier")
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(supplier, k, v)
        db.commit()
        db.refresh(supplier)
        return supplier

    def delete_supplier(
        self,
        db: Session,
        supplier_id: int,
        restaurant_id: int | None = None,
        is_super_admin: bool = False,
    ) -> None:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.is_deleted == False).first()
        if not supplier:
            raise NotFoundException("Supplier not found")
        if not is_super_admin and restaurant_id is not None and supplier.restaurant_id != restaurant_id:
            raise AuthorizationException("Not authorized to delete this supplier")
        supplier.is_deleted = True
        db.commit()

    # ----------------- Inventory Items Operations -----------------
    def list_inventory_items(self, db: Session, branch_id: int, item_type: Optional[str] = None) -> list[dict]:
        query = db.query(InventoryItem).filter(
            InventoryItem.branch_id == branch_id,
            InventoryItem.is_deleted == False
        )
        if item_type:
            query = query.filter(InventoryItem.item_type == item_type)
        items = query.order_by(InventoryItem.name.asc()).all()

        results = []
        for it in items:
            results.append({
                "id": it.id,
                "restaurant_id": it.restaurant_id,
                "branch_id": it.branch_id,
                "supplier_id": it.supplier_id,
                "supplier_name": it.supplier.name if it.supplier else None,
                "uom_id": it.uom_id,
                "uom_symbol": it.uom.symbol if it.uom else None,
                "uom_name": it.uom.name if it.uom else None,
                "name": it.name,
                "sku": it.sku or "",
                "item_type": it.item_type,
                "current_stock": it.current_stock,
                "reorder_threshold": it.reorder_threshold,
                "unit_cost": it.unit_cost,
                "is_active": it.is_active,
            })
        return results

    def create_inventory_item(self, db: Session, restaurant_id: int, branch_id: int, payload: InventoryItemCreate) -> InventoryItem:
        item = InventoryItem(
            restaurant_id=restaurant_id,
            branch_id=branch_id,
            supplier_id=payload.supplier_id,
            uom_id=payload.uom_id,
            name=payload.name,
            sku=payload.sku,
            item_type=payload.item_type,
            current_stock=payload.current_stock,
            reorder_threshold=payload.reorder_threshold,
            unit_cost=payload.unit_cost,
            is_active=payload.is_active,
        )
        db.add(item)
        db.commit()
        db.refresh(item)

        # Log initial stock transaction and batch if current_stock > 0
        if payload.current_stock > 0:
            batch = RawInventoryBatch(
                inventory_item_id=item.id,
                branch_id=branch_id,
                supplier_id=payload.supplier_id,
                batch_number="BATCH-INIT",
                quantity_received=payload.current_stock,
                quantity_remaining=payload.current_stock,
                unit_cost=payload.unit_cost,
                received_date=date.today(),
                expiry_date=None,
                status=BatchStatus.ACTIVE.value,
                notes="Initial stock inward",
            )
            db.add(batch)

            tx = InventoryTransaction(
                inventory_item_id=item.id,
                branch_id=branch_id,
                transaction_type=InventoryTransactionType.PURCHASE_IN.value,
                quantity_delta=payload.current_stock,
                unit_cost_at_time=payload.unit_cost,
                notes="Initial stock inward",
            )
            db.add(tx)
            db.commit()

        return item

    def update_inventory_item(
        self,
        db: Session,
        item_id: int,
        payload: InventoryItemUpdate,
        restaurant_id: int | None = None,
        is_super_admin: bool = False,
    ) -> InventoryItem:
        item = db.query(InventoryItem).filter(InventoryItem.id == item_id, InventoryItem.is_deleted == False).first()
        if not item:
            raise NotFoundException("Inventory item not found")
        if not is_super_admin and restaurant_id is not None and item.restaurant_id != restaurant_id:
            raise AuthorizationException("Not authorized to modify this inventory item")

        old_stock = item.current_stock
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(item, k, v)
        db.commit()

        # If stock adjusted manually
        if payload.current_stock is not None and payload.current_stock != old_stock:
            diff = payload.current_stock - old_stock
            tx = InventoryTransaction(
                inventory_item_id=item.id,
                branch_id=item.branch_id,
                transaction_type=InventoryTransactionType.MANUAL_ADJUSTMENT.value,
                quantity_delta=diff,
                unit_cost_at_time=item.unit_cost,
                notes="Manual stock count adjustment",
            )
            db.add(tx)
            db.commit()

        db.refresh(item)
        return item

    def delete_inventory_item(
        self,
        db: Session,
        item_id: int,
        restaurant_id: int | None = None,
        is_super_admin: bool = False,
    ) -> None:
        item = db.query(InventoryItem).filter(InventoryItem.id == item_id, InventoryItem.is_deleted == False).first()
        if not item:
            raise NotFoundException("Inventory item not found")
        if not is_super_admin and restaurant_id is not None and item.restaurant_id != restaurant_id:
            raise AuthorizationException("Not authorized to delete this inventory item")
        item.is_deleted = True
        db.commit()

    # ----------------- Raw Inventory Batches Operations -----------------
    def add_stock_batch(
        self, db: Session, branch_id: int, item_id: int, payload: RawInventoryBatchCreate
    ) -> RawInventoryBatch:
        item = db.query(InventoryItem).filter(
            InventoryItem.id == item_id,
            InventoryItem.branch_id == branch_id,
            InventoryItem.is_deleted == False
        ).first()
        if not item:
            raise NotFoundException("Inventory item not found")

        # Parse received_date and expiry_date
        rec_date = date.today()
        if payload.received_date:
            try:
                rec_date = datetime.strptime(payload.received_date, "%Y-%m-%d").date()
            except ValueError:
                rec_date = date.today()

        exp_date = None
        if payload.expiry_date:
            try:
                exp_date = datetime.strptime(payload.expiry_date, "%Y-%m-%d").date()
            except ValueError:
                exp_date = None

        batch_no = payload.batch_number.strip() if payload.batch_number else ""
        if not batch_no:
            batch_no = f"BAT-{datetime.now().strftime('%y%m%d%H%M%S')}"

        batch = RawInventoryBatch(
            inventory_item_id=item.id,
            branch_id=branch_id,
            supplier_id=payload.supplier_id or item.supplier_id,
            batch_number=batch_no,
            quantity_received=payload.quantity,
            quantity_remaining=payload.quantity,
            unit_cost=payload.unit_cost,
            received_date=rec_date,
            expiry_date=exp_date,
            status=BatchStatus.ACTIVE.value,
            notes=payload.notes or "",
        )
        db.add(batch)

        # Update InventoryItem current stock & weighted average unit cost
        total_old_cost = item.current_stock * item.unit_cost
        new_batch_cost = payload.quantity * payload.unit_cost
        new_total_stock = item.current_stock + payload.quantity

        if new_total_stock > 0:
            weighted_cost = (total_old_cost + new_batch_cost) / new_total_stock
            item.unit_cost = round(weighted_cost, 2)

        item.current_stock = new_total_stock
        if payload.supplier_id:
            item.supplier_id = payload.supplier_id

        # Record InventoryTransaction
        tx = InventoryTransaction(
            inventory_item_id=item.id,
            branch_id=branch_id,
            transaction_type=InventoryTransactionType.PURCHASE_IN.value,
            quantity_delta=payload.quantity,
            unit_cost_at_time=payload.unit_cost,
            reference_id=batch_no,
            notes=f"Inward Batch {batch_no}" + (f" | Exp: {exp_date}" if exp_date else ""),
        )
        db.add(tx)

        db.commit()
        db.refresh(batch)
        return batch

    def list_item_batches(
        self,
        db: Session,
        item_id: int,
        restaurant_id: int | None = None,
        is_super_admin: bool = False,
    ) -> list[dict]:
        item = db.query(InventoryItem).filter(InventoryItem.id == item_id, InventoryItem.is_deleted == False).first()
        if not item:
            raise NotFoundException("Inventory item not found")
        if not is_super_admin and restaurant_id is not None and item.restaurant_id != restaurant_id:
            raise AuthorizationException("Not authorized to view batches for this inventory item")

        batches = db.query(RawInventoryBatch).filter(
            RawInventoryBatch.inventory_item_id == item_id,
            RawInventoryBatch.is_deleted == False
        ).order_by(
            RawInventoryBatch.status.asc(),
            RawInventoryBatch.expiry_date.asc().nullslast(),
            RawInventoryBatch.received_date.asc()
        ).all()

        results = []
        for b in batches:
            results.append({
                "id": b.id,
                "inventory_item_id": b.inventory_item_id,
                "branch_id": b.branch_id,
                "supplier_id": b.supplier_id,
                "supplier_name": b.supplier.name if b.supplier else None,
                "batch_number": b.batch_number,
                "quantity_received": b.quantity_received,
                "quantity_remaining": b.quantity_remaining,
                "unit_cost": b.unit_cost,
                "received_date": b.received_date.isoformat() if b.received_date else "",
                "expiry_date": b.expiry_date.isoformat() if b.expiry_date else None,
                "status": b.status,
                "notes": b.notes or "",
                "created_at": b.created_at.isoformat() if b.created_at else "",
            })
        return results

    # ----------------- Kitchen Prep Definitions Operations -----------------
    def list_prep_definitions(self, db: Session, branch_id: int, raw_item_id: Optional[int] = None) -> list[dict]:
        query = db.query(KitchenPrepDefinition).filter(
            KitchenPrepDefinition.branch_id == branch_id,
            KitchenPrepDefinition.is_deleted == False
        )
        if raw_item_id:
            query = query.filter(KitchenPrepDefinition.base_raw_item_id == raw_item_id)
        preps = query.order_by(KitchenPrepDefinition.name.asc()).all()

        results = []
        for p in preps:
            results.append({
                "id": p.id,
                "restaurant_id": p.restaurant_id,
                "branch_id": p.branch_id,
                "name": p.name,
                "description": p.description or "",
                "base_raw_item_id": p.base_raw_item_id,
                "base_raw_item_name": p.base_raw_item.name if p.base_raw_item else None,
                "base_raw_item_uom_symbol": p.base_raw_item.uom.symbol if p.base_raw_item and p.base_raw_item.uom else "",
                "output_item_id": p.output_item_id,
                "output_item_name": p.output_item.name if p.output_item else p.name,
                "uom_id": p.uom_id or (p.base_raw_item.uom_id if p.base_raw_item else None),
                "uom_symbol": p.uom.symbol if p.uom else (p.base_raw_item.uom.symbol if p.base_raw_item and p.base_raw_item.uom else ""),
                "portion_size_value": p.portion_size_value,
                "portion_size_uom_id": p.portion_size_uom_id,
                "portion_size_uom_symbol": p.portion_size_uom.symbol if p.portion_size_uom else None,
                "current_stock": p.current_stock,
                "unit_cost": p.unit_cost,
                "expected_yield_percent": p.expected_yield_percent,
                "requires_image_evidence": p.requires_image_evidence,
                "track_wastage": p.track_wastage,
                "requires_wastage_image": p.requires_wastage_image,
            })
        return results

    def create_prep_definition(
        self, db: Session, restaurant_id: int, branch_id: int, payload: KitchenPrepDefinitionCreate
    ) -> KitchenPrepDefinition:
        base_raw = db.query(InventoryItem).filter(
            InventoryItem.id == payload.base_raw_item_id,
            InventoryItem.is_deleted == False
        ).first()
        if not base_raw:
            raise NotFoundException("Source raw material not found")

        uom_id = payload.uom_id or base_raw.uom_id

        prep = KitchenPrepDefinition(
            restaurant_id=restaurant_id,
            branch_id=branch_id,
            name=payload.name,
            description=payload.description,
            base_raw_item_id=payload.base_raw_item_id,
            output_item_id=payload.output_item_id,
            uom_id=uom_id,
            current_stock=Decimal("0.000"),
            unit_cost=base_raw.unit_cost,
            expected_yield_percent=payload.expected_yield_percent,
            portion_size_value=payload.portion_size_value,
            portion_size_uom_id=payload.portion_size_uom_id,
            requires_image_evidence=payload.requires_image_evidence,
            track_wastage=payload.track_wastage,
            requires_wastage_image=payload.requires_wastage_image,
        )
        db.add(prep)
        db.commit()
        db.refresh(prep)
        return prep

    def update_prep_definition(
        self,
        db: Session,
        prep_id: int,
        payload: KitchenPrepDefinitionUpdate,
        restaurant_id: int | None = None,
        is_super_admin: bool = False,
    ) -> KitchenPrepDefinition:
        prep = db.query(KitchenPrepDefinition).filter(
            KitchenPrepDefinition.id == prep_id, KitchenPrepDefinition.is_deleted == False
        ).first()
        if not prep:
            raise NotFoundException("Kitchen prep definition not found")
        if not is_super_admin and restaurant_id is not None and prep.restaurant_id != restaurant_id:
            raise AuthorizationException("Not authorized to modify this prep definition")
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(prep, k, v)
        db.commit()
        db.refresh(prep)
        return prep

    def delete_prep_definition(
        self,
        db: Session,
        prep_id: int,
        restaurant_id: int | None = None,
        is_super_admin: bool = False,
    ) -> None:
        prep = db.query(KitchenPrepDefinition).filter(
            KitchenPrepDefinition.id == prep_id, KitchenPrepDefinition.is_deleted == False
        ).first()
        if not prep:
            raise NotFoundException("Kitchen prep definition not found")
        if not is_super_admin and restaurant_id is not None and prep.restaurant_id != restaurant_id:
            raise AuthorizationException("Not authorized to delete this prep definition")
        prep.is_deleted = True
        db.commit()

    # ----------------- Kitchen Prep Batch Execution -----------------
    def log_prep_batch(
        self, db: Session, branch_id: int, user_id: int, payload: KitchenPrepBatchCreate
    ) -> KitchenPrepBatch:
        prep_def = db.query(KitchenPrepDefinition).filter(
            KitchenPrepDefinition.id == payload.prep_definition_id,
            KitchenPrepDefinition.is_deleted == False
        ).first()
        if not prep_def:
            raise NotFoundException("Prep definition not found")

        # Validate mandatory image evidence if required by admin definition
        if prep_def.requires_image_evidence and not payload.prep_image_url:
            raise BadRequestException("A photo of the prepared batch is required as evidence.")

        # Validate wastage rules if required
        if prep_def.track_wastage:
            if payload.wastage_quantity is None or payload.wastage_quantity < 0:
                raise BadRequestException("Wastage quantity must be recorded for this prep.")
            if prep_def.requires_wastage_image and not payload.wastage_image_url:
                raise BadRequestException("A photo of the wastage/trimmings is required.")

        raw_item = prep_def.base_raw_item
        output_item = prep_def.output_item

        if raw_item.current_stock < payload.raw_input_quantity:
            raise BadRequestException(f"Insufficient stock for {raw_item.name}. Available: {raw_item.current_stock}")

        # Compute unit cost for prepped item: (raw_input_qty * raw_item.unit_cost) / actual_yield_quantity
        total_batch_cost = payload.raw_input_quantity * raw_item.unit_cost
        unit_cost = total_batch_cost / payload.actual_yield_quantity if payload.actual_yield_quantity > 0 else Decimal("0.00")

        # 1. Deduct raw item stock and deplete batches automatically via FEFO/FIFO
        raw_item.current_stock -= payload.raw_input_quantity
        tx_out = InventoryTransaction(
            inventory_item_id=raw_item.id,
            branch_id=branch_id,
            transaction_type=InventoryTransactionType.KITCHEN_PREP_CONSUMED.value,
            quantity_delta=-payload.raw_input_quantity,
            unit_cost_at_time=raw_item.unit_cost,
            notes=f"Used for prep batch: {prep_def.name}",
        )
        db.add(tx_out)

        # Deplete batches sequentially: earliest expiry date first, then earliest received date (FEFO / FIFO)
        needed_qty = payload.raw_input_quantity
        active_batches = db.query(RawInventoryBatch).filter(
            RawInventoryBatch.inventory_item_id == raw_item.id,
            RawInventoryBatch.status == BatchStatus.ACTIVE.value,
            RawInventoryBatch.quantity_remaining > 0,
            RawInventoryBatch.is_deleted == False
        ).order_by(
            RawInventoryBatch.expiry_date.asc().nullslast(),
            RawInventoryBatch.received_date.asc(),
            RawInventoryBatch.id.asc()
        ).all()

        for b in active_batches:
            if needed_qty <= 0:
                break
            if b.quantity_remaining <= needed_qty:
                needed_qty -= b.quantity_remaining
                b.quantity_remaining = Decimal("0.000")
                b.status = BatchStatus.DEPLETED.value
            else:
                b.quantity_remaining -= needed_qty
                needed_qty = Decimal("0.000")

        # 2. Add output prepared item stock and update its unit cost
        if output_item:
            output_item.current_stock += payload.actual_yield_quantity
            output_item.unit_cost = round(unit_cost, 2)
            tx_in = InventoryTransaction(
                inventory_item_id=output_item.id,
                branch_id=branch_id,
                transaction_type=InventoryTransactionType.KITCHEN_PREP_PRODUCED.value,
                quantity_delta=payload.actual_yield_quantity,
                unit_cost_at_time=round(unit_cost, 2),
                notes=f"Batch produced from {raw_item.name}",
            )
            db.add(tx_in)

        # Update prep definition direct stock tracking
        prep_def.current_stock += payload.actual_yield_quantity
        prep_def.unit_cost = round(unit_cost, 2)

        # 3. If wastage recorded, log transaction
        if payload.wastage_quantity and payload.wastage_quantity > 0:
            tx_waste = InventoryTransaction(
                inventory_item_id=raw_item.id,
                branch_id=branch_id,
                transaction_type=InventoryTransactionType.WASTAGE_LOGGED.value,
                quantity_delta=payload.wastage_quantity,
                unit_cost_at_time=raw_item.unit_cost,
                notes=f"Wastage on prep {prep_def.name}: {payload.wastage_reason or ''}",
            )
            db.add(tx_waste)

        # 4. Save batch record
        batch = KitchenPrepBatch(
            prep_definition_id=prep_def.id,
            branch_id=branch_id,
            prepared_by_user_id=user_id,
            raw_input_quantity=payload.raw_input_quantity,
            actual_yield_quantity=payload.actual_yield_quantity,
            wastage_quantity=payload.wastage_quantity or Decimal("0.000"),
            wastage_reason=payload.wastage_reason or "",
            prep_image_url=payload.prep_image_url or "",
            wastage_image_url=payload.wastage_image_url or "",
            calculated_unit_cost=round(unit_cost, 2),
            status=PrepBatchStatus.COMPLETED.value,
        )
        db.add(batch)
        db.commit()
        db.refresh(batch)
        return batch

    def list_prep_batches(self, db: Session, branch_id: int) -> list[dict]:
        batches = db.query(KitchenPrepBatch).filter(
            KitchenPrepBatch.branch_id == branch_id,
            KitchenPrepBatch.is_deleted == False
        ).order_by(KitchenPrepBatch.created_at.desc()).all()

        results = []
        for b in batches:
            prep = b.prep_definition
            raw = prep.base_raw_item if prep else None
            results.append({
                "id": b.id,
                "prep_definition_id": b.prep_definition_id,
                "prep_definition_name": prep.name if prep else None,
                "base_raw_item_id": prep.base_raw_item_id if prep else None,
                "base_raw_item_name": raw.name if raw else None,
                "base_raw_item_uom_symbol": raw.uom.symbol if (raw and raw.uom) else "",
                "output_uom_symbol": prep.uom.symbol if (prep and prep.uom) else (raw.uom.symbol if (raw and raw.uom) else ""),
                "branch_id": b.branch_id,
                "prepared_by_user_id": b.prepared_by_user_id,
                "prepared_by_name": b.prepared_by.name if b.prepared_by else "Staff",
                "raw_input_quantity": b.raw_input_quantity,
                "actual_yield_quantity": b.actual_yield_quantity,
                "wastage_quantity": b.wastage_quantity,
                "wastage_reason": b.wastage_reason or "",
                "prep_image_url": b.prep_image_url or "",
                "wastage_image_url": b.wastage_image_url or "",
                "calculated_unit_cost": b.calculated_unit_cost,
                "status": b.status,
                "created_at": b.created_at.isoformat() if b.created_at else "",
            })
        return results

    # ----------------- Product Recipe Operations -----------------
    def get_product_recipe(
        self,
        db: Session,
        product_id: int,
        restaurant_id: int | None = None,
        is_super_admin: bool = False,
    ) -> list[dict]:
        prod = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
        if not prod:
            raise NotFoundException("Product not found")
        if not is_super_admin and restaurant_id is not None and prod.restaurant_id != restaurant_id:
            raise AuthorizationException("Not authorized to view recipe for this product")

        items = db.query(ProductRecipeItem).filter(
            ProductRecipeItem.product_id == product_id,
            ProductRecipeItem.is_deleted == False
        ).all()

        results = []
        for it in items:
            inv = it.inventory_item
            uom = it.uom
            # Calculate cost factoring in UOM conversion and wastage
            base_unit_cost = inv.unit_cost if inv else Decimal("0.00")
            # Quantity adjusted for UOM conversion factor (e.g. 100g = 0.1kg if item costed per kg)
            conversion = uom.conversion_factor if uom else Decimal("1.0000")
            effective_qty = it.quantity * conversion
            waste_multiplier = Decimal("1.0") + (it.wastage_factor_percent / Decimal("100.0"))
            calculated_cost = effective_qty * base_unit_cost * waste_multiplier

            results.append({
                "id": it.id,
                "product_id": it.product_id,
                "inventory_item_id": it.inventory_item_id,
                "inventory_item_name": inv.name if inv else None,
                "inventory_item_type": inv.item_type if inv else None,
                "uom_id": it.uom_id,
                "uom_symbol": uom.symbol if uom else None,
                "quantity": it.quantity,
                "wastage_factor_percent": it.wastage_factor_percent,
                "unit_cost_at_time": base_unit_cost,
                "calculated_ingredient_cost": round(calculated_cost, 2),
            })
        return results

    def save_product_recipe(
        self,
        db: Session,
        product_id: int,
        payload: ProductRecipeSaveRequest,
        restaurant_id: int | None = None,
        is_super_admin: bool = False,
    ) -> list[dict]:
        prod = db.query(Product).filter(Product.id == product_id, Product.is_deleted == False).first()
        if not prod:
            raise NotFoundException("Product not found")
        if not is_super_admin and restaurant_id is not None and prod.restaurant_id != restaurant_id:
            raise AuthorizationException("Not authorized to modify recipe for this product")

        # Soft delete existing recipe items
        db.query(ProductRecipeItem).filter(
            ProductRecipeItem.product_id == product_id,
            ProductRecipeItem.is_deleted == False
        ).update({"is_deleted": True})

        # Add new recipe items
        for ing in payload.ingredients:
            recipe_item = ProductRecipeItem(
                product_id=product_id,
                inventory_item_id=ing.inventory_item_id,
                uom_id=ing.uom_id,
                quantity=ing.quantity,
                wastage_factor_percent=ing.wastage_factor_percent or Decimal("0.00"),
            )
            db.add(recipe_item)

        db.commit()
        return self.get_product_recipe(db, product_id, restaurant_id=restaurant_id, is_super_admin=is_super_admin)
