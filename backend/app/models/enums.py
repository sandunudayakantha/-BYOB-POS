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
