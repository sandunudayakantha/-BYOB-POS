import type { ProductModel, CategoryModel, RecipeItemModel } from "@/app/models/product.model";

export interface ProductDto {
  id?: string;
  _id?: string;
  name: string;
  description?: string | null;
  price?: number;
  image_url?: string | null;
  image?: string | null;
  category_id?: string | null;
  categoryId?: string | null;
  category_name?: string | null;
  categoryName?: string | null;
  category?: CategoryDto | { id?: number | string; name?: string } | null;
  branch_id?: string | null;
  branchId?: string | null;
  available?: boolean;
  is_available?: boolean;
  prep_time?: string | null;
  prepTime?: string | null;
  recipe_item_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CategoryDto {
  id?: string;
  _id?: string;
  name: string;
  description?: string | null;
  branch_id?: string | null;
  branchId?: string | null;
  is_active?: boolean;
  isActive?: boolean;
  display_order?: number;
}

export interface RecipeItemDto {
  id?: string;
  product_id?: string;
  raw_item_id?: number | null;
  prep_definition_id?: number | null;
  quantity_required: number;
  uom_symbol?: string | null;
  name?: string | null;
}

export interface CreateProductRequestDto {
  name: string;
  categoryId: string;
  description?: string;
  prepTime?: string;
  available: boolean;
  branchId: string;
  image?: string | File;
}

export interface UpdateProductRequestDto {
  name?: string;
  categoryId?: string;
  description?: string;
  prepTime?: string;
  available?: boolean;
  image?: string | File;
}

export interface CreateCategoryRequestDto {
  name: string;
  branchId: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequestDto {
  name: string;
  sortOrder?: number;
}

export function mapCreateCategoryInputToDto(input: {
  name: string;
  branchId: string;
  sortOrder?: number;
}): { name: string; branchId: string; sortOrder?: number } {
  return {
    name: input.name.trim(),
    branchId: input.branchId,
    sortOrder: input.sortOrder ?? 0,
  };
}

export function mapUpdateCategoryInputToDto(input: {
  name: string;
  sortOrder?: number;
}): { name: string; sortOrder?: number } {
  return {
    name: input.name.trim(),
    sortOrder: input.sortOrder ?? 0,
  };
}

// Mappers
export function mapProductDtoToModel(dto: ProductDto): ProductModel {
  const resolvedId = String(dto.id || dto._id || '');
  const resolvedCategoryName =
    dto.category_name ||
    dto.categoryName ||
    dto.category?.name ||
    undefined;

  return {
    id: resolvedId,
    _id: resolvedId,
    name: dto.name,
    description: dto.description ?? undefined,
    price: dto.price ? Number(dto.price) : undefined,
    imageUrl: dto.image_url || dto.image || undefined,
    image: dto.image || dto.image_url || undefined,
    categoryId: String(dto.category_id || dto.categoryId || (dto.category as any)?.id || ''),
    categoryName: resolvedCategoryName,
    branchId: String(dto.branch_id || dto.branchId || ''),
    available: dto.available ?? dto.is_available ?? true,
    prepTime: dto.prep_time || dto.prepTime || undefined,
    recipeItemCount: dto.recipe_item_count ?? 0,
    createdAt: dto.created_at ?? undefined,
    updatedAt: dto.updated_at ?? undefined,
  };
}

export function mapCategoryDtoToModel(dto: CategoryDto): CategoryModel {
  const resolvedId = String(dto.id || dto._id || '');
  return {
    id: resolvedId,
    _id: resolvedId,
    name: dto.name,
    description: dto.description ?? undefined,
    branchId: String(dto.branch_id || dto.branchId || ''),
    isActive: dto.is_active ?? dto.isActive ?? true,
    displayOrder: dto.display_order ?? 0,
  };
}

export function mapRecipeItemDtoToModel(dto: RecipeItemDto): RecipeItemModel {
  return {
    id: dto.id,
    productId: String(dto.product_id || ''),
    rawItemId: dto.raw_item_id ?? undefined,
    prepDefinitionId: dto.prep_definition_id ?? undefined,
    quantityRequired: Number(dto.quantity_required),
    uomSymbol: dto.uom_symbol ?? undefined,
    name: dto.name ?? undefined,
  };
}
