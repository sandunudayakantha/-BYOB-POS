from app.api.deps import require_any_permission, require_exact_permission
from app.api.permissions import (
    BRANCH_MANAGE,
    CATEGORY_MANAGE,
    DASHBOARD_VIEW,
    FEATURED_MANAGE,
    INVENTORY_MANAGE,
    MENU_MANAGE,
    PRODUCT_MANAGE,
    QR_MANAGE,
    RESTAURANT_MANAGE,
    SYSTEM_SETTINGS,
    USERS_MANAGE,
)

require_dashboard_view = require_exact_permission(DASHBOARD_VIEW)
require_inventory_manage = require_exact_permission(INVENTORY_MANAGE)
require_restaurant_manage = require_exact_permission(RESTAURANT_MANAGE)
require_branch_manage = require_exact_permission(BRANCH_MANAGE)
require_menu_manage = require_exact_permission(MENU_MANAGE)
require_product_manage = require_exact_permission(PRODUCT_MANAGE)
require_category_manage = require_exact_permission(CATEGORY_MANAGE)
require_qr_manage = require_exact_permission(QR_MANAGE)
require_featured_manage = require_exact_permission(FEATURED_MANAGE)
require_users_manage = require_exact_permission(USERS_MANAGE)
require_system_settings = require_exact_permission(SYSTEM_SETTINGS)
