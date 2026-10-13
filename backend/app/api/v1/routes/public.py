from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.core.exceptions import NotFoundException
from app.models.category import Category
from app.models.featured import FeaturedSection
from app.models.menu import MenuItem
from app.models.product import Product
from app.repositories.menu_repo import MenuRepository
from app.repositories.qr_repo import QRCodeRepository
from app.schemas.common import APIResponse

router = APIRouter()
qr_repo = QRCodeRepository()
menu_repo = MenuRepository()

@router.get("/menu/{token}", response_model=APIResponse[dict])
def get_public_menu(
    token: str,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    categoryId: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    qr = qr_repo.get_by_token(db, token)
    if not qr or not qr.is_active:
        raise NotFoundException("QR code or digital menu not found")

    menu = menu_repo.get(db, qr.menu_id)
    if not menu:
        raise NotFoundException("Associated menu not found")

    restaurant = qr.restaurant
    branch = qr.branch

    # Active categories for branch
    categories = (
        db.query(Category)
        .filter(
            Category.branch_id == qr.branch_id,
            Category.status == "ACTIVE",
            Category.is_deleted == False,
        )
        .order_by(Category.sort_order.asc(), Category.created_at.asc())
        .all()
    )

    # Base query for menu items
    query = (
        db.query(MenuItem)
        .join(Product, MenuItem.product_id == Product.id)
        .filter(
            MenuItem.menu_id == menu.id,
            MenuItem.is_deleted == False,
            MenuItem.available == True,
            Product.is_deleted == False,
            Product.available == True,
        )
    )

    # Filter by category if specified and not 'ALL'
    if categoryId and categoryId != "ALL":
        try:
            cat_id_int = int(categoryId)
            query = query.filter(Product.category_id == cat_id_int)
        except (ValueError, TypeError):
            pass

    # Filter by search keyword
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(term),
                Product.description.ilike(term),
            )
        )

    total_items = query.count()
    total_pages = max(1, (total_items + limit - 1) // limit) if total_items > 0 else 1

    paginated_menu_items = (
        query.order_by(MenuItem.sort_order.asc(), MenuItem.created_at.asc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    # Active featured sections (only on page 1 and without active search/category filter)
    featured_sections_data = []
    if page == 1 and not search and (not categoryId or categoryId == "ALL"):
        now = datetime.now(timezone.utc)
        featured_sections = (
            db.query(FeaturedSection)
            .filter(
                FeaturedSection.branch_id == qr.branch_id,
                FeaturedSection.is_active == True,
                FeaturedSection.is_deleted == False,
                or_(FeaturedSection.start_date == None, FeaturedSection.start_date <= now),
                or_(FeaturedSection.end_date == None, FeaturedSection.end_date >= now),
            )
            .all()
        )

        for sec in featured_sections:
            prods = []
            for p in sec.products:
                if p.available and not p.is_deleted:
                    prods.append({
                        "_id": p.id,
                        "name": p.name,
                        "description": p.description or "",
                        "image": p.image or "",
                        "category": {
                            "_id": p.category_id,
                            "name": p.category.name if p.category else "",
                        } if p.category else None,
                    })
            if prods:
                featured_sections_data.append({
                    "_id": sec.id,
                    "title": sec.title,
                    "description": sec.description or "",
                    "products": prods,
                })

    return APIResponse(
        data={
            "tableName": qr.table_name or "",
            "restaurant": {
                "_id": restaurant.id if restaurant else qr.restaurant_id,
                "name": restaurant.name if restaurant else "",
                "logo": restaurant.logo if restaurant else "",
            },
            "branch": {
                "_id": branch.id if branch else qr.branch_id,
                "name": branch.name if branch else "",
                "address": branch.address if branch else "",
                "phone": branch.phone if branch else "",
                "logo": branch.logo if branch else "",
                "coverImage": branch.cover_image if branch else "",
            },
            "menu": {
                "_id": menu.id,
                "name": menu.name,
                "description": menu.description or "",
            },
            "categories": [
                {
                    "_id": c.id,
                    "name": c.name,
                    "sortOrder": c.sort_order,
                }
                for c in categories
            ],
            "menuItems": [
                {
                    "_id": item.id,
                    "price": float(item.price),
                    "available": item.available,
                    "sortOrder": item.sort_order,
                    "product": {
                        "_id": item.product.id,
                        "name": item.product.name,
                        "description": item.product.description or "",
                        "image": item.product.image or "",
                        "prepTime": item.product.prep_time or "15-20 mins",
                        "available": item.product.available,
                        "category": {
                            "_id": item.product.category_id,
                            "name": item.product.category.name if item.product.category else "",
                        } if item.product.category else None,
                    } if item.product else None,
                }
                for item in paginated_menu_items
            ],
            "featuredSections": featured_sections_data,
            "meta": {
                "total": total_items,
                "page": page,
                "limit": limit,
                "totalPages": total_pages,
                "hasMore": page < total_pages,
            },
        },
        message="Public menu retrieved successfully",
    )

