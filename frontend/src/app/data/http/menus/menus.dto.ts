import type { MenuModel, MenuItemModel } from "@/app/models/menu.model";

export interface MenuItemDto {
  id?: string;
  _id?: string;
  menu_id?: string;
  menuId?: string;
  product_id?: string;
  productId?: string;
  product_name?: string;
  category_id?: string;
  category_name?: string;
  price: number;
  is_available?: boolean;
  available?: boolean;
  display_order?: number;
}

export interface MenuDto {
  id?: string;
  _id?: string;
  branch_id?: string;
  branchId?: string;
  name: string;
  description?: string | null;
  status?: string;
  is_base_menu?: boolean;
  isBaseMenu?: boolean;
  item_count?: number;
  items?: MenuItemDto[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateMenuRequestDto {
  name: string;
  branch_id: string;
  description?: string;
  status?: string;
  is_base_menu?: boolean;
}

export interface UpdateMenuRequestDto {
  name: string;
  description?: string;
  status?: string;
  is_base_menu?: boolean;
}

export interface AdjustMenuPricesRequestDto {
  percentage: number;
  source_mode: string;
}

export interface FillMissingItemsRequestDto {
  percentage: number;
  overwrite_existing: boolean;
}

export interface AddMenuItemRequestDto {
  menu_id: string;
  product_id: string;
  price: number;
}

export interface UpdateMenuItemRequestDto {
  price?: number;
  is_available?: boolean;
}

export interface ReorderMenuItemsRequestDto {
  items: { id: string; display_order: number }[];
}

export function mapAddMenuItemInputToDto(input: {
  menuId: string;
  productId: string;
  price: number;
}): AddMenuItemRequestDto {
  return {
    menu_id: input.menuId,
    product_id: input.productId,
    price: Number(input.price),
  };
}

export function mapUpdateMenuItemInputToDto(input: {
  price?: number;
  isAvailable?: boolean;
}): UpdateMenuItemRequestDto {
  return {
    price: input.price !== undefined ? Number(input.price) : undefined,
    is_available: input.isAvailable,
  };
}

export function mapReorderMenuItemsInputToDto(input: {
  items: { id: string; displayOrder: number }[];
}): ReorderMenuItemsRequestDto {
  return {
    items: input.items.map((i) => ({
      id: i.id,
      display_order: i.displayOrder,
    })),
  };
}

// Mappers
export function mapMenuItemDtoToModel(dto: MenuItemDto): MenuItemModel {
  const resolvedId = String(dto.id || dto._id || '');
  return {
    id: resolvedId,
    _id: resolvedId,
    menuId: String(dto.menu_id || dto.menuId || ''),
    productId: String(dto.product_id || dto.productId || ''),
    productName: dto.product_name,
    categoryId: dto.category_id,
    categoryName: dto.category_name,
    price: Number(dto.price || 0),
    isAvailable: dto.is_available ?? dto.available ?? true,
    displayOrder: dto.display_order ?? 0,
  };
}

export function mapMenuDtoToModel(dto: MenuDto): MenuModel {
  const resolvedId = String(dto.id || dto._id || '');
  return {
    id: resolvedId,
    _id: resolvedId,
    branchId: String(dto.branch_id || dto.branchId || ''),
    name: dto.name,
    description: dto.description ?? undefined,
    status: (dto.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
    isBaseMenu: Boolean(dto.is_base_menu ?? dto.isBaseMenu ?? false),
    itemCount: dto.item_count ?? (dto.items ? dto.items.length : 0),
    items: dto.items ? dto.items.map(mapMenuItemDtoToModel) : undefined,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapCreateMenuInputToDto(input: {
  name: string;
  branchId: string;
  description?: string;
  status?: string;
  isBaseMenu?: boolean;
}): CreateMenuRequestDto {
  return {
    name: input.name.trim(),
    branch_id: input.branchId,
    description: input.description?.trim(),
    status: input.status || 'ACTIVE',
    is_base_menu: input.isBaseMenu ?? false,
  };
}

export function mapUpdateMenuInputToDto(input: {
  name: string;
  description?: string;
  status?: string;
  isBaseMenu?: boolean;
}): UpdateMenuRequestDto {
  return {
    name: input.name.trim(),
    description: input.description?.trim(),
    status: input.status || 'ACTIVE',
    is_base_menu: input.isBaseMenu ?? false,
  };
}

export function mapAdjustPricesInputToDto(input: {
  percentage: number;
  sourceMode: string;
}): AdjustMenuPricesRequestDto {
  return {
    percentage: Number(input.percentage),
    source_mode: input.sourceMode,
  };
}

export function mapFillMissingInputToDto(input: {
  percentage: number;
  overwriteExisting: boolean;
}): FillMissingItemsRequestDto {
  return {
    percentage: Number(input.percentage),
    overwrite_existing: Boolean(input.overwriteExisting),
  };
}
