import logging
from sqlalchemy.orm import Session
from app.models.branch import Branch
from app.models.category import Category
from app.models.featured import FeaturedSection
from app.models.menu import Menu
from app.models.product import Product
from app.models.qr import QRCode
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.dashboard import AdminDashboardStats, OwnerDashboardStats

logger = logging.getLogger(__name__)

class DashboardService:
    def get_admin_stats(self, db: Session) -> AdminDashboardStats:
        total_restaurants = db.query(Restaurant).filter(Restaurant.is_deleted.is_(False)).count()
        total_branches = db.query(Branch).filter(Branch.is_deleted.is_(False)).count()
        total_products = db.query(Product).filter(Product.is_deleted.is_(False)).count()
        total_menus = db.query(Menu).filter(Menu.is_deleted.is_(False)).count()
        total_qr_codes = db.query(QRCode).filter(QRCode.is_deleted.is_(False)).count()
        active_restaurants = db.query(Restaurant).filter(Restaurant.status == "ACTIVE", Restaurant.is_deleted.is_(False)).count()
        suspended_restaurants = db.query(Restaurant).filter(Restaurant.status == "SUSPENDED", Restaurant.is_deleted.is_(False)).count()

        return AdminDashboardStats(
            total_restaurants=total_restaurants,
            total_branches=total_branches,
            total_products=total_products,
            total_menus=total_menus,
            total_qr_codes=total_qr_codes,
            active_restaurants=active_restaurants,
            suspended_restaurants=suspended_restaurants,
        )

    def get_owner_stats(self, db: Session, user: User, branch_id: int | None = None) -> OwnerDashboardStats:
        restaurant = db.query(Restaurant).filter(Restaurant.owner_id == user.id, Restaurant.is_deleted.is_(False)).first()
        if not restaurant and user.restaurant_id:
            restaurant = db.query(Restaurant).filter(Restaurant.id == user.restaurant_id, Restaurant.is_deleted.is_(False)).first()

        if not restaurant:
            return OwnerDashboardStats(
                total_branches=0,
                total_categories=0,
                total_products=0,
                total_menus=0,
                total_qr_codes=0,
                total_featured=0,
                max_branches=3,
            )

        rest_id = restaurant.id
        total_branches = db.query(Branch).filter(Branch.restaurant_id == rest_id, Branch.is_deleted.is_(False)).count()

        cat_q = db.query(Category).filter(Category.restaurant_id == rest_id, Category.is_deleted.is_(False))
        prod_q = db.query(Product).filter(Product.restaurant_id == rest_id, Product.is_deleted.is_(False))
        menu_q = db.query(Menu).filter(Menu.restaurant_id == rest_id, Menu.is_deleted.is_(False))
        qr_q = db.query(QRCode).filter(QRCode.restaurant_id == rest_id, QRCode.is_deleted.is_(False))
        feat_q = db.query(FeaturedSection).filter(FeaturedSection.restaurant_id == rest_id, FeaturedSection.is_deleted.is_(False))

        if branch_id:
            cat_q = cat_q.filter(Category.branch_id == branch_id)
            prod_q = prod_q.filter(Product.branch_id == branch_id)
            menu_q = menu_q.filter(Menu.branch_id == branch_id)
            qr_q = qr_q.filter(QRCode.branch_id == branch_id)
            feat_q = feat_q.filter(FeaturedSection.branch_id == branch_id)

        return OwnerDashboardStats(
            total_branches=total_branches,
            total_categories=cat_q.count(),
            total_products=prod_q.count(),
            total_menus=menu_q.count(),
            total_qr_codes=qr_q.count(),
            total_featured=feat_q.count(),
            max_branches=restaurant.max_branches,
        )
