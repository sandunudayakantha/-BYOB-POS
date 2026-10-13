import os
import sys
from decimal import Decimal
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.enums import UserRole, UserStatus, GeneralStatus
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.branch import Branch
from app.models.category import Category
from app.models.product import Product
from app.models.menu import Menu, MenuItem
from app.models.qr import QRCode
from app.models.featured import FeaturedSection, FeaturedSectionProduct

def seed_database():
    db: Session = SessionLocal()
    try:
        print("[Seed] Seeding initial data into PostgreSQL...")

        # 1. Super Admin
        admin_email = "admin@qrmenu.com"
        admin_pass = "Admin@123456"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name="Super Admin",
                email=admin_email,
                password_hash=get_password_hash(admin_pass),
                role=UserRole.SUPER_ADMIN.value,
                status=UserStatus.ACTIVE.value,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"[Seed] Created Super Admin: {admin_email}")

        # 2. Restaurant Owner
        owner_email = "owner@bistro.com"
        owner_pass = "Owner@123456"
        owner = db.query(User).filter(User.email == owner_email).first()
        if not owner:
            owner = User(
                name="John Doe (Palace Bistro)",
                email=owner_email,
                password_hash=get_password_hash(owner_pass),
                role=UserRole.RESTAURANT_OWNER.value,
                status=UserStatus.ACTIVE.value,
            )
            db.add(owner)
            db.commit()
            db.refresh(owner)
            print(f"[Seed] Created Restaurant Owner: {owner_email}")

        # 3. Restaurant
        restaurant = db.query(Restaurant).filter(Restaurant.owner_id == owner.id).first()
        if not restaurant:
            restaurant = Restaurant(
                name="Palace Gourmet Bistro",
                owner_id=owner.id,
                logo="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
                cover_image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
                max_branches=3,
                status=GeneralStatus.ACTIVE.value,
            )
            db.add(restaurant)
            db.commit()
            db.refresh(restaurant)

            owner.restaurant_id = restaurant.id
            db.commit()
            print(f"[Seed] Created Restaurant: {restaurant.name}")

        # 4. Main Branch & Kandy Branch
        main_branch = db.query(Branch).filter(Branch.restaurant_id == restaurant.id, Branch.is_main.is_(True)).first()
        if not main_branch:
            main_branch = Branch(
                restaurant_id=restaurant.id,
                name="Main Branch - Colombo",
                address="77 Galle Road, Colombo 03",
                phone="+94 11 234 5678",
                logo=restaurant.logo,
                cover_image=restaurant.cover_image,
                is_main=True,
                status=GeneralStatus.ACTIVE.value,
            )
            db.add(main_branch)

            kandy_branch = Branch(
                restaurant_id=restaurant.id,
                name="Kandy Hilltop Branch",
                address="12 Temple Street, Kandy",
                phone="+94 81 234 5678",
                is_main=False,
                status=GeneralStatus.ACTIVE.value,
            )
            db.add(kandy_branch)
            db.commit()
            db.refresh(main_branch)
            print(f"[Seed] Created Branches: {main_branch.name}, {kandy_branch.name}")

        # 5. Categories
        existing_cats = db.query(Category).filter(Category.branch_id == main_branch.id).all()
        if not existing_cats:
            cat_beverages = Category(restaurant_id=restaurant.id, branch_id=main_branch.id, name="Beverages & Coffee", sort_order=1)
            cat_burgers = Category(restaurant_id=restaurant.id, branch_id=main_branch.id, name="Gourmet Burgers", sort_order=2)
            cat_pizzas = Category(restaurant_id=restaurant.id, branch_id=main_branch.id, name="Italian Pizzas", sort_order=3)
            cat_desserts = Category(restaurant_id=restaurant.id, branch_id=main_branch.id, name="Decadent Desserts", sort_order=4)
            db.add_all([cat_beverages, cat_burgers, cat_pizzas, cat_desserts])
            db.commit()
            db.refresh(cat_beverages)
            db.refresh(cat_burgers)
            db.refresh(cat_pizzas)
            db.refresh(cat_desserts)

            # 6. Products
            p1 = Product(
                restaurant_id=restaurant.id,
                branch_id=main_branch.id,
                category_id=cat_beverages.id,
                name="Artisanal Iced Cappuccino",
                description="Freshly pulled double espresso over cold milk with velvet foam.",
                image="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80",
                prep_time="5-10 mins",
                available=True,
            )
            p2 = Product(
                restaurant_id=restaurant.id,
                branch_id=main_branch.id,
                category_id=cat_burgers.id,
                name="Truffle Wagyu Beef Burger",
                description="Black Angus Wagyu patty, black truffle aioli, aged cheddar, arugula on brioche.",
                image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
                prep_time="15-20 mins",
                available=True,
            )
            p3 = Product(
                restaurant_id=restaurant.id,
                branch_id=main_branch.id,
                category_id=cat_pizzas.id,
                name="Woodfired Truffle & Mushroom Pizza",
                description="Mozzarella di bufala, wild mushrooms, white truffle oil, fresh basil.",
                image="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
                prep_time="15 mins",
                available=True,
            )
            db.add_all([p1, p2, p3])
            db.commit()
            db.refresh(p1)
            db.refresh(p2)
            db.refresh(p3)

            # 7. Menus
            menu = Menu(
                restaurant_id=restaurant.id,
                branch_id=main_branch.id,
                name="Standard Dining Menu",
                description="Our regular daily dining menu.",
                status=GeneralStatus.ACTIVE.value,
                is_base_menu=True,
            )
            db.add(menu)
            db.commit()
            db.refresh(menu)

            # 8. Menu Items
            item1 = MenuItem(menu_id=menu.id, product_id=p1.id, price=Decimal("650.00"), sort_order=1)
            item2 = MenuItem(menu_id=menu.id, product_id=p2.id, price=Decimal("2450.00"), sort_order=2)
            item3 = MenuItem(menu_id=menu.id, product_id=p3.id, price=Decimal("2100.00"), sort_order=3)
            db.add_all([item1, item2, item3])
            db.commit()

            # 9. QR Code
            qr = QRCode(
                restaurant_id=restaurant.id,
                branch_id=main_branch.id,
                menu_id=menu.id,
                token="DEMO1234",
                table_name="Table #05 (Window View)",
                is_active=True,
            )
            db.add(qr)
            db.commit()

        print("================================================")
        print("✅ PostgreSQL Seed Completed Successfully!")
        print(f"🔐 Super Admin Login : {admin_email} / {admin_pass}")
        print(f"🔐 Owner Login       : {owner_email} / {owner_pass}")
        print("📱 Demo QR Menu Token : DEMO1234")
        print("================================================")
    except Exception as e:
        db.rollback()
        print(f"[Seed Error] {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
