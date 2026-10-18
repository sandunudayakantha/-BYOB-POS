from app.models.branch import Branch
from app.models.category import Category
from app.models.enums import (
    GeneralStatus,
    InventoryItemType,
    InventoryTransactionType,
    PrepBatchStatus,
    UOMType,
    UserRole,
    UserStatus,
)
from app.models.featured import FeaturedSection, FeaturedSectionProduct
from app.models.inventory import (
    InventoryItem,
    InventoryTransaction,
    KitchenPrepBatch,
    KitchenPrepDefinition,
    ProductRecipeItem,
    Supplier,
    UnitOfMeasure,
)
from app.models.menu import Menu, MenuItem
from app.models.mixins import IntegerPrimaryKeyMixin, SoftDeleteMixin, TimestampMixin
from app.models.product import Product
from app.models.qr import QRCode
from app.models.rbac import Permission, Role, RolePermission
from app.models.restaurant import Restaurant
from app.models.user import RefreshToken, User

__all__ = [
    "IntegerPrimaryKeyMixin",
    "TimestampMixin",
    "SoftDeleteMixin",
    "UserRole",
    "UserStatus",
    "GeneralStatus",
    "UOMType",
    "InventoryItemType",
    "PrepBatchStatus",
    "InventoryTransactionType",
    "Role",
    "Permission",
    "RolePermission",
    "User",
    "RefreshToken",
    "Restaurant",
    "Branch",
    "Category",
    "Product",
    "Menu",
    "MenuItem",
    "QRCode",
    "FeaturedSection",
    "FeaturedSectionProduct",
    "Supplier",
    "UnitOfMeasure",
    "InventoryItem",
    "KitchenPrepDefinition",
    "KitchenPrepBatch",
    "ProductRecipeItem",
    "InventoryTransaction",
]

from app.audit.recorder import register_invoice_audit  # noqa: E402
register_invoice_audit()  # MUST be last
