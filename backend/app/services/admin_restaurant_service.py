import logging
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.core.security import get_password_hash
from app.models.branch import Branch
from app.models.enums import GeneralStatus, UserRole, UserStatus
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.admin import (
    AdminRestaurantCreate,
    AdminRestaurantItem,
    AdminRestaurantOwner,
)

logger = logging.getLogger(__name__)

class AdminRestaurantService:
    def list_restaurants(self, db: Session) -> list[AdminRestaurantItem]:
        restaurants = (
            db.query(Restaurant)
            .filter(Restaurant.is_deleted.is_(False))
            .order_by(Restaurant.created_at.desc())
            .all()
        )

        items: list[AdminRestaurantItem] = []
        for rest in restaurants:
            branch_count = (
                db.query(func.count(Branch.id))
                .filter(Branch.restaurant_id == rest.id, Branch.is_deleted.is_(False))
                .scalar()
                or 0
            )

            owner_data = None
            if rest.owner:
                owner_data = AdminRestaurantOwner(
                    id=rest.owner.id,
                    name=rest.owner.name,
                    email=rest.owner.email,
                    status=rest.owner.status,
                )

            items.append(
                AdminRestaurantItem(
                    id=rest.id,
                    name=rest.name,
                    owner_id=rest.owner_id,
                    logo=rest.logo or "",
                    cover_image=rest.cover_image or "",
                    status=rest.status,
                    max_branches=rest.max_branches,
                    created_at=rest.created_at,
                    branch_count=branch_count,
                    owner=owner_data,
                )
            )
        return items

    def create_restaurant_with_owner(
        self, db: Session, data: AdminRestaurantCreate
    ) -> AdminRestaurantItem:
        # Check if email is already registered
        existing_user = (
            db.query(User)
            .filter(User.email == data.owner_email.lower(), User.is_deleted.is_(False))
            .first()
        )
        if existing_user:
            raise ConflictException(f"User with email '{data.owner_email}' already exists.")

        try:
            # 1. Create Owner User
            owner = User(
                name=data.owner_name,
                email=data.owner_email.lower(),
                password_hash=get_password_hash(data.owner_password),
                role=UserRole.RESTAURANT_OWNER.value,
                status=UserStatus.ACTIVE.value,
            )
            db.add(owner)
            db.flush()

            # 2. Create Restaurant Tenant
            restaurant = Restaurant(
                name=data.name,
                owner_id=owner.id,
                max_branches=data.max_branches,
                status=GeneralStatus.ACTIVE.value,
            )
            db.add(restaurant)
            db.flush()

            # Link restaurant_id to owner
            owner.restaurant_id = restaurant.id

            # 3. Create Default Main Branch
            main_branch = Branch(
                restaurant_id=restaurant.id,
                name="Main Branch",
                address="Headquarters",
                phone="+1 000 000 0000",
                is_main=True,
                status=GeneralStatus.ACTIVE.value,
            )
            db.add(main_branch)
            db.commit()

            db.refresh(restaurant)
            db.refresh(owner)

            owner_data = AdminRestaurantOwner(
                id=owner.id,
                name=owner.name,
                email=owner.email,
                status=owner.status,
            )

            return AdminRestaurantItem(
                id=restaurant.id,
                name=restaurant.name,
                owner_id=restaurant.owner_id,
                logo=restaurant.logo or "",
                cover_image=restaurant.cover_image or "",
                status=restaurant.status,
                max_branches=restaurant.max_branches,
                created_at=restaurant.created_at,
                branch_count=1,
                owner=owner_data,
            )
        except Exception as e:
            db.rollback()
            logger.error("Failed to create restaurant with owner", exc_info=e)
            raise

    def toggle_restaurant_status(
        self, db: Session, restaurant_id: int, status: str
    ) -> AdminRestaurantItem:
        restaurant = (
            db.query(Restaurant)
            .filter(Restaurant.id == restaurant_id, Restaurant.is_deleted.is_(False))
            .first()
        )
        if not restaurant:
            raise NotFoundException("Restaurant not found")

        restaurant.status = status

        # Sync owner account status
        if restaurant.owner:
            restaurant.owner.status = (
                UserStatus.ACTIVE.value if status == "ACTIVE" else UserStatus.SUSPENDED.value
            )

        db.commit()
        db.refresh(restaurant)

        owner_data = None
        if restaurant.owner:
            owner_data = AdminRestaurantOwner(
                id=restaurant.owner.id,
                name=restaurant.owner.name,
                email=restaurant.owner.email,
                status=restaurant.owner.status,
            )

        branch_count = (
            db.query(func.count(Branch.id))
            .filter(Branch.restaurant_id == restaurant.id, Branch.is_deleted.is_(False))
            .scalar()
            or 0
        )

        return AdminRestaurantItem(
            id=restaurant.id,
            name=restaurant.name,
            owner_id=restaurant.owner_id,
            logo=restaurant.logo or "",
            cover_image=restaurant.cover_image or "",
            status=restaurant.status,
            max_branches=restaurant.max_branches,
            created_at=restaurant.created_at,
            branch_count=branch_count,
            owner=owner_data,
        )

    def update_branch_limit(
        self, db: Session, restaurant_id: int, max_branches: int
    ) -> AdminRestaurantItem:
        restaurant = (
            db.query(Restaurant)
            .filter(Restaurant.id == restaurant_id, Restaurant.is_deleted.is_(False))
            .first()
        )
        if not restaurant:
            raise NotFoundException("Restaurant not found")

        restaurant.max_branches = max_branches
        db.commit()
        db.refresh(restaurant)

        owner_data = None
        if restaurant.owner:
            owner_data = AdminRestaurantOwner(
                id=restaurant.owner.id,
                name=restaurant.owner.name,
                email=restaurant.owner.email,
                status=restaurant.owner.status,
            )

        branch_count = (
            db.query(func.count(Branch.id))
            .filter(Branch.restaurant_id == restaurant.id, Branch.is_deleted.is_(False))
            .scalar()
            or 0
        )

        return AdminRestaurantItem(
            id=restaurant.id,
            name=restaurant.name,
            owner_id=restaurant.owner_id,
            logo=restaurant.logo or "",
            cover_image=restaurant.cover_image or "",
            status=restaurant.status,
            max_branches=restaurant.max_branches,
            created_at=restaurant.created_at,
            branch_count=branch_count,
            owner=owner_data,
        )

    def reset_owner_password(
        self, db: Session, restaurant_id: int, new_password: str
    ) -> str:
        restaurant = (
            db.query(Restaurant)
            .filter(Restaurant.id == restaurant_id, Restaurant.is_deleted.is_(False))
            .first()
        )
        if not restaurant:
            raise NotFoundException("Restaurant not found")

        if not restaurant.owner:
            raise NotFoundException("Restaurant owner not found")

        restaurant.owner.password_hash = get_password_hash(new_password)
        db.commit()
        return f"Password for {restaurant.owner.email} reset successfully."

    def delete_restaurant(self, db: Session, restaurant_id: int) -> None:
        restaurant = (
            db.query(Restaurant)
            .filter(Restaurant.id == restaurant_id, Restaurant.is_deleted.is_(False))
            .first()
        )
        if not restaurant:
            raise NotFoundException("Restaurant not found")

        # Soft delete restaurant
        restaurant.is_deleted = True

        # Soft delete branches
        for b in restaurant.branches:
            b.is_deleted = True

        # Soft delete owner if linked
        if restaurant.owner:
            restaurant.owner.is_deleted = True

        db.commit()
