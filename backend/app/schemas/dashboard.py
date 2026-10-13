from pydantic import BaseModel

class AdminDashboardStats(BaseModel):
    total_restaurants: int
    total_branches: int
    total_products: int
    total_menus: int
    total_qr_codes: int
    active_restaurants: int
    suspended_restaurants: int

class OwnerDashboardStats(BaseModel):
    total_branches: int
    total_categories: int
    total_products: int
    total_menus: int
    total_qr_codes: int
    total_featured: int
    max_branches: int
