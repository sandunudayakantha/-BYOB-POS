from fastapi import APIRouter
from app.api.v1.routes import (
    admin,
    auth,
    branches,
    categories,
    featured,
    health,
    menu_items,
    menus,
    owner,
    products,
    public,
    qr,
    restaurants,
)

v1_router = APIRouter()

v1_router.include_router(health.router, prefix="/health", tags=["Health"])
v1_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
v1_router.include_router(admin.router, prefix="/admin", tags=["Super Admin"])
v1_router.include_router(owner.router, prefix="/owner", tags=["Restaurant Owner"])
v1_router.include_router(restaurants.router, prefix="/restaurants", tags=["Restaurants"])
v1_router.include_router(branches.router, prefix="/branches", tags=["Branches"])
v1_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
v1_router.include_router(products.router, prefix="/products", tags=["Products"])
v1_router.include_router(menus.router, prefix="/menus", tags=["Menus"])
v1_router.include_router(menu_items.router, prefix="/menu-items", tags=["Menu Items"])
v1_router.include_router(qr.router, prefix="/qr", tags=["QR Codes"])
v1_router.include_router(featured.router, prefix="/featured", tags=["Featured Sections"])
v1_router.include_router(public.router, prefix="/public", tags=["Public Menu"])
