import type { BranchModel } from "@/app/models/branch.model";

export interface BranchDto {
  id?: string;
  _id?: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  logo?: string | null;
  cover_image?: string | null;
  coverImage?: string | null;
  is_main?: boolean;
  isMain?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ImportCatalogRequestDto {
  source_branch_id: string;
  target_branch_id: string;
  include_categories_and_products: boolean;
  include_menus: boolean;
  include_featured: boolean;
}

// Mappers
export function mapBranchDtoToModel(dto: BranchDto): BranchModel {
  const resolvedId = String(dto.id || dto._id || '');
  return {
    id: resolvedId,
    _id: resolvedId,
    name: dto.name,
    address: dto.address ?? undefined,
    phone: dto.phone ?? undefined,
    logo: dto.logo ?? undefined,
    coverImage: dto.cover_image || dto.coverImage || undefined,
    isMain: Boolean(dto.is_main ?? dto.isMain ?? false),
    status: (dto.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapImportCatalogInputToDto(input: {
  sourceBranchId: string;
  targetBranchId: string;
  includeCategoriesAndProducts: boolean;
  includeMenus: boolean;
  includeFeatured: boolean;
}): ImportCatalogRequestDto {
  return {
    source_branch_id: input.sourceBranchId,
    target_branch_id: input.targetBranchId,
    include_categories_and_products: input.includeCategoriesAndProducts,
    include_menus: input.includeMenus,
    include_featured: input.includeFeatured,
  };
}
