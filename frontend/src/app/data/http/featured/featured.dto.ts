import type { FeaturedSectionModel } from "@/app/models/featured.model";

export interface FeaturedSectionDto {
  id?: string;
  _id?: string;
  branch_id?: string;
  branchId?: string;
  title: string;
  description?: string | null;
  products?: (number | string | { _id?: string; id?: string })[];
  start_date?: string | null;
  startDate?: string | null;
  end_date?: string | null;
  endDate?: string | null;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFeaturedSectionRequestDto {
  title: string;
  branch_id: string;
  description?: string;
  products: number[];
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface UpdateFeaturedSectionRequestDto {
  title?: string;
  description?: string;
  products?: number[];
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export function mapFeaturedSectionDtoToModel(dto: FeaturedSectionDto): FeaturedSectionModel {
  const resolvedId = String(dto.id || dto._id || '');
  const rawProducts = dto.products || [];
  const normalizedProducts = rawProducts.map((p) => {
    if (p && typeof p === 'object') return p.id || p._id || '';
    return p;
  });

  return {
    id: resolvedId,
    _id: resolvedId,
    branchId: String(dto.branch_id || dto.branchId || ''),
    title: dto.title,
    description: dto.description ?? undefined,
    products: normalizedProducts,
    startDate: dto.start_date || dto.startDate || undefined,
    endDate: dto.end_date || dto.endDate || undefined,
    isActive: Boolean(dto.is_active ?? dto.isActive ?? true),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapCreateFeaturedInputToDto(input: {
  title: string;
  branchId: string;
  description?: string;
  products: (number | string)[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}): CreateFeaturedSectionRequestDto {
  const numericProducts = (input.products || [])
    .map((p) => parseInt(String(p), 10))
    .filter((id) => !isNaN(id));

  return {
    title: input.title.trim(),
    branch_id: input.branchId,
    description: input.description?.trim(),
    products: numericProducts,
    start_date: input.startDate || undefined,
    end_date: input.endDate || undefined,
    is_active: input.isActive ?? true,
  };
}

export function mapUpdateFeaturedInputToDto(input: {
  title?: string;
  description?: string;
  products?: (number | string)[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}): UpdateFeaturedSectionRequestDto {
  const numericProducts = input.products
    ? input.products.map((p) => parseInt(String(p), 10)).filter((id) => !isNaN(id))
    : undefined;

  return {
    title: input.title?.trim(),
    description: input.description?.trim(),
    products: numericProducts,
    start_date: input.startDate || undefined,
    end_date: input.endDate || undefined,
    is_active: input.isActive,
  };
}
