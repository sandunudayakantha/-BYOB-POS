import os
import sys
from datetime import date, timedelta
from decimal import Decimal

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.enums import (
    BatchStatus,
    GeneralStatus,
    InventoryItemType,
    PrepBatchStatus,
    UOMType,
    UserRole,
    UserStatus,
)
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.branch import Branch
from app.models.category import Category
from app.models.product import Product
from app.models.menu import Menu, MenuItem
from app.models.qr import QRCode
from app.models.inventory import (
    InventoryItem,
    KitchenPrepBatch,
    KitchenPrepDefinition,
    ProductRecipeItem,
    RawInventoryBatch,
    Supplier,
    UnitOfMeasure,
)
from app.services.rbac_seed_service import sync_rbac_seed


def seed_owner_and_sample_dataset():
    db: Session = SessionLocal()
    try:
        print("[1/8] Ensuring RBAC seeds are present...")
        sync_rbac_seed(db)

        # ----------------------------------------------------
        # 1. Create / Get Restaurant Owner
        # ----------------------------------------------------
        owner_email = "marcus.owner@artisangrill.com"
        owner_pass = "Password@123"
        print(f"[2/8] Setting up Restaurant Owner: {owner_email}...")

        owner = db.query(User).filter(User.email == owner_email).first()
        if not owner:
            owner = User(
                name="Marcus Vance",
                email=owner_email,
                password_hash=get_password_hash(owner_pass),
                role=UserRole.RESTAURANT_OWNER.value,
                status=UserStatus.ACTIVE.value,
            )
            db.add(owner)
            db.commit()
            db.refresh(owner)
            print(f"      -> Created new Owner (ID: {owner.id})")
        else:
            owner.password_hash = get_password_hash(owner_pass)
            owner.status = UserStatus.ACTIVE.value
            db.commit()
            print(f"      -> Existing Owner updated (ID: {owner.id})")

        # ----------------------------------------------------
        # 2. Restaurant
        # ----------------------------------------------------
        print("[3/8] Setting up Restaurant...")
        restaurant = db.query(Restaurant).filter(Restaurant.owner_id == owner.id).first()
        if not restaurant:
            restaurant = Restaurant(
                name="The Artisan Smokehouse & Grill",
                owner_id=owner.id,
                logo="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
                cover_image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
                max_branches=5,
                status=GeneralStatus.ACTIVE.value,
            )
            db.add(restaurant)
            db.commit()
            db.refresh(restaurant)
            owner.restaurant_id = restaurant.id
            db.commit()
            print(f"      -> Created Restaurant: {restaurant.name} (ID: {restaurant.id})")
        else:
            restaurant.name = "The Artisan Smokehouse & Grill"
            restaurant.status = GeneralStatus.ACTIVE.value
            owner.restaurant_id = restaurant.id
            db.commit()
            print(f"      -> Using Restaurant (ID: {restaurant.id})")

        # ----------------------------------------------------
        # 3. Branches (Downtown Main & Coastal Second)
        # ----------------------------------------------------
        print("[4/8] Setting up Branches...")
        main_branch = db.query(Branch).filter(Branch.restaurant_id == restaurant.id, Branch.is_main.is_(True)).first()
        if not main_branch:
            main_branch = Branch(
                restaurant_id=restaurant.id,
                name="Artisan Downtown",
                address="45 Guildford Crescent, Colombo 07",
                phone="+94 11 268 9011",
                logo=restaurant.logo,
                cover_image=restaurant.cover_image,
                is_main=True,
                status=GeneralStatus.ACTIVE.value,
            )
            db.add(main_branch)
            db.commit()
            db.refresh(main_branch)
            print(f"      -> Created Main Branch: {main_branch.name} (ID: {main_branch.id})")

        coastal_branch = db.query(Branch).filter(Branch.restaurant_id == restaurant.id, Branch.is_main.is_(False)).first()
        if not coastal_branch:
            coastal_branch = Branch(
                restaurant_id=restaurant.id,
                name="Artisan Coastal",
                address="18 Church Street, Galle Fort",
                phone="+94 91 223 4455",
                logo=restaurant.logo,
                cover_image=restaurant.cover_image,
                is_main=False,
                status=GeneralStatus.ACTIVE.value,
            )
            db.add(coastal_branch)
            db.commit()
            db.refresh(coastal_branch)
            print(f"      -> Created Coastal Branch: {coastal_branch.name} (ID: {coastal_branch.id})")

        # ----------------------------------------------------
        # 4. Units of Measure (UOM)
        # ----------------------------------------------------
        print("[5/8] Setting up Inventory Units of Measure...")
        uom_defs = [
            ("Kilogram", "kg", UOMType.WEIGHT.value, Decimal("1.0000"), None),
            ("Gram", "g", UOMType.WEIGHT.value, Decimal("0.0010"), "Kilogram"),
            ("Liter", "L", UOMType.VOLUME.value, Decimal("1.0000"), None),
            ("Milliliter", "mL", UOMType.VOLUME.value, Decimal("0.0010"), "Liter"),
            ("Portion", "portion", UOMType.PIECE_COUNT.value, Decimal("1.0000"), None),
            ("Piece", "pc", UOMType.PIECE_COUNT.value, Decimal("1.0000"), None),
        ]
        uom_map: dict[str, UnitOfMeasure] = {}
        for name, sym, u_type, conv, _ in uom_defs:
            uom = db.query(UnitOfMeasure).filter(
                UnitOfMeasure.restaurant_id == restaurant.id,
                UnitOfMeasure.symbol == sym,
            ).first()
            if not uom:
                uom = UnitOfMeasure(
                    restaurant_id=restaurant.id,
                    name=name,
                    symbol=sym,
                    uom_type=u_type,
                    conversion_factor=conv,
                )
                db.add(uom)
                db.commit()
                db.refresh(uom)
            uom_map[sym] = uom

        # Link base units
        for name, sym, _, _, base_name in uom_defs:
            if base_name:
                uom = uom_map[sym]
                base_sym = "kg" if base_name == "Kilogram" else "L"
                uom.base_unit_id = uom_map[base_sym].id
                db.commit()

        # ----------------------------------------------------
        # 5. Suppliers & Raw Inventory Items & Batches
        # ----------------------------------------------------
        print("[6/8] Setting up Suppliers and Inventory Items...")
        supplier_data = [
            ("Prime Angus Ranch Meats", "David Miller", "+94 11 556 7788", "orders@primeangus.lk", "Negombo Meat Hub"),
            ("Valley Organic Dairy & Cheese", "Sarah Fernando", "+94 52 222 3456", "supply@valleydairy.lk", "Nuwara Eliya Farms"),
            ("Artisan Brioche Bakery Co.", "Kasun Perera", "+94 11 432 1098", "bakes@artisanbrioche.lk", "Colombo Central"),
            ("Ceylon Spices & Smoke Woods", "Rohan Silva", "+94 77 123 4567", "woods@ceylonspice.lk", "Matale Spice Valley"),
        ]
        supplier_map: dict[str, Supplier] = {}
        for s_name, contact, phone, email, addr in supplier_data:
            supp = db.query(Supplier).filter(
                Supplier.restaurant_id == restaurant.id,
                Supplier.branch_id == main_branch.id,
                Supplier.name == s_name,
            ).first()
            if not supp:
                supp = Supplier(
                    restaurant_id=restaurant.id,
                    branch_id=main_branch.id,
                    name=s_name,
                    contact_person=contact,
                    phone=phone,
                    email=email,
                    address=addr,
                    is_active=True,
                )
                db.add(supp)
                db.commit()
                db.refresh(supp)
            supplier_map[s_name] = supp

        # Inventory Items
        items_spec = [
            ("Prime Angus Ribeye Steak", "RAW-STEAK-01", InventoryItemType.RAW_MATERIAL.value, "kg", "Prime Angus Ranch Meats", Decimal("45.0"), Decimal("10.0"), Decimal("4800.00")),
            ("Smoked Wagyu Brisket", "RAW-BRISKET-01", InventoryItemType.RAW_MATERIAL.value, "kg", "Prime Angus Ranch Meats", Decimal("35.0"), Decimal("8.0"), Decimal("3200.00")),
            ("Artisan Brioche Buns", "BAKE-BUN-01", InventoryItemType.RAW_MATERIAL.value, "pc", "Artisan Brioche Bakery Co.", Decimal("150.0"), Decimal("30.0"), Decimal("95.00")),
            ("Aged White Cheddar Block", "DAIRY-CHED-01", InventoryItemType.RAW_MATERIAL.value, "kg", "Valley Organic Dairy & Cheese", Decimal("18.0"), Decimal("5.0"), Decimal("2100.00")),
            ("Russet Idaho Potatoes", "PROD-POT-01", InventoryItemType.RAW_MATERIAL.value, "kg", "Valley Organic Dairy & Cheese", Decimal("120.0"), Decimal("25.0"), Decimal("320.00")),
            ("Black Truffle Infused Oil", "OIL-TRUFF-01", InventoryItemType.RAW_MATERIAL.value, "mL", "Ceylon Spices & Smoke Woods", Decimal("3000.0"), Decimal("500.0"), Decimal("5.50")),
            ("Bourbon Infusion Blend", "BAR-BOURB-01", InventoryItemType.RAW_MATERIAL.value, "mL", "Ceylon Spices & Smoke Woods", Decimal("5000.0"), Decimal("1000.0"), Decimal("8.50")),
            ("Single Origin Espresso Beans", "COF-BEAN-01", InventoryItemType.RAW_MATERIAL.value, "kg", "Ceylon Spices & Smoke Woods", Decimal("25.0"), Decimal("5.0"), Decimal("3600.00")),
        ]
        item_map: dict[str, InventoryItem] = {}
        for name, sku, itype, sym, s_name, stock, thresh, cost in items_spec:
            inv_item = db.query(InventoryItem).filter(
                InventoryItem.restaurant_id == restaurant.id,
                InventoryItem.branch_id == main_branch.id,
                InventoryItem.name == name,
            ).first()
            if not inv_item:
                inv_item = InventoryItem(
                    restaurant_id=restaurant.id,
                    branch_id=main_branch.id,
                    supplier_id=supplier_map[s_name].id,
                    uom_id=uom_map[sym].id,
                    name=name,
                    sku=sku,
                    item_type=itype,
                    current_stock=stock,
                    reorder_threshold=thresh,
                    unit_cost=cost,
                    is_active=True,
                )
                db.add(inv_item)
                db.commit()
                db.refresh(inv_item)

                # Add initial stock batch
                batch = RawInventoryBatch(
                    inventory_item_id=inv_item.id,
                    branch_id=main_branch.id,
                    supplier_id=supplier_map[s_name].id,
                    batch_number=f"BATCH-2026-{inv_item.id:03d}",
                    quantity_received=stock,
                    quantity_remaining=stock,
                    unit_cost=cost,
                    received_date=date.today() - timedelta(days=2),
                    expiry_date=date.today() + timedelta(days=60),
                    status=BatchStatus.ACTIVE.value,
                    notes="Initial warehouse receipt batch",
                )
                db.add(batch)
                db.commit()
            item_map[name] = inv_item

        # Kitchen Prep Definitions & Batches
        prep_sauce = db.query(KitchenPrepDefinition).filter(
            KitchenPrepDefinition.restaurant_id == restaurant.id,
            KitchenPrepDefinition.name == "House Bourbon BBQ Glaze Prep",
        ).first()
        if not prep_sauce:
            prep_sauce = KitchenPrepDefinition(
                restaurant_id=restaurant.id,
                branch_id=main_branch.id,
                name="House Bourbon BBQ Glaze Prep",
                description="Slow-simmered smoky bourbon BBQ glaze infused with smoked brisket drippings.",
                base_raw_item_id=item_map["Bourbon Infusion Blend"].id,
                uom_id=uom_map["mL"].id,
                current_stock=Decimal("1500.0"),
                unit_cost=Decimal("10.50"),
                expected_yield_percent=Decimal("92.00"),
                portion_size_value=Decimal("50.0"),
                portion_size_uom_id=uom_map["mL"].id,
                track_wastage=True,
            )
            db.add(prep_sauce)
            db.commit()
            db.refresh(prep_sauce)

            # Log sample prep batch
            pbatch = KitchenPrepBatch(
                prep_definition_id=prep_sauce.id,
                branch_id=main_branch.id,
                prepared_by_user_id=owner.id,
                raw_input_quantity=Decimal("1000.0"),
                actual_yield_quantity=Decimal("920.0"),
                wastage_quantity=Decimal("80.0"),
                wastage_reason="Reduction boil-off and pot strain residue",
                calculated_unit_cost=Decimal("10.50"),
                status=PrepBatchStatus.COMPLETED.value,
            )
            db.add(pbatch)
            db.commit()

        # ----------------------------------------------------
        # 6. Categories & Products
        # ----------------------------------------------------
        print("[7/8] Setting up Categories, Products & Recipes...")
        cat_data = [
            ("Signature Steaks & Grills", 1),
            ("Craft Smokehouse Burgers", 2),
            ("Wood-Fired Sides & Starters", 3),
            ("Artisan Cocktails & Brews", 4),
        ]
        cat_map: dict[str, Category] = {}
        for cname, sort_order in cat_data:
            cat = db.query(Category).filter(
                Category.restaurant_id == restaurant.id,
                Category.branch_id == main_branch.id,
                Category.name == cname,
            ).first()
            if not cat:
                cat = Category(
                    restaurant_id=restaurant.id,
                    branch_id=main_branch.id,
                    name=cname,
                    sort_order=sort_order,
                )
                db.add(cat)
                db.commit()
                db.refresh(cat)
            cat_map[cname] = cat

        products_spec = [
            (
                "Prime Tomahawk Ribeye (800g)",
                "Signature Steaks & Grills",
                "Dry-aged bone-in Tomahawk ribeye, flame-seared with smoked sea salt and black truffle butter.",
                "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80",
                "25-30 mins",
                Decimal("9800.00"),
                [
                    ("Prime Angus Ribeye Steak", "kg", Decimal("0.850")),
                    ("Black Truffle Infused Oil", "mL", Decimal("20.000")),
                ],
            ),
            (
                "Smoked Wagyu Brisket Burger",
                "Craft Smokehouse Burgers",
                "14-hour hickory smoked wagyu brisket, melted aged white cheddar, pickled shallots on toasted brioche.",
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
                "15 mins",
                Decimal("3200.00"),
                [
                    ("Artisan Brioche Buns", "pc", Decimal("1.000")),
                    ("Smoked Wagyu Brisket", "kg", Decimal("0.220")),
                    ("Aged White Cheddar Block", "kg", Decimal("0.050")),
                ],
            ),
            (
                "Charred Truffle Parmesan Wedges",
                "Wood-Fired Sides & Starters",
                "Hand-cut Idaho russet wedges, tossed in white truffle oil, rosemary, and 24-month aged parmesan.",
                "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
                "12 mins",
                Decimal("1450.00"),
                [
                    ("Russet Idaho Potatoes", "kg", Decimal("0.300")),
                    ("Black Truffle Infused Oil", "mL", Decimal("15.000")),
                ],
            ),
            (
                "Smoked Oak Bourbon Old Fashioned",
                "Artisan Cocktails & Brews",
                "Small-batch bourbon, charred oak smoke, aromatic bitters, and torched orange peel.",
                "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
                "5 mins",
                Decimal("2200.00"),
                [
                    ("Bourbon Infusion Blend", "mL", Decimal("60.000")),
                ],
            ),
            (
                "Nitro Espresso Cold Brew",
                "Artisan Cocktails & Brews",
                "24-hour slow steep single origin arabica charged with nitrogen for a velvety stout-like crema.",
                "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
                "3 mins",
                Decimal("850.00"),
                [
                    ("Single Origin Espresso Beans", "kg", Decimal("0.035")),
                ],
            ),
        ]

        created_products: list[tuple[Product, Decimal]] = []
        for pname, cname, desc, img, prep_time, price, recipe_items in products_spec:
            prod = db.query(Product).filter(
                Product.restaurant_id == restaurant.id,
                Product.branch_id == main_branch.id,
                Product.name == pname,
            ).first()
            if not prod:
                prod = Product(
                    restaurant_id=restaurant.id,
                    branch_id=main_branch.id,
                    category_id=cat_map[cname].id,
                    name=pname,
                    description=desc,
                    image=img,
                    prep_time=prep_time,
                    available=True,
                )
                db.add(prod)
                db.commit()
                db.refresh(prod)

                # Add recipe items
                for r_item_name, r_sym, r_qty in recipe_items:
                    rec_item = ProductRecipeItem(
                        product_id=prod.id,
                        inventory_item_id=item_map[r_item_name].id,
                        uom_id=uom_map[r_sym].id,
                        quantity=r_qty,
                        wastage_factor_percent=Decimal("5.00"),
                    )
                    db.add(rec_item)
                db.commit()
            created_products.append((prod, price))

        # ----------------------------------------------------
        # 7. Menus & Menu Items & QR Code
        # ----------------------------------------------------
        print("[8/8] Setting up Menus, Pricing & QR Codes...")
        menu = db.query(Menu).filter(
            Menu.restaurant_id == restaurant.id,
            Menu.branch_id == main_branch.id,
            Menu.name == "Artisan All-Day Smokehouse Dining",
        ).first()
        if not menu:
            menu = Menu(
                restaurant_id=restaurant.id,
                branch_id=main_branch.id,
                name="Artisan All-Day Smokehouse Dining",
                description="Chef Marcus's hand-crafted smokehouse steaks, brisket burgers, and barrel-aged cocktails.",
                status=GeneralStatus.ACTIVE.value,
                is_base_menu=True,
            )
            db.add(menu)
            db.commit()
            db.refresh(menu)

            for idx, (prod, price) in enumerate(created_products, start=1):
                m_item = MenuItem(
                    menu_id=menu.id,
                    product_id=prod.id,
                    price=price,
                    sort_order=idx,
                )
                db.add(m_item)
            db.commit()

        # QR Codes for Dining Tables
        tables = [
            ("ARTISAN-T01", "Table #01 (Fireplace Lounge)"),
            ("ARTISAN-T02", "Table #02 (Patio Pergola)"),
            ("ARTISAN-BAR", "Bar Counter #04"),
        ]
        for token, table_name in tables:
            qr = db.query(QRCode).filter(QRCode.token == token).first()
            if not qr:
                qr = QRCode(
                    restaurant_id=restaurant.id,
                    branch_id=main_branch.id,
                    menu_id=menu.id,
                    token=token,
                    table_name=table_name,
                    is_active=True,
                )
                db.add(qr)
        db.commit()

        print("\n" + "=" * 65)
        print("🎉 SAMPLE DATASET SEEDED SUCCESSFULLY!")
        print("=" * 65)
        print(f"👤 Owner Credentials  : {owner_email}")
        print(f"🔑 Owner Password     : {owner_pass}")
        print(f"🏪 Restaurant Name    : {restaurant.name}")
        print(f"🏢 Main Branch        : {main_branch.name} (Colombo 07)")
        print(f"🏢 Second Branch      : {coastal_branch.name} (Galle Fort)")
        print(f"📋 Menu Name          : {menu.name}")
        print(f"🍔 Products Seeded    : {len(products_spec)} signature items with recipes")
        print(f"📦 Inventory Items    : {len(items_spec)} items with stock & batches")
        print(f"🏭 Prep Definitions   : 1 kitchen prep with yield tracking")
        print("📱 Public QR Tokens   : ARTISAN-T01, ARTISAN-T02, ARTISAN-BAR")
        print("=" * 65)

    except Exception as e:
        db.rollback()
        print(f"❌ [Seeding Failed]: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_owner_and_sample_dataset()
