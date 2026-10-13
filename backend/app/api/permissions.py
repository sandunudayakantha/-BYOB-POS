# Permission area string constants
DASHBOARD_VIEW = "dashboard.view"
INVENTORY_MANAGE = "inventory.manage"
RESTAURANT_MANAGE = "restaurant.manage"
BRANCH_MANAGE = "branch.manage"
MENU_MANAGE = "menu.manage"
PRODUCT_MANAGE = "product.manage"
CATEGORY_MANAGE = "category.manage"
QR_MANAGE = "qr.manage"
FEATURED_MANAGE = "featured.manage"
USERS_MANAGE = "users.manage"
SYSTEM_SETTINGS = "system.settings"

ALL_PERMISSION_AREAS: frozenset[str] = frozenset({
    DASHBOARD_VIEW,
    INVENTORY_MANAGE,
    RESTAURANT_MANAGE,
    BRANCH_MANAGE,
    MENU_MANAGE,
    PRODUCT_MANAGE,
    CATEGORY_MANAGE,
    QR_MANAGE,
    FEATURED_MANAGE,
    USERS_MANAGE,
    SYSTEM_SETTINGS,
})
