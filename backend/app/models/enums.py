from enum import Enum

class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    RESTAURANT_OWNER = "RESTAURANT_OWNER"
    BRANCH_MANAGER = "BRANCH_MANAGER"
    STAFF = "STAFF"

class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"

class GeneralStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

class UOMType(str, Enum):
    WEIGHT = "WEIGHT"
    VOLUME = "VOLUME"
    PIECE_COUNT = "PIECE_COUNT"

class InventoryItemType(str, Enum):
    RAW_MATERIAL = "RAW_MATERIAL"
    PREPARED_ITEM = "PREPARED_ITEM"

class PrepBatchStatus(str, Enum):
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"
    FLAGGED = "FLAGGED"

class BatchStatus(str, Enum):
    ACTIVE = "ACTIVE"
    DEPLETED = "DEPLETED"
    EXPIRED = "EXPIRED"

class InventoryTransactionType(str, Enum):
    PURCHASE_IN = "PURCHASE_IN"
    KITCHEN_PREP_CONSUMED = "KITCHEN_PREP_CONSUMED"
    KITCHEN_PREP_PRODUCED = "KITCHEN_PREP_PRODUCED"
    WASTAGE_LOGGED = "WASTAGE_LOGGED"
    SALE_DEDUCTION = "SALE_DEDUCTION"
    MANUAL_ADJUSTMENT = "MANUAL_ADJUSTMENT"

