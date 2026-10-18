import type {
  CustomerMenuResponseModel,
  CustomerProductModel,
  CustomerMenuItemModel,
  CustomerCategoryModel,
  CustomerFeaturedSectionModel,
} from "@/app/models/customer-menu.model";

export interface CustomerProductDto {
  _id?: string;
  id?: string;
  name: string;
  description?: string | null;
  price?: number;
  image?: string | null;
}

export interface CustomerMenuItemDto {
  _id?: string;
  id?: string;
  price?: number;
  product?: CustomerProductDto;
  name?: string;
  category?: string;
  image?: string | null;
}

export interface CustomerCategoryDto {
  _id?: string;
  id?: string;
  name: string;
  icon?: string | null;
}

export interface CustomerFeaturedSectionDto {
  _id?: string;
  id?: string;
  title: string;
  products?: CustomerProductDto[];
}

export interface CustomerMenuDto {
  restaurant?: {
    name: string;
    logo?: string | null;
    cover_image?: string | null;
    coverImage?: string | null;
  };
  branch?: {
    name: string;
    phone?: string | null;
    address?: string | null;
    cover_image?: string | null;
    coverImage?: string | null;
    logo?: string | null;
  };
  menu?: {
    name: string;
    description?: string;
  };
  table_name?: string;
  tableName?: string;
  categories?: CustomerCategoryDto[];
  featured_sections?: CustomerFeaturedSectionDto[];
  featuredSections?: CustomerFeaturedSectionDto[];
  items?: CustomerMenuItemDto[];
  menu_items?: CustomerMenuItemDto[];
  menuItems?: CustomerMenuItemDto[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
    totalPages?: number;
    has_more?: boolean;
    hasMore?: boolean;
  };
}

export function mapCustomerProductDtoToModel(dto: CustomerProductDto): CustomerProductModel {
  const resolvedId = String(dto._id || dto.id || "");
  return {
    _id: resolvedId,
    id: resolvedId,
    name: dto.name || "",
    description: dto.description || null,
    price: dto.price !== undefined ? Number(dto.price) : undefined,
    image: dto.image || null,
  };
}

export function mapCustomerMenuItemDtoToModel(dto: CustomerMenuItemDto): CustomerMenuItemModel {
  const resolvedId = String(dto._id || dto.id || "");
  const price = Number(dto.price || 0);
  const prod: CustomerProductModel = dto.product
    ? mapCustomerProductDtoToModel(dto.product)
    : {
        _id: resolvedId,
        id: resolvedId,
        name: dto.name || "",
        price: price,
        image: dto.image || null,
      };

  return {
    _id: resolvedId,
    price,
    product: prod,
  };
}

export function mapCustomerCategoryDtoToModel(dto: CustomerCategoryDto): CustomerCategoryModel {
  const resolvedId = String(dto._id || dto.id || "");
  return {
    _id: resolvedId,
    id: resolvedId,
    name: dto.name || "",
    icon: dto.icon || null,
  };
}

export function mapCustomerFeaturedSectionDtoToModel(
  dto: CustomerFeaturedSectionDto
): CustomerFeaturedSectionModel {
  const resolvedId = String(dto._id || dto.id || "");
  return {
    _id: resolvedId,
    title: dto.title || "",
    products: (dto.products || []).map(mapCustomerProductDtoToModel),
  };
}

export function mapCustomerMenuDtoToModel(dto: CustomerMenuDto): CustomerMenuResponseModel {
  const rawItems = dto.menuItems || dto.menu_items || dto.items || [];
  const rawCategories = dto.categories || [];
  const rawFeatured = dto.featuredSections || dto.featured_sections || [];
  const rawMeta = dto.meta || {};

  return {
    restaurant: dto.restaurant
      ? {
          name: dto.restaurant.name,
          logo: dto.restaurant.logo || null,
          coverImage: dto.restaurant.coverImage || dto.restaurant.cover_image || null,
        }
      : undefined,
    branch: dto.branch
      ? {
          name: dto.branch.name,
          phone: dto.branch.phone || null,
          address: dto.branch.address || null,
          coverImage: dto.branch.coverImage || dto.branch.cover_image || null,
          logo: dto.branch.logo || null,
        }
      : undefined,
    menu: dto.menu
      ? {
          name: dto.menu.name,
          description: dto.menu.description,
        }
      : undefined,
    tableName: dto.tableName || dto.table_name || undefined,
    categories: rawCategories.map(mapCustomerCategoryDtoToModel),
    featuredSections: rawFeatured.map(mapCustomerFeaturedSectionDtoToModel),
    menuItems: rawItems.map(mapCustomerMenuItemDtoToModel),
    meta: {
      page: Number(rawMeta.page || 1),
      limit: Number(rawMeta.limit || 10),
      total: Number(rawMeta.total || rawItems.length),
      totalPages: Number(rawMeta.totalPages || rawMeta.total_pages || 1),
      hasMore: Boolean(rawMeta.hasMore ?? rawMeta.has_more ?? false),
    },
  };
}
